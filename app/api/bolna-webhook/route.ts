import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { scoreFrustration } from '@/lib/gemini';

interface ParsedTurn {
  speaker: string;
  text: string;
}

function parseTranscriptString(transcript: string): ParsedTurn[] {
  // Bolna sends transcript as a string with format:
  // "assistant: text\nuser: text\nassistant: text..."
  if (!transcript || typeof transcript !== 'string') return [];

  const turns: ParsedTurn[] = [];
  const lines = transcript.split('\n').filter((l) => l.trim().length > 0);

  for (const line of lines) {
    const match = line.match(/^(assistant|user|customer|human|agent):\s*(.+)$/i);
    if (match) {
      turns.push({
        speaker: match[1].toLowerCase(),
        text: match[2].trim(),
      });
    }
  }

  return turns;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[bolna-webhook] status:', body.status);

    // Bolna voice payload uses these field names
    const bolna_call_id =
      body.id || body.bolna_call_id || body.execution_id || body.conversation_id || null;

    const customer_phone =
      body.user_number || body.customer_phone || body.from_phone_number || body.from || null;

    const status_from_bolna = body.status || null;
    const transcript_str = body.transcript || null;
    const conversation_duration = body.conversation_duration || null;

    if (!bolna_call_id) {
      console.warn('[bolna-webhook] no call ID in payload, skipping');
      return NextResponse.json({ success: true, skipped: 'no_call_id' });
    }

    // Find or create the call
    let call_id: string | null = null;
    const { data: existing } = await supabase
      .from('calls')
      .select('id')
      .eq('bolna_call_id', String(bolna_call_id))
      .maybeSingle();

    if (existing) {
      call_id = existing.id;
    } else {
      const { data: newCall, error: insertErr } = await supabase
        .from('calls')
        .insert({
          bolna_call_id: String(bolna_call_id),
          customer_phone: customer_phone || null,
          status: 'in_progress',
        })
        .select('id')
        .single();
      if (insertErr) {
        console.error('[bolna-webhook] failed to create call:', insertErr);
      }
      call_id = newCall?.id || null;
    }

    // Update phone if we got it
    if (call_id && customer_phone) {
      await supabase.from('calls').update({ customer_phone }).eq('id', call_id);
    }

    // Only process the transcript on call-end (status: completed/call-disconnected)
    const isCallEnd =
      status_from_bolna === 'completed' ||
      status_from_bolna === 'call-disconnected' ||
      status_from_bolna === 'call_ended' ||
      status_from_bolna === 'call_end';

    if (!isCallEnd || !transcript_str) {
      // Just update status & return — call is mid-flight or no transcript
      if (call_id) {
        await supabase
          .from('calls')
          .update({ status: status_from_bolna || 'in_progress' })
          .eq('id', call_id);
      }
      return NextResponse.json({
        success: true,
        call_id,
        status: status_from_bolna,
        note: 'mid-call event, transcript not yet available',
      });
    }

    // Parse the transcript string into turns
    const turns = parseTranscriptString(transcript_str);
    console.log(`[bolna-webhook] parsed ${turns.length} turns from transcript`);

    if (turns.length === 0 || !call_id) {
      return NextResponse.json({
        success: true,
        call_id,
        note: 'no turns parsed',
      });
    }

    // Check if we already have transcripts for this call (avoid duplicates on retry)
    const { count: existingCount } = await supabase
      .from('transcripts')
      .select('id', { count: 'exact', head: true })
      .eq('call_id', call_id);

    if ((existingCount || 0) > 0) {
      console.log(
        '[bolna-webhook] transcripts already exist for this call, updating call status only'
      );
      await supabase
        .from('calls')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
        })
        .eq('id', call_id);
      return NextResponse.json({ success: true, call_id, note: 'already processed' });
    }

    // Score and insert each turn
    let maxFrustration = 0;
    const conversationHistorySoFar: string[] = [];

    for (const turn of turns) {
      const isUser =
        turn.speaker === 'user' || turn.speaker === 'customer' || turn.speaker === 'human';

      let frustrationScore: number | null = null;
      let frustrationSignals: object | null = null;

      if (isUser && turn.text) {
        try {
          const result = await scoreFrustration(turn.text, conversationHistorySoFar.join('\n'));
          frustrationScore = result.score;
          frustrationSignals = {
            signals: result.signals,
            reasoning: result.reasoning,
          };
          if (frustrationScore > maxFrustration) maxFrustration = frustrationScore;
        } catch (e) {
          console.error('[bolna-webhook] scoring failed for turn:', e);
        }
      }

      await supabase.from('transcripts').insert({
        call_id,
        speaker: turn.speaker,
        text: turn.text,
        frustration_score: frustrationScore,
        frustration_signals: frustrationSignals,
      });

      conversationHistorySoFar.push(`${turn.speaker}: ${turn.text}`);
    }

    // Final call update
    await supabase
      .from('calls')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        max_frustration_score: maxFrustration,
        outcome: maxFrustration >= 7 ? 'high_frustration' : 'resolved',
      })
      .eq('id', call_id);

    return NextResponse.json({
      success: true,
      call_id,
      turns_processed: turns.length,
      max_frustration_score: maxFrustration,
      escalation_recommended: maxFrustration >= 7,
    });
  } catch (e) {
    console.error('[bolna-webhook] handler error:', e);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Bolna webhook is live',
    timestamp: new Date().toISOString(),
  });
}
