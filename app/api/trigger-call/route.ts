import { NextRequest, NextResponse } from 'next/server'; 
 
const BOLNA_API_URL = 'https://api.bolna.ai/call'; 
 
function normalizePhone(input: string): string { 
 let phone = input.replace(/[^\d+]/g, '').trim(); 
 
 if (!phone.startsWith('+')) { 
   const digits = phone.replace(/\D/g, ''); 
   if (digits.length === 10) { 
     phone = '+91' + digits; 
   } else if (digits.length === 12 && digits.startsWith('91')) { 
     phone = '+' + digits; 
   } else if (digits.length === 11 && digits.startsWith('0')) { 
     phone = '+91' + digits.slice(1); 
   } else { 
     phone = '+' + digits; 
   } 
 } 
 
 return phone; 
} 
 
function isValidIndianPhone(phone: string): boolean { 
 return /^\+91[6-9]\d{9}$/.test(phone); 
} 
 
export async function POST(req: NextRequest) { 
 try { 
   const body = await req.json(); 
   const phone_input = body.phone_number || body.phone || ''; 
 
   if (!phone_input || typeof phone_input !== 'string') { 
     return NextResponse.json( 
       { success: false, error: 'phone_number is required' }, 
       { status: 400 } 
     ); 
   } 
 
   const phone = normalizePhone(phone_input); 
 
   if (!isValidIndianPhone(phone)) { 
     return NextResponse.json( 
       { 
         success: false, 
         error: 'Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)', 
         received: phone, 
       }, 
       { status: 400 } 
     ); 
   } 
 
   const apiKey = process.env.BOLNA_API_KEY; 
   const agentId = process.env.ATHENA_AGENT_ID; 
 
   if (!apiKey || !agentId) { 
     console.error('[trigger-call] Missing BOLNA_API_KEY or ATHENA_AGENT_ID env vars'); 
     return NextResponse.json( 
       { 
         success: false, 
         error: 'Service temporarily unavailable. Please try again later.', 
       }, 
       { status: 503 } 
     ); 
   } 
 
   console.log('[trigger-call] initiating call to', phone); 
 
   const bolnaRes = await fetch(BOLNA_API_URL, { 
     method: 'POST', 
     headers: { 
       Authorization: `Bearer ${apiKey}`, 
       'Content-Type': 'application/json', 
     }, 
     body: JSON.stringify({ 
       agent_id: agentId, 
       recipient_phone_number: phone, 
     }), 
   }); 
 
   const bolnaData = await bolnaRes.json().catch(() => ({})); 
   console.log('[trigger-call] Bolna responded:', bolnaRes.status, JSON.stringify(bolnaData)); 
 
   if (!bolnaRes.ok) { 
     const errorMsg = 
       bolnaData?.message || 
       bolnaData?.error || 
       bolnaData?.detail || 
       `Bolna API returned ${bolnaRes.status}`; 
 
     return NextResponse.json( 
       { 
         success: false, 
         error: errorMsg, 
         bolna_status: bolnaRes.status, 
       }, 
       { status: 502 } 
     ); 
   } 
 
   return NextResponse.json({ 
     success: true, 
     message: 'Call initiated. You should receive a call within 5-10 seconds.', 
     phone, 
     execution_id: bolnaData.execution_id || bolnaData.id || null, 
   }); 
 } catch (e) { 
   console.error('[trigger-call] handler error:', e); 
   return NextResponse.json( 
     { success: false, error: 'Internal error' }, 
     { status: 500 } 
   ); 
 } 
} 
 
export async function GET() { 
 return NextResponse.json({ 
   status: 'Trigger-call endpoint is live', 
   timestamp: new Date().toISOString(), 
 }); 
} 
 