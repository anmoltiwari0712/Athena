import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    console.log('[process-refund] resolved params:', JSON.stringify(params));

    const order_id = params.order_id || params.orderId || params.order;
    const rawAmount = params.amount ?? params.refund_amount;
    const reason = params.reason || params.refund_reason;
    const call_id = params.call_id || params.bolna_call_id || null;

    if (!order_id || rawAmount === undefined || rawAmount === null || rawAmount === '' || !reason) {
      console.error('[process-refund] missing fields. got:', { order_id, rawAmount, reason });
      return NextResponse.json(
        { success: false, error: 'order_id, amount, and reason are required', received: params },
        { status: 400 }
      );
    }

    const amount = Number(rawAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'amount must be a positive number' },
        { status: 400 }
      );
    }

    const { data: order } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('id', order_id)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (amount > Number(order.total_amount)) {
      return NextResponse.json(
        { success: false, error: 'Refund cannot exceed order amount' },
        { status: 400 }
      );
    }

    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .insert({
        order_id,
        call_id,
        amount,
        reason: String(reason),
        status: 'processed',
      })
      .select()
      .single();

    if (refundError) {
      console.error('[process-refund] insert error:', refundError);
      return NextResponse.json(
        { success: false, error: 'Failed to process refund' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      refund_id: refund.id,
      message: `Refund of Rs.${amount} processed successfully. SMS confirmation will be sent shortly.`,
      processed_at: refund.created_at,
    });
  } catch (e) {
    console.error('[process-refund] handler error:', e);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
