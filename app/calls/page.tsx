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
        : 'from-green-500 to-emerald-400';
  const scoreLabel = currentScore >= 7 ? 'CRITICAL' : currentScore >= 5 ? 'ELEVATED' : 'CALM';

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
            <Link href="/calls" className="text-white">
              Live Calls
            </Link>
            <Link href="/history" className="hover:text-white">
              History
            </Link>
            <Link href="/agent-console" className="hover:text-white">
              Agent Console
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Live Call Dashboard</h1>
        <p className="text-slate-400 mb-8">
          Real-time conversation monitoring with emotion-aware escalation
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Recent Calls
            </h2>
            <div className="space-y-2">
              {calls.length === 0 && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-sm">
                  No calls yet. Start a chat with Athena to see it appear here in real-time.
                </div>
              )}
              {calls.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCall(c)}
                  className={`w-full text-left p-4 rounded-xl border transition ${activeCall?.id === c.id ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium">{c.customer_phone || 'Anonymous'}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'in_progress' ? 'bg-green-500/20 text-green-300' : c.was_escalated ? 'bg-red-500/20 text-red-300' : 'bg-slate-500/20 text-slate-300'}`}
                    >
                      {c.was_escalated ? 'escalated' : c.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(c.started_at).toLocaleString()}
                  </div>
                  {c.max_frustration_score !== null && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="text-xs text-slate-400">Peak:</div>
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${Number(c.max_frustration_score) >= 7 ? 'from-red-500 to-orange-500' : Number(c.max_frustration_score) >= 5 ? 'from-yellow-500 to-orange-400' : 'from-green-500 to-emerald-400'}`}
                          style={{ width: `${Number(c.max_frustration_score) * 10}%` }}
                        />
                      </div>
                      <div className="text-xs font-mono">
                        {Number(c.max_frustration_score).toFixed(1)}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {activeCall ? (
              <>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-slate-400 uppercase tracking-wide font-semibold">
                      Frustration Score
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-mono ${currentScore >= 7 ? 'bg-red-500/20 text-red-300' : currentScore >= 5 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}
                    >
                      {scoreLabel}
                    </span>
                  </div>
                  <div className="text-6xl font-bold font-mono mb-3">
                    {currentScore.toFixed(1)}
                    <span className="text-slate-600">/10</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${scoreColor} transition-all duration-700`}
                      style={{ width: `${currentScore * 10}%` }}
                    />
                  </div>
                  {currentScore >= 7 && (
                    <div className="mt-3 text-sm text-red-300 flex items-center gap-2">
                      ⚠️ Escalation threshold breached — handoff to human triggered
                    </div>
                  )}
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                    Live Transcript
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transcripts.length === 0 && (
                      <div className="text-slate-500 text-sm">
                        No transcript available yet for this call.
                      </div>
                    )}
                    {transcripts.map((t) => {
                      const isUser =
                        t.speaker === 'user' || t.speaker === 'customer' || t.speaker === 'human';
                      return (
                        <div
                          key={t.id}
                          className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-md p-3 rounded-2xl ${isUser ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white/5 border border-white/10'}`}
                          >
                            <div className="text-xs text-slate-400 mb-1 capitalize">
                              {t.speaker}
                            </div>
                            <div className="text-sm">{t.text}</div>
                            {t.frustration_score !== null && isUser && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="text-xs text-slate-500">frustration:</div>
                                <div
                                  className={`text-xs font-mono px-2 py-0.5 rounded ${Number(t.frustration_score) >= 7 ? 'bg-red-500/30 text-red-200' : Number(t.frustration_score) >= 5 ? 'bg-yellow-500/30 text-yellow-200' : 'bg-green-500/30 text-green-200'}`}
                                >
                                  {Number(t.frustration_score).toFixed(1)}
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
              <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center text-slate-500">
                No call selected
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
