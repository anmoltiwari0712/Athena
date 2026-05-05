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
      const { data } = await supabaseBrowser
        .from('calls')
        .select('*')
        .order('started_at', { ascending: false });
      if (data) {
        const list = data as Call[];
        setCalls(list);
        const total = list.length;
        const escalated = list.filter((c) => c.was_escalated).length;
        const resolved = list.filter((c) => !c.was_escalated && c.status === 'completed').length;
        const avg =
          list.reduce((sum, c) => sum + (Number(c.max_frustration_score) || 0), 0) / (total || 1);
        setStats({ total, escalated, resolved, avgFrustration: avg });
      }
    };
    load();
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
            <Link href="/history" className="text-white">
              History
            </Link>
            <Link href="/agent-console" className="hover:text-white">
              Agent Console
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Call History</h1>
        <p className="text-slate-400 mb-8">All past conversations with Athena</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Calls', value: stats.total, color: 'from-blue-400 to-cyan-400' },
            { label: 'Escalated', value: stats.escalated, color: 'from-red-400 to-orange-400' },
            {
              label: 'Auto-Resolved',
              value: stats.resolved,
              color: 'from-green-400 to-emerald-400',
            },
            {
              label: 'Avg Frustration',
              value: stats.avgFrustration.toFixed(1),
              color: 'from-yellow-400 to-amber-400',
            },
          ].map((s, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{s.label}</div>
              <div
                className={`text-3xl font-bold bg-gradient-to-br ${s.color} bg-clip-text text-transparent`}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-slate-400 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Frustration</th>
                <th className="text-left px-4 py-3">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {calls.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No calls yet.
                  </td>
                </tr>
              )}
              {calls.map((c) => (
                <tr key={c.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-xs">{c.customer_phone || '—'}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(c.started_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${c.was_escalated ? 'bg-red-500/20 text-red-300' : c.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'}`}
                    >
                      {c.was_escalated ? 'escalated' : c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.max_frustration_score !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full ${Number(c.max_frustration_score) >= 7 ? 'bg-red-500' : Number(c.max_frustration_score) >= 5 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${Number(c.max_frustration_score) * 10}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs">
                          {Number(c.max_frustration_score).toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{c.outcome || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
