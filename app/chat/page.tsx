
'use client'; 
 
import { useState, useEffect, useRef } from 'react'; 
import Link from 'next/link'; 
 
interface Message { 
 role: 'user' | 'assistant'; 
 content: string; 
 toolsCalled?: string[]; 
 timestamp?: string; 
} 
 
const WELCOME: Message = { 
 role: 'assistant', 
 content: 
   'Namaste, main Athena hoon, customer support se. Main aapki order ya refund se related koi bhi issue solve karne mein madad kar sakti hoon. Kripya batayein, main aapki kaise sahayata kar sakti hoon?', 
 timestamp: new Date().toISOString(), 
}; 
 
export default function ChatPage() { 
 const [messages, setMessages] = useState<Message[]>([WELCOME]); 
 const [input, setInput] = useState(''); 
 const [loading, setLoading] = useState(false); 
 const [toolsActivity, setToolsActivity] = useState<{ name: string; ts: string }[]>([]); 
 const scrollRef = useRef<HTMLDivElement>(null); 
 const inputRef = useRef<HTMLInputElement>(null); 
 
 useEffect(() => { 
   scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); 
 }, [messages, loading]); 
 
 useEffect(() => { 
   inputRef.current?.focus(); 
 }, []); 
 
 const handleSend = async () => { 
   const text = input.trim(); 
   if (!text || loading) return; 
 
   const userMsg: Message = { role: 'user', content: text, timestamp: new Date().toISOString() }; 
   const newMessages = [...messages, userMsg]; 
   setMessages(newMessages); 
   setInput(''); 
   setLoading(true); 
 
   try { 
     const res = await fetch('/api/chat', { 
       method: 'POST', 
       headers: { 'Content-Type': 'application/json' }, 
       body: JSON.stringify({ 
         messages: newMessages.map((m) => ({ role: m.role, content: m.content })), 
       }), 
     }); 
 
     const data = await res.json(); 
     const ts = new Date().toISOString(); 
 
     if (data.success && data.reply) { 
       const tools: string[] = data.tools_called || []; 
       if (tools.length > 0) { 
         setToolsActivity((prev) => [ 
           ...tools.map((name) => ({ name, ts })), 
           ...prev, 
         ].slice(0, 8)); 
       } 
       setMessages((prev) => [ 
         ...prev, 
         { role: 'assistant', content: data.reply, toolsCalled: tools, timestamp: ts }, 
       ]); 
     } else { 
       setMessages((prev) => [ 
         ...prev, 
         { 
           role: 'assistant', 
           content: 
             'Mujhe khed hai, system mein kuch issue ho raha hai. Kripya thodi der baad try karein.', 
           timestamp: ts, 
         }, 
       ]); 
     } 
   } catch (e) { 
     console.error(e); 
     setMessages((prev) => [ 
       ...prev, 
       { 
         role: 'assistant', 
         content: 'Connection issue ho rahi hai. Kripya phir se try karein.', 
         timestamp: new Date().toISOString(), 
       }, 
     ]); 
   } finally { 
     setLoading(false); 
   } 
 }; 
 
 const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { 
   if (e.key === 'Enter' && !e.shiftKey) { 
     e.preventDefault(); 
     handleSend(); 
   } 
 }; 
 
 const resetChat = () => { 
   setMessages([{ ...WELCOME, timestamp: new Date().toISOString() }]); 
   setInput(''); 
   setToolsActivity([]); 
 }; 
 
 const quickStarters = [ 
   { text: 'Mera order galat aaya hai', icon: '🍱' }, 
   { text: 'I want a refund', icon: '💰' }, 
   { text: 'Order was cold', icon: '🥶' }, 
   { text: 'Speak to a human', icon: '🙋' }, 
 ]; 
 
 const formatTime = (ts?: string) => { 
   if (!ts) return ''; 
   const d = new Date(ts); 
   return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); 
 }; 
 
 const userMessageCount = messages.filter((m) => m.role === 'user').length; 
 
 return ( 
   <main className="min-h-screen bg-slate-50"> 
     {/* Top nav */} 
     <nav className="border-b border-slate-200 sticky top-0 z-50 bg-white/95 backdrop-blur-md"> 
       <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center"> 
         <Link href="/" className="flex items-center gap-2"> 
           <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">A</div> 
           <span className="font-bold text-lg tracking-tight text-slate-900">Athena</span> 
         </Link> 
 
         <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700"> 
           <Link href="/chat" className="text-slate-900 font-semibold">Chat Widget</Link> 
           <Link href="/voice" className="hover:text-slate-900 transition">Voice IVR</Link> 
           <Link href="/calls" className="hover:text-slate-900 transition">Live Calls</Link> 
           <Link href="/history" className="hover:text-slate-900 transition">Analytics</Link> 
           <Link href="/agent-console" className="hover:text-slate-900 transition">Agent Console</Link> 
         </div> 
 
         <Link href="/voice" className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"> 
           Get a call → 
         </Link> 
       </div> 
     </nav> 
 
     {/* Header strip */} 
     <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white"> 
       <div className="max-w-7xl mx-auto px-6 py-14"> 
         <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-blue-300 font-semibold mb-3"> 
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 
           Module 01 · Embeddable Chat Widget 
         </div> 
         <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3"> 
           The chat widget your customers will see 
         </h1> 
         <p className="text-lg text-slate-300 max-w-2xl mb-6"> 
           Drop Athena into your customer-facing app — Swiggy, Zomato, EatClub, anywhere — with three lines of code. Your customers chat, Athena resolves refunds, your CX team only sees what actually needs them. 
         </p> 
         <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md font-mono text-sm"> 
           <span className="text-emerald-300">$</span> 
           <span className="text-slate-200">&lt;script src=&quot;https://athena.ai/widget.js&quot; data-app=&quot;your_id&quot;&gt;&lt;/script&gt;</span> 
         </div> 
         <p className="text-xs text-slate-400 mt-3 italic"> 
           Same script tag whether you&apos;re a 1M-DAU food delivery app or a 50-DAU pilot. 
         </p> 
       </div> 
     </div> 
 
     <div className="max-w-7xl mx-auto px-6 py-10"> 
       <div className="grid lg:grid-cols-[280px_1fr_280px] gap-6"> 
         {/* Left sidebar */} 
         <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start"> 
           <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm"> 
             <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">How food delivery teams deploy this</div> 
             <ol className="space-y-2.5 text-sm text-slate-700"> 
               {[ 
                 { n: '1', t: 'Embed the widget', d: 'Single script tag in your app' }, 
                 { n: '2', t: 'Connect your order DB', d: 'Webhook into your refund flow' }, 
                 { n: '3', t: 'Customize tone & rules', d: 'Match your brand, your tiers' }, 
                 { n: '4', t: 'Go live', d: '70% of refund tickets auto-resolved' }, 
               ].map((s) => ( 
                 <li key={s.n} className="flex items-start gap-3"> 
                   <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"> 
                     {s.n} 
                   </div> 
                   <div> 
                     <div className="font-medium text-slate-900">{s.t}</div> 
                     <div className="text-xs text-slate-500">{s.d}</div> 
                   </div> 
                 </li> 
               ))} 
             </ol> 
           </div> 
 
           <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200"> 
             <div className="text-xs font-semibold uppercase tracking-wider text-purple-700 mb-2">Try this in the demo</div> 
             <p className="text-sm text-slate-700 leading-relaxed mb-3"> 
               Get visibly rude on your next message. Watch <strong>frustration detection</strong> auto-escalate to a human — exactly what would happen in your live app. 
             </p> 
             <p className="text-xs text-slate-600 italic"> 
               &ldquo;This is the third time I&apos;m calling. Manager NOW or I&apos;m going to consumer court.&rdquo; 
             </p> 
           </div> 
 
           <Link 
             href="/voice" 
             className="block p-5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition group" 
           > 
             <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Module 02</div> 
             <div className="font-bold mb-1 group-hover:translate-x-0.5 transition flex items-center gap-2"> 
               📞 Voice IVR Layer 
             </div> 
             <p className="text-xs text-slate-400 leading-relaxed"> 
               Same brain, picks up your support phone line. 
             </p> 
           </Link> 
         </aside> 
 
         {/* Center: Chat panel */} 
         <section className="flex flex-col rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden" style={{ minHeight: '75vh' }}> 
           <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-purple-50/50"> 
             <div className="flex items-center gap-3"> 
               <div className="relative"> 
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md"> 
                   A 
                 </div> 
                 <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" /> 
               </div> 
               <div> 
                 <div className="font-semibold text-slate-900 flex items-center gap-2"> 
                   Athena 
                   <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-medium uppercase tracking-wider">Online</span> 
                 </div> 
                 <div className="text-xs text-slate-500">Customer Support · Hinglish · Median resolution under 3 min</div> 
               </div> 
             </div> 
             <button 
               onClick={resetChat} 
               className="text-xs text-slate-500 hover:text-slate-900 transition px-3 py-1.5 rounded-lg hover:bg-slate-100 font-medium" 
             > 
               ↻ Reset 
             </button> 
           </div> 
 
           <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-slate-50/30"> 
             {messages.map((m, i) => ( 
               <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}> 
                 <div className={`max-w-[75%] flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}> 
                   {m.role === 'assistant' && ( 
                     <div className="flex items-center gap-2 mb-1.5"> 
                       <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]"> 
                         A 
                       </div> 
                       <span className="text-xs font-medium text-slate-600">Athena</span> 
                     </div> 
                   )} 
                   <div 
                     className={`px-5 py-3 rounded-2xl ${ 
                       m.role === 'user' 
                         ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-tr-md shadow-lg shadow-blue-500/20' 
                         : 'bg-white text-slate-900 rounded-tl-md shadow-sm border border-slate-100' 
                     }`} 
                   > 
                     <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.content}</div> 
                   </div> 
                   <div className="mt-1.5 flex items-center gap-2 px-1"> 
                     <span className="text-[10px] text-slate-400 font-mono">{formatTime(m.timestamp)}</span> 
                     {m.toolsCalled && m.toolsCalled.length > 0 && ( 
                       <div className="flex gap-1"> 
                         {m.toolsCalled.map((t, ti) => ( 
                           <span 
                             key={ti} 
                             className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-mono font-semibold" 
                           > 
                             ⚡ {t} 
                           </span> 
                         ))} 
                       </div> 
                     )} 
                   </div> 
                 </div> 
               </div> 
             ))} 
 
             {loading && ( 
               <div className="flex justify-start"> 
                 <div className="flex flex-col items-start"> 
                   <div className="flex items-center gap-2 mb-1.5"> 
                     <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]"> 
                       A 
                     </div> 
                     <span className="text-xs font-medium text-slate-600">Athena is thinking…</span> 
                   </div> 
                   <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-md shadow-sm border border-slate-100"> 
                     <div className="flex gap-1.5"> 
                       <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} /> 
                       <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} /> 
                       <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} /> 
                     </div> 
                   </div> 
                 </div> 
               </div> 
             )} 
           </div> 
 
           {messages.length <= 1 && !loading && ( 
             <div className="px-6 pb-2 border-t border-slate-100 pt-4 bg-slate-50/30"> 
               <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2.5">Quick starters</div> 
               <div className="flex gap-2 flex-wrap"> 
                 {quickStarters.map((s, i) => ( 
                   <button 
                     key={i} 
                     onClick={() => setInput(s.text)} 
                     className="text-sm px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition flex items-center gap-2" 
                   > 
                     <span>{s.icon}</span> 
                     <span>{s.text}</span> 
                   </button> 
                 ))} 
               </div> 
             </div> 
           )} 
 
           <div className="border-t border-slate-100 p-4 bg-white"> 
             <div className="flex gap-2 items-end"> 
               <div className="flex-1 relative"> 
                 <input 
                   ref={inputRef} 
                   value={input} 
                   onChange={(e) => setInput(e.target.value)} 
                   onKeyDown={handleKeyDown} 
                   disabled={loading} 
                   placeholder="Type in English, Hindi, or Hinglish..." 
                   className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-[15px] disabled:opacity-50 transition" 
                 /> 
               </div> 
               <button 
                 onClick={handleSend} 
                 disabled={loading || !input.trim()} 
                 className="px-6 py-3.5 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 flex items-center gap-2" 
               > 
                 Send 
                 <span className="text-base">→</span> 
               </button> 
             </div> 
             <div className="mt-2 flex justify-between items-center text-[11px] text-slate-400"> 
               <span>Press Enter to send · Shift+Enter for new line</span> 
               <span>Powered by Gemini · {userMessageCount} {userMessageCount === 1 ? 'message' : 'messages'} sent</span> 
             </div> 
           </div> 
         </section> 
 
         {/* Right sidebar */} 
         <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start"> 
           <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm"> 
             <div className="flex items-center justify-between mb-3"> 
               <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live tool activity</div> 
               <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-mono font-semibold"> 
                 {toolsActivity.length} 
               </span> 
             </div> 
 
             {toolsActivity.length === 0 ? ( 
               <div className="text-xs text-slate-400 italic py-4 text-center"> 
                 No tools called yet. Share your phone number to watch <code className="font-mono not-italic">lookup_order</code> fire — same flow that runs in your live app. 
               </div> 
             ) : ( 
               <ul className="space-y-2"> 
                 {toolsActivity.map((t, i) => ( 
                   <li 
                     key={i} 
                     className="flex items-center gap-2.5 p-2.5 rounded-lg bg-purple-50 border border-purple-100" 
                   > 
                     <div className="w-7 h-7 rounded-lg bg-purple-200 flex items-center justify-center text-purple-700 text-xs"> 
                       ⚡ 
                     </div> 
                     <div className="flex-1 min-w-0"> 
                       <div className="text-xs font-mono font-semibold text-slate-900 truncate"> 
                         {t.name} 
                       </div> 
                       <div className="text-[10px] text-slate-500">{formatTime(t.ts)}</div> 
                     </div> 
                   </li> 
                 ))} 
               </ul> 
             )} 
           </div> 
 
           <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm"> 
             <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Tools wired into your app</div> 
             <ul className="space-y-2 text-sm"> 
               {[ 
                 { name: 'lookup_order', desc: 'Hits your order DB' }, 
                 { name: 'process_refund', desc: 'Calls your refund API' }, 
                 { name: 'escalate_to_human', desc: 'Pings your CX team' }, 
               ].map((t) => ( 
                 <li key={t.name} className="flex items-center justify-between py-1.5"> 
                   <code className="text-xs font-mono text-slate-900">{t.name}</code> 
                   <span className="text-[10px] text-slate-500">{t.desc}</span> 
                 </li> 
               ))} 
             </ul> 
             <p className="text-[10px] text-slate-500 italic mt-3 leading-relaxed"> 
               Webhook-based. Adapts to whatever stack you run — REST, GraphQL, custom. 
             </p> 
           </div> 
 
           <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800"> 
             <div className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-3">For your CX team</div> 
             <p className="text-sm text-slate-300 mb-4 leading-relaxed"> 
               Every chat you&apos;d handle here writes to the same database your operations dashboard reads. One source of truth across all channels. 
             </p> 
             <Link 
               href="/calls" 
               className="text-sm font-semibold text-white hover:translate-x-0.5 inline-flex items-center gap-1 transition" 
             > 
               See operations dashboard → 
             </Link> 
           </div> 
         </aside> 
       </div> 
 
       {/* Integration anatomy */} 
       <div className="mt-16"> 
         <div className="text-center mb-12"> 
           <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Integration anatomy</p> 
           <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3"> 
             What goes into your codebase 
           </h2> 
           <p className="text-slate-600 max-w-2xl mx-auto"> 
             No SDKs to install. No models to fine-tune. Just a script tag and three webhooks. 
           </p> 
         </div> 
 
         <div className="grid md:grid-cols-3 gap-5 items-stretch"> 
           <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col"> 
             <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Step 1 · Frontend</div> 
             <h3 className="font-bold text-lg mb-3 text-black">One script tag</h3> 
             <pre className="flex-1 text-xs font-mono bg-slate-900 text-slate-100 border border-slate-800 rounded-lg p-4 overflow-x-auto leading-relaxed min-h-[160px] flex items-center whitespace-pre">{`<script 
 src="https://athena.ai/widget.js" 
 data-app="swiggy_prod" 
 data-theme="orange" 
></script>`}</pre> 
             <p className="text-xs text-slate-500 mt-3 leading-relaxed"> 
               Drops a floating support button in the corner of your app. Branded to match. 
             </p> 
           </div> 
 
           <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col"> 
             <div className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-3">Step 2 · Backend</div> 
             <h3 className="font-bold text-lg mb-3 text-black">Three webhooks</h3> 
             <pre className="flex-1 text-xs font-mono bg-slate-900 text-slate-100 border border-slate-800 rounded-lg p-4 overflow-x-auto leading-relaxed min-h-[160px] flex items-center whitespace-pre">{`POST /lookup-order 
POST /process-refund 
POST /escalate-to-cx`}</pre> 
             <p className="text-xs text-slate-500 mt-3 leading-relaxed"> 
               Athena calls these. You handle the business logic. We never store customer data. 
             </p> 
           </div> 
 
           <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col"> 
             <div className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">Step 3 · Operations</div> 
             <h3 className="font-bold text-lg mb-3 text-black">Dashboard URL</h3> 
             <pre className="flex-1 text-xs font-mono bg-slate-900 text-slate-100 border border-slate-800 rounded-lg p-4 overflow-x-auto leading-relaxed min-h-[160px] flex items-center whitespace-pre">{`https://athena.ai/ 
 ops/swiggy_prod`}</pre> 
             <p className="text-xs text-slate-500 mt-3 leading-relaxed"> 
               Your CX team logs in here. Live calls, escalation queue, frustration heat-map. 
             </p> 
           </div> 
         </div> 
       </div> 
 
       <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4"> 
         <div> 
           <div className="font-semibold text-slate-900 mb-1">This isn&apos;t a mockup — it&apos;s the real widget</div> 
           <p className="text-sm text-slate-600"> 
             The chat above writes to a real Supabase database. Tools call real production endpoints. What you experience is what your customers will. 
           </p> 
         </div> 
         <div className="flex gap-3"> 
           <Link href="/calls" className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-900 hover:border-blue-300 transition"> 
             View dashboard 
           </Link> 
           <Link href="/voice" className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"> 
             Try voice IVR → 
           </Link> 
         </div> 
       </div> 
     </div> 
   </main> 
 ); 
} 
 
