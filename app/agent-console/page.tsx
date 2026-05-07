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
    <main className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <nav className="border-b border-slate-200 sticky top-0 z-50 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Athena</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
            <Link href="/chat" className="hover:text-slate-900 transition">
              Chat Widget
            </Link>
            <Link href="/voice" className="hover:text-slate-900 transition">
              Voice IVR
            </Link>
            <Link href="/calls" className="hover:text-slate-900 transition">
              Live Calls
            </Link>
            <Link href="/history" className="hover:text-slate-900 transition">
              Analytics
            </Link>
            <Link href="/agent-console" className="text-slate-900 font-semibold">
              Agent Console
            </Link>
          </div>
          <Link
            href="/voice"
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            Get a call →
          </Link>
        </div>
      </nav>

      {/* Header strip */}
      <div className="bg-gradient-to-br from-red-950 via-slate-950 to-orange-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-red-300 font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Human-in-the-Loop · Senior Agent Console
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Where AI hands off, humans pick up
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mb-2">
            When Athena escalates, this is the screen your senior CX agent opens. Frustration score,
            AI-generated handoff summary, full conversation context — already loaded. They walk into
            the call already informed.
          </p>
          <p className="text-xs text-slate-400 italic mt-4">
            The 5% of cases that need a human get one — and they get one ready to win the customer
            back.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Queue */}
          <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Escalation Queue
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Newest at top</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
                  {escalations.length}
                </span>
              </div>

              {escalations.length === 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-sm text-center">
                  No escalations in queue. When Athena hands off a call, it appears here in
                  real-time — your agents see it the second it lands.
                </div>
              )}

              <div className="space-y-2">
                {escalations.map((e) => {
                  const isActive = active?.id === e.id;
                  const level = e.frustration_level ? Number(e.frustration_level) : 0;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setActive(e)}
                      className={`w-full text-left p-4 rounded-xl border transition ${
                        isActive
                          ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold uppercase tracking-wider">
                          Urgent
                        </span>
                        {level > 0 && (
                          <span className="text-xs font-mono font-bold text-red-700">
                            {level.toFixed(1)}/10
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-slate-900 mb-1 line-clamp-2 leading-snug">
                        {e.reason}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(e.created_at).toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Active escalation detail */}
          <section>
            {active ? (
              <div className="space-y-5">
                {/* Top card */}
                <div className="rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wider text-red-700 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Incoming Escalation · Customer Waiting
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                        {active.reason}
                      </h2>
                      <div className="text-xs text-slate-500 mt-1.5">
                        Handoff received {new Date(active.created_at).toLocaleString()}
                      </div>
                    </div>
                    {active.frustration_level !== null && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Frustration
                        </div>
                        <div className="text-4xl font-bold font-mono text-red-700">
                          {Number(active.frustration_level).toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-red-200">
                    <button className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold text-sm hover:opacity-90 transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2">
                      <span>📞</span>
                      Accept &amp; Take Over
                    </button>
                    <button className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition">
                      Pass to teammate
                    </button>
                  </div>
                </div>

                {/* Handoff summary */}
                {active.handoff_summary && (
                  <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <span>🤖</span>
                          AI-Generated Handoff Summary
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Read this before you pick up the call
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                        Powered by Gemini
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-mono">
                        {active.handoff_summary}
                      </div>
                    </div>
                  </div>
                )}

                {/* Conversation context */}
                {active.conversation_summary && (
                  <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                      <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <span>💬</span>
                        Conversation Context
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        What Athena already discussed with the customer
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {active.conversation_summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick actions */}
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    Suggested next steps
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: '💰', label: 'Process full refund' },
                      { icon: '🎁', label: 'Offer credits + apology' },
                      { icon: '📝', label: 'Add internal note' },
                      { icon: '✓', label: 'Mark as resolved' },
                    ].map((a) => (
                      <button
                        key={a.label}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition"
                      >
                        <span>{a.icon}</span>
                        <span>{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-16 rounded-2xl bg-white border border-slate-200 text-center text-slate-500">
                Select an escalation from the queue to view the AI handoff summary and accept the
                customer.
              </div>
            )}
          </section>
        </div>

        {/* What this enables */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-3">
              Why this matters
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
              Your senior agents stay senior
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              No more burning out top-tier humans on routine refund tickets. They only see the cases
              that genuinely need their judgment — and they walk in already informed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-white border border-slate-200">
              <div className="text-2xl mb-3">⏱️</div>
              <div className="font-semibold text-slate-900 mb-2">Zero context loss</div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Your agent reads the AI handoff in 15 seconds. No &ldquo;sorry, can you start from
                the beginning?&rdquo; No customer telling their story for the third time.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200">
              <div className="text-2xl mb-3">🎯</div>
              <div className="font-semibold text-slate-900 mb-2">Pre-suggested resolutions</div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Athena recommends what would close the case — full refund, credits, replacement.
                Your agent approves or overrides. Decision time drops to seconds.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200">
              <div className="text-2xl mb-3">🛡️</div>
              <div className="font-semibold text-slate-900 mb-2">
                Better outcomes for the customer
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Frustrated customers get the right person in under a minute, with someone who
                already knows what&apos;s wrong. Recovery NPS goes from negative to positive.
              </p>
            </div>
          </div>
        </div>

        {/* Closing CTA */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="font-semibold mb-1">Want to see Athena handle a real escalation?</div>
            <p className="text-sm text-slate-400">
              Get a call. Get angry. Watch this exact screen update in real-time as the handoff
              lands.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/calls"
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-sm font-medium text-white hover:bg-white/20 transition"
            >
              View live calls
            </Link>
            <Link
              href="/voice"
              className="px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:opacity-90 transition"
            >
              Trigger a real escalation →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
