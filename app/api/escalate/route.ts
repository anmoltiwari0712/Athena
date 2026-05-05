import { NextRequest, NextResponse } from 'next/server'; 

import { supabase } from '@/lib/supabase'; 

  

export async function POST(req: NextRequest) { 

  try { 

    const body = await req.json(); 

    const { order_id, amount, reason, call_id } = body; 

  

    if (!order_id || !amount || !reason) { 

      return NextResponse.json( 

        { success: false, error: 'order_id, amount, and reason are required' }, 

        { status: 400 } 

      ); 

    } 

  

    const { data: order, error: orderError } = await supabase 

      .from('orders') 

      .select('total_amount') 

      .eq('id', order_id) 

      .maybeSingle(); 

  

    if (orderError || !order) { 

      return NextResponse.json( 

        { success: false, error: 'Order not found' }, 

        { status: 404 } 

      ); 

    } 

  

    if (Number(amount) > Number(order.total_amount)) { 

      return NextResponse.json( 

        { success: false, error: 'Refund cannot exceed order amount' }, 

        { status: 400 } 

      ); 

    } 

  

    const { data: refund, error: refundError } = await supabase 

      .from('refunds') 

      .insert({ 

        order_id, 

        call_id: call_id || null, 

        amount, 

        reason, 

        status: 'processed', 

      }) 

      .select() 

      .single(); 

  

    if (refundError) { 

      console.error('Refund insert error:', refundError); 

      return NextResponse.json( 

        { success: false, error: 'Failed to process refund' }, 

        { status: 500 } 

      ); 

    } 

  

    return NextResponse.json({ 

      success: true, 

      refund_id: refund.id, 

      message: `Refund of ₹${amount} processed successfully. SMS confirmation will be sent shortly.`, 

      processed_at: refund.created_at, 

    }); 

  } catch (e) { 

    console.error('Handler error:', e); 

    return NextResponse.json( 

      { success: false, error: 'Internal error' }, 

      { status: 500 } 

    ); 

  } 

} 