'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      <nav className="border-b border-white/10 backdrop-blur-md sticky top-0 z-10 bg-slate-950/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
              A
            </div>
            <span className="font-semibold text-lg">Athena</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-300">
            <Link href="/calls" className="hover:text-white transition">
              Live Calls
            </Link>
            <Link href="/history" className="hover:text-white transition">
              History
            </Link>
            <Link href="/agent-console" className="hover:text-white transition">
              Agent Console
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Emotion-aware Voice AI for Indian Customer Support
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-br from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
          Athena
        </h1>

        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-4">
          A Hinglish voice agent that resolves refund complaints — and intelligently hands off to
          humans before customers churn.
        </p>

        <p className="text-sm text-slate-500 mb-12">
          Built on Bolna · Powered by Gemini · Live on Vercel
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/calls"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-blue-500/20"
          >
            View Live Dashboard →
          </Link>
          <Link
            href="/history"
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition"
          >
            See Past Calls
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Real-Time Refund Resolution',
              desc: 'Looks up orders, processes refunds, sends confirmations — all in conversation.',
              icon: '⚡',
            },
            {
              title: 'Frustration Detection',
              desc: 'Gemini AI scores every customer turn 1-10 for emotional state in real-time.',
              icon: '🎯',
            },
            {
              title: 'Smart Human Handoff',
              desc: 'Auto-escalates angry callers with a complete handoff summary for the human.',
              icon: '🤝',
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Why Athena</h2>
        <p className="text-slate-400 max-w-2xl mx-auto mb-12">
          Food delivery platforms in India process 15M+ orders daily. 2-3% have refund issues.
          Customer support phone queues take 15-30 minutes. 40% of frustrated customers churn
          silently.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { metric: '<3 min', label: 'avg resolution time' },
            { metric: '70%+', label: 'auto-resolved' },
            { metric: '₹15-20', label: 'cost per call' },
            { metric: '<15%', label: 'human handoff rate' },
          ].map((s, i) => (
            <div key={i} className="p-4">
              <div className="text-3xl font-bold bg-gradient-to-br from-blue-300 to-purple-300 bg-clip-text text-transparent">
                {s.metric}
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 mt-12 py-8 text-center text-sm text-slate-500">
        <p>Athena — built in 2 days. Powered by Bolna voice AI.</p>
      </footer>
    </main>
  );
}
