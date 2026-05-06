import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { scoreFrustration } from '@/lib/gemini';

interface TranscriptEntry {
  speaker?: string;
  role?: string;
  text?: string;
  content?: string;
  message?: string;
  timestamp?: string | number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[bolna-webhook RAW PAYLOAD]:', JSON.stringify(body, null, 2));

    // Bolna voice and chat send different payload shapes.
    // Try every common field name to extract what we need.
    const bolna_call_id =
      body.bolna_call_id ||
      body.execution_id ||
      body.id ||
      body.conversation_id ||
      body.call_id ||
      body.callId ||
      null;

    const customer_phone =
      body.customer_phone ||
      body.from_phone_number ||
      body.from ||
      body.caller ||
      body.phone_number ||
      null;

    const event_type =
      body.event_type || body.event || body.type || (body.transcript ? 'call_end' : null);

    // Handle two possible formats:
    // Format A (per-turn): { speaker, text, conversation_history }
    // Format B (post-call): { transcript: [{speaker, text}, ...] }
    const transcriptArray: TranscriptEntry[] | null = Array.isArray(body.transcript)
      ? body.transcript
      : Array.isArray(body.messages)
        ? body.messages
        : Array.isArray(body.conversation)
          ? body.conversation
          : null;

    // Find or create the call record
    let call_id: string | null = null;
    if (bolna_call_id) {
      const { data: existing } = await supabase
        .from('calls')
        .select('id, max_frustration_score')
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
    }

    let maxFrustration = 0;

    // ===== Path A: Post-call transcript array =====
    if (transcriptArray && transcriptArray.length > 0 && call_id) {
      console.log(`[bolna-webhook] processing transcript array of ${transcriptArray.length} turns`);

      const conversationHistorySoFar: string[] = [];

      for (const turn of transcriptArray) {
        const speaker = String(turn.speaker || turn.role || 'unknown').toLowerCase();
        const text = turn.text || turn.content || turn.message || '';

        if (!text || typeof text !== 'string') continue;

        const isUser = speaker === 'user' || speaker === 'customer' || speaker === 'human';

        let frustrationScore: number | null = null;
        let frustrationSignals: object | null = null;

        if (isUser) {
          try {
            const result = await scoreFrustration(text, conversationHistorySoFar.join('\n'));
            frustrationScore = result.score;
            frustrationSignals = {
              signals: result.signals,
              reasoning: result.reasoning,
            };
            if (frustrationScore > maxFrustration) maxFrustration = frustrationScore;
          } catch (e) {
            console.error('[bolna-webhook] scoring failed:', e);
          }
        }

        await supabase.from('transcripts').insert({
          call_id,
          speaker,
          text,
          frustration_score: frustrationScore,
          frustration_signals: frustrationSignals,
        });

        conversationHistorySoFar.push(`${speaker}: ${text}`);
      }

      // Update max frustration on call
      if (maxFrustration > 0) {
        await supabase
          .from('calls')
          .update({ max_frustration_score: maxFrustration })
          .eq('id', call_id);
      }

      // Mark call as completed
      await supabase
        .from('calls')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
        })
        .eq('id', call_id);

      return NextResponse.json({
        success: true,
        call_id,
        turns_processed: transcriptArray.length,
        max_frustration_score: maxFrustration,
        escalation_recommended: maxFrustration >= 7,
      });
    }

    // ===== Path B: Per-turn event (chat format / single utterance) =====
    const speaker = String(body.speaker || body.role || 'unknown').toLowerCase();
    const text = body.text || body.content || body.message || '';
    const conversation_history = body.conversation_history || '';

    let frustrationScore: number | null = null;
    let frustrationSignals: object | null = null;

    const isUser = speaker === 'user' || speaker === 'customer' || speaker === 'human';

    if (isUser && text && text.trim().length > 0) {
      try {
        const result = await scoreFrustration(text, conversation_history);
        frustrationScore = result.score;
        frustrationSignals = {
          signals: result.signals,
          reasoning: result.reasoning,
        };

        if (call_id) {
          const { data: currentCall } = await supabase
            .from('calls')
            .select('max_frustration_score')
            .eq('id', call_id)
            .maybeSingle();

          const currentMax = Number(currentCall?.max_frustration_score || 0);
          if (frustrationScore > currentMax) {
            await supabase
              .from('calls')
              .update({ max_frustration_score: frustrationScore })
              .eq('id', call_id);
          }
        }
      } catch (e) {
        console.error('[bolna-webhook] scoring failed:', e);
      }
    }

    if (call_id && text) {
      await supabase.from('transcripts').insert({
        call_id,
        speaker,
        text,
        frustration_score: frustrationScore,
        frustration_signals: frustrationSignals,
      });
    }

    if (event_type === 'call_end' || event_type === 'call_ended') {
      if (call_id) {
        await supabase
          .from('calls')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString(),
          })
          .eq('id', call_id);
      }
    }

    return NextResponse.json({
      success: true,
      call_id,
      frustration_score: frustrationScore,
      escalation_recommended: (frustrationScore || 0) >= 7,
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
