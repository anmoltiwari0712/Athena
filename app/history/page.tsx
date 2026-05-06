


'use client'; 
 
import { useEffect, useState } from 'react'; 
import { supabaseBrowser } from '@/lib/supabase-browser'; 
import Link from 'next/link'; 
 
interface Call { 
 id: string; 
 customer_phone: string | null; 
 status: string; 
 started_at: string; 
 ended_at: string | null; 
 outcome: string | null; 
 max_frustration_score: number | null; 
 was_escalated: boolean; 
} 
 
export default function HistoryPage() { 
 const [calls, setCalls] = useState<Call[]>([]); 
 const [stats, setStats] = useState({ total: 0, escalated: 0, resolved: 0, avgFrustration: 0 }); 
 
 useEffect(() => { 
   const load = async () => { 
     const { data } = await supabaseBrowser.from('calls').select('*').order('started_at', { ascending: false }); 
     if (data) { 
       const list = data as Call[]; 
       setCalls(list); 
       const total = list.length; 
       const escalated = list.filter((c) => c.was_escalated).length; 
       const resolved = list.filter((c) => !c.was_escalated && c.status === 'completed').length; 
       const avg = list.reduce((sum, c) => sum + (Number(c.max_frustration_score) || 0), 0) / (total || 1); 
       setStats({ total, escalated, resolved, avgFrustration: avg }); 
     } 
   }; 
   load(); 
 }, []); 
 
 const escalationRate = stats.total > 0 ? (stats.escalated / stats.total) * 100 : 0; 
 const resolutionRate = stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0; 
 
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
           <Link href="/chat" className="hover:text-slate-900 transition">Chat</Link> 
           <Link href="/voice" className="hover:text-slate-900 transition">Voice</Link> 
           <Link href="/calls" className="hover:text-slate-900 transition">Live Calls</Link> 
           <Link href="/history" className="text-slate-900 font-semibold">History</Link> 
           <Link href="/agent-console" className="hover:text-slate-900 transition">Agent Console</Link> 
         </div> 
         <Link href="/voice" className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"> 
           Get a call → 
         </Link> 
       </div> 
     </nav> 
 
     {/* Header strip */} 
     <div className="bg-gradient-to-br from-blue-950 via-slate-950 to-purple-950 text-white"> 
       <div className="max-w-7xl mx-auto px-6 py-12"> 
         <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-blue-300 font-semibold mb-3"> 
           <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> 
           Operations · Analytics 
         </div> 
         <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Call History</h1> 
         <p className="text-lg text-slate-300 max-w-2xl"> 
           Every conversation Athena has had — voice and chat. Track resolution rates, escalation patterns, and emotional trends across the customer base. 
         </p> 
       </div> 
     </div> 
 
     <div className="max-w-7xl mx-auto px-6 py-10 space-y-8"> 
       {/* Stats grid */} 
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> 
         {[ 
           { label: 'Total Calls', value: stats.total.toString(), color: 'from-blue-500 to-cyan-500', detail: 'Voice + Chat combined' }, 
           { label: 'Escalated', value: stats.escalated.toString(), color: 'from-red-500 to-orange-500', detail: `${escalationRate.toFixed(1)}% of total` }, 
           { label: 'Auto-Resolved', value: stats.resolved.toString(), color: 'from-emerald-500 to-green-500', detail: `${resolutionRate.toFixed(1)}% of total` }, 
           { label: 'Avg Frustration', value: stats.avgFrustration.toFixed(1), color: 'from-amber-500 to-yellow-500', detail: 'Out of 10' }, 
         ].map((s, i) => ( 
           <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm"> 
             <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{s.label}</div> 
             <div className={`text-4xl font-bold bg-gradient-to-br ${s.color} bg-clip-text text-transparent mb-1`}> 
               {s.value} 
             </div> 
             <div className="text-xs text-slate-500">{s.detail}</div> 
           </div> 
         ))} 
       </div> 
 
       {/* Calls table */} 
       <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden"> 
         <div className="p-5 border-b border-slate-100 flex items-center justify-between"> 
           <div> 
             <div className="text-sm font-semibold text-slate-900">All Conversations</div> 
             <div className="text-xs text-slate-500 mt-0.5">Sorted by most recent</div> 
           </div> 
           <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold"> 
             {calls.length} total 
           </span> 
         </div> 
 
         <div className="overflow-x-auto"> 
           <table className="w-full text-sm"> 
             <thead className="bg-slate-50 border-b border-slate-100"> 
               <tr> 
                 <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Phone</th> 
                 <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Time</th> 
                 <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th> 
                 <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Frustration</th> 
                 <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Outcome</th> 
               </tr> 
             </thead> 
             <tbody className="divide-y divide-slate-100"> 
               {calls.length === 0 && ( 
                 <tr> 
                   <td colSpan={5} className="text-center py-12 text-slate-500 text-sm"> 
                     No calls yet. Start by getting a voice call or chatting with Athena. 
                   </td> 
                 </tr> 
               )} 
               {calls.map((c) => { 
                 const score = c.max_frustration_score ? Number(c.max_frustration_score) : 0; 
                 return ( 
                   <tr key={c.id} className="hover:bg-slate-50 transition"> 
                     <td className="px-5 py-4 font-mono text-xs text-slate-700">{c.customer_phone || '—'}</td> 
                     <td className="px-5 py-4 text-slate-600 text-xs">{new Date(c.started_at).toLocaleString()}</td> 
                     <td className="px-5 py-4"> 
                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${ 
                         c.was_escalated 
                           ? 'bg-red-100 text-red-700' 
                           : c.status === 'completed' 
                           ? 'bg-emerald-100 text-emerald-700' 
                           : 'bg-slate-100 text-slate-600' 
                       }`}> 
                         {c.was_escalated ? 'Escalated' : c.status} 
                       </span> 
                     </td> 
                     <td className="px-5 py-4"> 
                       {c.max_frustration_score !== null ? ( 
                         <div className="flex items-center gap-2"> 
                           <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden"> 
                             <div 
                               className={`h-full ${score >= 7 ? 'bg-red-500' : score >= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                               style={{ width: `${score * 10}%` }} 
                             /> 
                           </div> 
                           <span className="font-mono text-xs font-semibold text-slate-700">{score.toFixed(1)}</span> 
                         </div> 
                       ) : '—'} 
                     </td> 
                     <td className="px-5 py-4 text-slate-600 text-xs">{c.outcome || '—'}</td> 
                   </tr> 
                 ); 
               })} 
             </tbody> 
           </table> 
         </div> 
       </div> 
     </div> 
   </main> 
 ); 
} 
 

