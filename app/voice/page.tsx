'use client';

import { useState } from 'react';
import Link from 'next/link';

type Status = 'idle' | 'calling' | 'success' | 'error';

export default function VoicePage() {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successPhone, setSuccessPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'calling') return;

    setStatus('calling');
    setErrorMsg('');

    try {
      const res = await fetch('/api/trigger-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setSuccessPhone(data.phone || phone);
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Failed to initiate call. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setStatus('error');
      setErrorMsg('Connection issue. Please try again.');
    }
  };

  const reset = () => {
    setStatus('idle');
    setErrorMsg('');
    setPhone('');
    setSuccessPhone('');
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ===== Top nav ===== */}
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
            <Link href="/voice" className="text-slate-900 font-semibold">
              Voice
            </Link>
            <Link href="/calls" className="hover:text-slate-900 transition">
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
            href="/chat"
            className="hidden sm:inline-block text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Try chat instead →
          </Link>
        </div>
      </nav>

      {/* ===== Header strip ===== */}
      <div className="bg-gradient-to-br from-purple-950 via-slate-950 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-purple-300 font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Channel · Phone Voice Call
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Get a call from Athena
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Enter your phone number and Athena will call you in 5–10 seconds. Hinglish voice. Real
            refund processing. Smart human handoff if frustration spikes.
          </p>
        </div>
      </div>

      {/* ===== Main area ===== */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[280px_1fr_280px] gap-6">
          {/* === Left sidebar: How it works === */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                How it works
              </div>
              <ol className="space-y-3 text-sm text-slate-700">
                {[
                  { n: '1', t: 'Enter your number', d: 'Indian mobile, no signup' },
                  { n: '2', t: 'Click Call Me', d: 'Athena dials within 5 sec' },
                  { n: '3', t: 'Pick up', d: 'Real Hinglish voice' },
                  { n: '4', t: 'Test the flow', d: 'Refund, complaint, escalation' },
                ].map((s) => (
                  <li key={s.n} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
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

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-2">
                Demo phone
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-2">
                For the test, give Athena phone{' '}
                <code className="font-mono bg-white px-1.5 py-0.5 rounded text-xs">
                  +919876543216
                </code>{' '}
                when she asks — that's the seeded ₹1800 sushi order.
              </p>
            </div>
          </aside>

          {/* === Center: Form / Status === */}
          <section className="rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden">
            {status === 'idle' && (
              <div className="p-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 text-white text-3xl mb-5 shadow-lg shadow-purple-500/30">
                    📞
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Where should we call?</h2>
                  <p className="text-slate-600 text-sm">
                    We'll dial you instantly. Indian mobile numbers only.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Your phone number
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base font-medium pointer-events-none">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        required
                        className="w-full pl-20 pr-4 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-lg font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      We never store your number. Used only to place this one call.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={!phone.trim()}
                    className="w-full px-6 py-4 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold text-base hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                  >
                    <span>📞</span>
                    Call me now
                  </button>

                  <p className="text-center text-xs text-slate-400 pt-2">
                    Free demo · 2-minute call · No signup required
                  </p>
                </form>
              </div>
            )}

            {status === 'calling' && (
              <div className="p-12 text-center">
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
                  <div
                    className="absolute inset-2 rounded-full bg-purple-500/30 animate-ping"
                    style={{ animationDelay: '300ms' }}
                  />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-3xl shadow-xl">
                    📞
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Connecting…</h2>
                <p className="text-slate-600 text-sm">Reaching Bolna to trigger the call</p>
              </div>
            )}

            {status === 'success' && (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white text-3xl mb-6 shadow-lg shadow-emerald-500/20">
                  ✓
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Call initiated!</h2>
                <p className="text-slate-600 text-sm mb-6">
                  Your phone{' '}
                  <span className="font-mono font-semibold text-slate-900">{successPhone}</span>{' '}
                  should ring within 5–10 seconds.
                </p>

                <div className="max-w-md mx-auto p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 mb-6 text-left">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-2">
                    When you pick up
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">→</span>
                      Athena will greet you in Hinglish
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">→</span>
                      Tell her you have a refund issue
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">→</span>
                      Use phone{' '}
                      <code className="font-mono bg-white px-1.5 py-0.5 rounded text-xs border border-slate-200">
                        +919876543216
                      </code>{' '}
                      when asked
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">→</span>
                      Try getting frustrated to test escalation
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3 justify-center flex-wrap">
                  <Link
                    href="/calls"
                    className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition"
                  >
                    Watch the dashboard live →
                  </Link>
                  <button
                    onClick={reset}
                    className="px-5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
                  >
                    Call again
                  </button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 text-3xl mb-6">
                  ⚠️
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Couldn't place the call</h2>
                <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">{errorMsg}</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button
                    onClick={reset}
                    className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition"
                  >
                    Try again
                  </button>
                  <Link
                    href="/chat"
                    className="px-5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
                  >
                    Try chat instead →
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* === Right sidebar: What happens during the call === */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                During the call
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  { icon: '🎯', t: 'Frustration scoring', d: 'Each turn rated 1-10 by Gemini' },
                  { icon: '🔧', t: 'Real tool calls', d: 'Refunds written to live DB' },
                  { icon: '🤝', t: 'Smart handoff', d: 'Auto-escalates if you get angry' },
                  { icon: '📝', t: 'Live transcript', d: 'See it on the dashboard' },
                ].map((f) => (
                  <li key={f.t} className="flex items-start gap-3">
                    <div className="text-lg flex-shrink-0">{f.icon}</div>
                    <div>
                      <div className="font-medium text-slate-900">{f.t}</div>
                      <div className="text-xs text-slate-500">{f.d}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-2">
                Powered by Bolna
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Athena uses Bolna's voice infrastructure for real telephony, ASR, and TTS — built
                for Indian languages.
              </p>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                {['Plivo', 'Deepgram', 'ElevenLabs', 'GPT-4.1'].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-white/10 text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* ===== Footer info ===== */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-slate-900 mb-1">
              This is a real phone call — costs ~₹8/min
            </div>
            <p className="text-sm text-slate-600">
              Bolna handles telephony · Indian numbers only · Demo limited to ~2 min per call
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/calls"
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-900 hover:border-blue-300 transition"
            >
              View dashboard
            </Link>
            <Link
              href="/chat"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
            >
              Try chat instead →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
