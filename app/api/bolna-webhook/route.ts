import { NextRequest, NextResponse } from 'next/server'; 

import { supabase } from '@/lib/supabase'; 

import { scoreFrustration } from '@/lib/gemini'; 

  

export async function POST(req: NextRequest) { 

  try { 

    const body = await req.json(); 

  

    // Bolna sends different event types — we focus on transcript events 

    const { 

      event_type, 

      bolna_call_id, 

      speaker, // 'user' or 'agent' / 'assistant' 

      text, 

      conversation_history, 

      customer_phone, 

    } = body; 

  

    // Find or create the call record 

    let call_id: string | null = null; 

    if (bolna_call_id) { 

      const { data: existing } = await supabase 

        .from('calls') 

        .select('id') 

        .eq('bolna_call_id', bolna_call_id) 

        .maybeSingle(); 

  

      if (existing) { 

        call_id = existing.id; 

      } else { 

        const { data: newCall } = await supabase 

          .from('calls') 

          .insert({ 

            bolna_call_id, 

            customer_phone: customer_phone || null, 

            status: 'in_progress', 

          }) 

          .select('id') 

          .single(); 

        call_id = newCall?.id || null; 

      } 

    } 

  

    // Only score frustration on USER utterances 

    let frustrationScore = null; 

    let frustrationSignals = null; 

  

    const isUserUtterance = 

      speaker === 'user' || speaker === 'customer' || speaker === 'human'; 

  

    if (isUserUtterance && text && text.trim().length > 0) { 

      const result = await scoreFrustration(text, conversation_history || ''); 

      frustrationScore = result.score; 

      frustrationSignals = { 

        signals: result.signals, 

        reasoning: result.reasoning, 

      }; 

  

      // Update max frustration score on the call 

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

    } 

  

    // Log the transcript 

    if (call_id && text) { 

      await supabase.from('transcripts').insert({ 

        call_id, 

        speaker: speaker || 'unknown', 

        text, 

        frustration_score: frustrationScore, 

        frustration_signals: frustrationSignals, 

      }); 

    } 

  

    // Handle call_end event 

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

    console.error('Webhook error:', e); 

    return NextResponse.json( 

      { success: false, error: 'Internal error' }, 

      { status: 500 } 

    ); 

  } 

} 

  

// Optional: GET handler for testing 

export async function GET() { 

  return NextResponse.json({ 

    status: 'Bolna webhook is live', 

    timestamp: new Date().toISOString(), 

  }); 

} 