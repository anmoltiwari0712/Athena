'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import Link from 'next/link';

interface Call {
  id: string;
  bolna_call_id: string | null;
  customer_phone: string | null;
  status: string;
  started_at: string;
  ended_at: string | null;
  outcome: string | null;
  max_frustration_score: number | null;
  was_escalated: boolean;
}

interface Transcript {
  id: string;
  call_id: string;
  speaker: string;
  text: string;
  frustration_score: number | null;
  timestamp: string;
}

export default function LiveCallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);

  useEffect(() => {
    const loadCalls = async () => {
      const { data } = await supabaseBrowser
        .from('calls')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);
      if (data) {
        setCalls(data as Call[]);
        if (data[0] && !activeCall) setActiveCall(data[0] as Call);
      }
    };
    loadCalls();

    const sub = supabaseBrowser
      .channel('calls-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calls' }, loadCalls)
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(sub);
    };
  }, []);

  useEffect(() => {
    if (!activeCall) return;
    const loadTranscripts = async () => {
      const { data } = await supabaseBrowser
        .from('transcripts')
        .select('*')
        .eq('call_id', activeCall.id)
        .order('timestamp', { ascending: true });
      if (data) setTranscripts(data as Transcript[]);
    };
    loadTranscripts();

    const sub = supabaseBrowser
      .channel(`transcripts-${activeCall.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transcripts',
          filter: `call_id=eq.${activeCall.id}`,
        },
        loadTranscripts
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(sub);
    };
  }, [activeCall]);

  const currentScore = activeCall?.max_frustration_score
    ? Number(activeCall.max_frustration_score)
    : 0;
  const scoreColor =
    currentScore >= 7
      ? 'from-red-500 to-orange-500'
      : currentScore >= 5
        ? 'from-yellow-500 to-orange-400'
        : 'from-emerald-500 to-green-500';
  const scoreLabel = currentScore >= 7 ? 'CRITICAL' : currentScore >= 5 ? 'ELEVATED' : 'CALM';
  const scoreBg =
    currentScore >= 7
      ? 'bg-red-100 text-red-700'
      : currentScore >= 5
        ? 'bg-amber-100 text-amber-700'
        : 'bg-emerald-100 text-emerald-700';

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
              Chat
            </Link>
            <Link href="/voice" className="hover:text-slate-900 transition">
              Voice
            </Link>
            <Link href="/calls" className="text-slate-900 font-semibold">
              Live Calls
            </Link>
            <Link href="/history" className="hover:text-slate-900 transition">
              History
            </Link>
            <Link href="/agent-console" className="hover:text-slate-900 transition">
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
      <div className="bg-gradient-to-br from-emerald-950 via-slate-950 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-blue-300 font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Operations Console · Analytics
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Call History & Analytics
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            The full conversation log across voice and chat. Track resolution rate, escalation rate,
            and frustration trajectory — the metrics that decide whether AI replaces or augments
            your support floor.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Recent calls list */}
          <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Recent Calls
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                  {calls.length}
                </span>
              </div>

              {calls.length === 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-sm text-center">
                  No calls yet. Start a chat or get a voice call to see them appear in real-time.
                </div>
              )}

              <div className="space-y-2">
                {calls.map((c) => {
                  const isActive = activeCall?.id === c.id;
                  const score = c.max_frustration_score ? Number(c.max_frustration_score) : 0;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveCall(c)}
                      className={`w-full text-left p-4 rounded-xl border transition ${
                        isActive
                          ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {c.customer_phone || 'Anonymous'}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                            c.status === 'in_progress'
                              ? 'bg-emerald-100 text-emerald-700'
                              : c.was_escalated
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {c.was_escalated ? 'Escalated' : c.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mb-2">
                        {new Date(c.started_at).toLocaleString()}
                      </div>
                      {c.max_frustration_score !== null && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${
                                score >= 7
                                  ? 'from-red-500 to-orange-500'
                                  : score >= 5
                                    ? 'from-yellow-500 to-orange-400'
                                    : 'from-emerald-500 to-green-500'
                              }`}
                              style={{ width: `${score * 10}%` }}
                            />
                          </div>
                          <div className="text-xs font-mono font-semibold text-slate-700 w-7 text-right">
                            {score.toFixed(1)}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main panel: active call detail */}
          <section className="space-y-6">
            {activeCall ? (
              <>
                {/* Frustration meter card */}
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                          Active Call · {activeCall.customer_phone || 'Anonymous'}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          ID: {activeCall.bolna_call_id || activeCall.id.slice(0, 8)}
                        </div>
                      </div>
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${scoreBg}`}
                      >
                        {scoreLabel}
                      </span>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-baseline justify-between mb-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Frustration Score
                      </div>
                      <div className="text-xs text-slate-500">Peak during call</div>
                    </div>
                    <div className="text-7xl font-bold font-mono text-slate-900 mb-4">
                      {currentScore.toFixed(1)}
                      <span className="text-slate-300">/10</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden mb-4">
                      <div
                        className={`h-full bg-gradient-to-r ${scoreColor} transition-all duration-700`}
                        style={{ width: `${currentScore * 10}%` }}
                      />
                    </div>
                    {currentScore >= 7 && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>
                          <strong>Escalation triggered</strong> — handed off to human agent
                        </span>
                      </div>
                    )}
                    {currentScore < 7 && currentScore >= 5 && (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center gap-2">
                        <span>⚡</span>
                        <span>Frustration elevated — monitoring closely</span>
                      </div>
                    )}
                    {currentScore < 5 && currentScore > 0 && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-center gap-2">
                        <span>✓</span>
                        <span>Customer remained calm throughout</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transcript card */}
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">Live Transcript</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                      {transcripts.length} turns
                    </span>
                  </div>
                  <div className="p-5 space-y-3 max-h-[600px] overflow-y-auto">
                    {transcripts.length === 0 && (
                      <div className="text-slate-500 text-sm text-center py-8">
                        No transcript available for this call yet.
                      </div>
                    )}
                    {transcripts.map((t) => {
                      const isUser =
                        t.speaker === 'user' || t.speaker === 'customer' || t.speaker === 'human';
                      const fScore = t.frustration_score ? Number(t.frustration_score) : null;
                      return (
                        <div
                          key={t.id}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${isUser ? 'order-2' : ''}`}>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 px-1 font-semibold">
                              {t.speaker}
                            </div>
                            <div
                              className={`px-4 py-3 rounded-2xl ${
                                isUser
                                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-tr-md'
                                  : 'bg-slate-100 text-slate-900 rounded-tl-md'
                              }`}
                            >
                              <div className="text-sm leading-relaxed">{t.text}</div>
                            </div>
                            {fScore !== null && isUser && (
                              <div className="mt-1.5 flex items-center gap-1.5 px-1">
                                <div className="text-[10px] text-slate-500">Frustration:</div>
                                <div
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                                    fScore >= 7
                                      ? 'bg-red-100 text-red-700'
                                      : fScore >= 5
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {fScore.toFixed(1)}/10
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-16 rounded-2xl bg-white border border-slate-200 text-center text-slate-500">
                Select a call from the left to view details.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
