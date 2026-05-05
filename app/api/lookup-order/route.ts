import { NextRequest, NextResponse } from 'next/server'; 

import { supabase } from '@/lib/supabase'; 

  

export async function POST(req: NextRequest) { 

  try { 

    const body = await req.json(); 

    const phone = body.phone_number || body.phone || body.customer_phone; 

  

    if (!phone) { 

      return NextResponse.json( 

        { success: false, error: 'phone_number is required' }, 

        { status: 400 } 

      ); 

    } 

  

    // Normalize phone — strip spaces, ensure +91 prefix if Indian 10-digit 

    let normalizedPhone = phone.toString().trim().replace(/\s+/g, ''); 

    if (!normalizedPhone.startsWith('+')) { 

      const digits = normalizedPhone.replace(/\D/g, ''); 

      if (digits.length === 10) { 

        normalizedPhone = '+91' + digits; 

      } else if (digits.length === 12 && digits.startsWith('91')) { 

        normalizedPhone = '+' + digits; 

      } else { 

        normalizedPhone = '+' + digits; 

      } 

    } 

  

    const { data, error } = await supabase 

      .from('orders') 

      .select('*') 

      .eq('customer_phone', normalizedPhone) 

      .order('order_date', { ascending: false }) 

      .limit(1) 

      .maybeSingle(); 

  

    if (error) { 

      console.error('Supabase error:', error); 

      return NextResponse.json( 

        { success: false, error: 'Database error' }, 

        { status: 500 } 

      ); 

    } 

  

    if (!data) { 

      return NextResponse.json({ 

        success: false, 

        message: 'No recent order found for this phone number', 

      }); 

    } 

  

    return NextResponse.json({ 

      success: true, 

      order: { 

        order_id: data.id, 

        customer_name: data.customer_name, 

        restaurant: data.restaurant_name, 

        items: data.items, 

        total_amount: data.total_amount, 

        order_date: data.order_date, 

        status: data.delivery_status, 

      }, 

    }); 

  } catch (e) { 

    console.error('Handler error:', e); 

    return NextResponse.json( 

      { success: false, error: 'Internal error' }, 

      { status: 500 } 

    ); 

  } 

} 