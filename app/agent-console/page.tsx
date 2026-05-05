'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import Link from 'next/link';

interface Escalation {
  id: string;
  call_id: string | null;
  reason: string;
  frustration_level: number | null;
  conversation_summary: string | null;
  handoff_summary: string | null;
  created_at: string;
}

export default function AgentConsole() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [active, setActive] = useState<Escalation | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabaseBrowser
        .from('escalations')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        setEscalations(data as Escalation[]);
        if (data[0] && !active) setActive(data[0] as Escalation);
      }
    };
    load();

    const sub = supabaseBrowser
      .channel('escalations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escalations' }, load)
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(sub);
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10 sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm">
              A
            </div>
            <span className="font-semibold">Athena</span>
          </Link>
          <div className="flex gap-6 text-sm text-slate-300">
            <Link href="/calls" className="hover:text-white">
              Live Calls
            </Link>
            <Link href="/history" className="hover:text-white">
              History
            </Link>
            <Link href="/agent-console" className="text-white">
              Agent Console
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Human Agent Console</h1>
        <p className="text-slate-400 mb-8">
          When Athena escalates, this is what the human agent sees.
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Escalations Queue
            </h2>
            <div className="space-y-2">
              {escalations.length === 0 && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-sm">
                  No escalations yet.
                </div>
              )}
              {escalations.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setActive(e)}
                  className={`w-full text-left p-4 rounded-xl border transition ${active?.id === e.id ? 'bg-red-500/10 border-red-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                      URGENT
                    </span>
                    {e.frustration_level !== null && (
                      <span className="text-xs font-mono text-red-300">
                        {Number(e.frustration_level).toFixed(1)}/10
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium mb-1 line-clamp-2">{e.reason}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(e.created_at).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {active ? (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-red-950/30 to-slate-900 border border-red-500/20">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-xs text-red-400 uppercase tracking-wide font-semibold mb-1">
                      Incoming escalation
                    </div>
                    <h2 className="text-2xl font-bold">{active.reason}</h2>
                  </div>
                  {active.frustration_level !== null && (
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Frustration</div>
                      <div className="text-3xl font-mono font-bold text-red-400">
                        {Number(active.frustration_level).toFixed(1)}
                      </div>
                    </div>
                  )}
                </div>

                {active.handoff_summary && (
                  <div className="mb-6">
                    <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">
                      Handoff Summary
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 whitespace-pre-wrap text-sm">
                      {active.handoff_summary}
                    </div>
                  </div>
                )}

                {active.conversation_summary && (
                  <div className="mb-6">
                    <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">
                      Context from AI
                    </div>
                    <div className="text-sm text-slate-300">{active.conversation_summary}</div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 font-semibold hover:opacity-90 transition">
                    Accept Call
                  </button>
                  <button className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 font-semibold hover:bg-white/10 transition">
                    Pass
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center text-slate-500">
                No escalation selected
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
