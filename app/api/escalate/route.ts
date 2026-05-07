import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let body: Record<string, unknown> = {};

    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const params: Record<string, unknown> = { ...Object.fromEntries(url.searchParams), ...body };

    if (typeof params.param === 'object' && params.param !== null)
      Object.assign(params, params.param);
    if (typeof params.arguments === 'object' && params.arguments !== null)
      Object.assign(params, params.arguments);
    if (typeof params.parameters === 'object' && params.parameters !== null)
      Object.assign(params, params.parameters);

    console.log('[escalate] resolved params:', JSON.stringify(params));

    const reason = params.reason || params.escalation_reason || 'Customer requested escalation';
    const rawLevel = params.frustration_level ?? params.frustration ?? params.level;
    const conversation_summary =
      params.conversation_summary || params.summary || params.context || '';
    const call_id = params.call_id || params.bolna_call_id || null;

    let frustration_level: number | null = null;
    if (rawLevel !== undefined && rawLevel !== null && rawLevel !== '') {
      const num = Number(rawLevel);
      if (!isNaN(num)) frustration_level = num;
    }

    // Build a default handoff summary using available data — no AI needed
    const fallbackSummary = [
      `Reason: ${reason}`,
      `Frustration level: ${frustration_level ?? 'high'}/10`,
      conversation_summary ? `Context: ${conversation_summary}` : '',
      `Suggested approach: Acknowledge frustration, offer immediate resolution, escalate to senior staff if needed.`,
    ]
      .filter(Boolean)
      .join('\n');

    let handoffSummary: string = fallbackSummary;

    // Try to enhance with Gemini, but don't block on it
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Generate a 4-bullet handoff summary for a human agent. 
 
Reason: ${reason} 
Frustration: ${frustration_level ?? 'high'}/10 
Context: ${conversation_summary || 'See transcript'} 
 
Format (use exactly these bullets): 
- Customer wants: ... 
- What AI tried: ... 
- Why escalated: ... 
- Suggested approach: ... 
 
Be concise. Direct. Practical.`;

      const result = await model.generateContent(prompt);
      const aiText = result.response.text();
      if (aiText && aiText.length > 20) {
        handoffSummary = aiText;
      }
    } catch (e) {
      console.warn('[escalate] AI handoff summary failed, using fallback:', (e as Error).message);
    }

    const { data: escalation, error: escError } = await supabase
      .from('escalations')
      .insert({
        call_id,
        reason: String(reason),
        frustration_level,
        conversation_summary: conversation_summary ? String(conversation_summary) : null,
        handoff_summary: handoffSummary,
      })
      .select()
      .single();

    if (escError) {
      console.error('[escalate] insert error:', escError);
    }

    if (call_id) {
      await supabase
        .from('calls')
        .update({
          was_escalated: true,
          status: 'escalated',
          outcome: 'escalated_to_human',
        })
        .eq('id', call_id);
    }

    return NextResponse.json({
      success: true,
      escalation_id: escalation?.id,
      message: 'Call has been escalated. A senior agent will take over shortly.',
      handoff_summary: handoffSummary,
    });
  } catch (e) {
    console.error('[escalate] handler error:', e);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
