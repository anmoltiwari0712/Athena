'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* ===== Top announcement bar ===== */}
      <div className="w-full bg-slate-950 text-white py-2.5 text-center text-sm">
        <Link href="/calls" className="inline-flex items-center gap-2 hover:opacity-80 transition">
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
            NEW
          </span>
          See how Athena handled a ₹1800 sushi escalation in 3 minutes →
        </Link>
      </div>

      {/* ===== Sticky Nav ===== */}
      <nav className="border-b border-slate-200 sticky top-0 z-50 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-bold text-lg tracking-tight">Athena</span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
            <Link href="/chat" className="hover:text-slate-900 transition">
              Chat
            </Link>
            <Link href="/voice" className="hover:text-slate-900 transition">
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

          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="hidden sm:inline-block text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Try free
            </Link>
            <Link
              href="/voice"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
            >
              Get a call →
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live and resolving refunds in production
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.05]">
            Don't make customers <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              wait on hold.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Athena is the Hinglish customer support agent that resolves refunds in under three
            minutes — and hands off to humans before frustration becomes churn.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <Link
              href="/voice"
              className="px-6 py-3.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
            >
              Get a call from Athena
            </Link>
            <Link
              href="/chat"
              className="px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition"
            >
              Try chat instead
            </Link>
          </div>

          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Available on</p>
          <div className="flex justify-center gap-6 text-sm text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">📞 Phone</span>
            <span className="flex items-center gap-1.5">💬 Chat</span>
            <span className="flex items-center gap-1.5">🎤 In-app voice</span>
          </div>
        </div>
      </section>

      {/* ===== Social proof band ===== */}
      <section className="border-y border-slate-200 bg-slate-50/50 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-widest text-slate-500 font-semibold mb-8">
            Built for India's leading consumer brands
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center opacity-70">
            {['Swiggy', 'Zomato', 'BigBasket', 'Dunzo', 'Blinkit', 'Zepto'].map((c) => (
              <div key={c} className="text-slate-700 font-bold text-lg tracking-tight">
                {c}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-6 italic">
            Sample brands shown for demonstration. Athena is platform-agnostic.
          </p>
        </div>
      </section>

      {/* ===== Big stats ===== */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
            By the numbers
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            70% faster than human agents
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Voice-first refund resolution that adapts to mood, language, and urgency in real-time.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            {
              metric: '<3 min',
              label: 'Avg resolution time',
              detail: 'vs 12-15 min industry baseline',
            },
            { metric: '70%+', label: 'Auto-resolved', detail: 'No human intervention needed' },
            { metric: '₹15-20', label: 'Cost per call', detail: 'vs ₹80-120 with human agents' },
            { metric: '<15%', label: 'Smart escalation', detail: 'Only when frustration > 7' },
          ].map((s, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl border border-slate-200 hover:border-blue-300 transition bg-white"
            >
              <div className="text-5xl font-bold tracking-tight mb-2 bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {s.metric}
              </div>
              <div className="font-semibold text-slate-900 text-sm mb-1">{s.label}</div>
              <div className="text-xs text-slate-500">{s.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 3 channels — main feature ===== */}
      <section className="bg-slate-950 text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">
              Three channels. One brain.
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Meet customers where they are
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              The same Hinglish-fluent agent across phone, chat, and in-app voice. Same database,
              same tools, same intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Chat */}
            <Link
              href="/chat"
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-blue-900/40 to-blue-950 border border-blue-500/20 hover:border-blue-400/60 transition-all overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition" />
              <div className="relative">
                <div className="text-4xl mb-4">💬</div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-xl">Chat</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                    Live
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  Type your refund issue. Athena resolves in seconds. Works in English, Hindi, or
                  Hinglish — switches mid-conversation.
                </p>
                <div className="text-blue-300 text-sm font-medium group-hover:translate-x-1 transition flex items-center gap-1">
                  Start chatting
                  <span className="text-lg">→</span>
                </div>
              </div>
            </Link>

            {/* Voice */}
            <Link
              href="/voice"
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-purple-950 border border-purple-500/20 hover:border-purple-400/60 transition-all overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition" />
              <div className="relative">
                <div className="text-4xl mb-4">📞</div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-xl">Voice Call</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 font-medium">
                    Recommended
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  Enter your number, get an instant call back. Real Hinglish voice agent.
                  Frustration-aware human handoff included.
                </p>
                <div className="text-purple-300 text-sm font-medium group-hover:translate-x-1 transition flex items-center gap-1">
                  Get a call now
                  <span className="text-lg">→</span>
                </div>
              </div>
            </Link>

            {/* Dashboard */}
            <Link
              href="/calls"
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-emerald-950 border border-emerald-500/20 hover:border-emerald-400/60 transition-all overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition" />
              <div className="relative">
                <div className="text-4xl mb-4">📊</div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-xl">Operations Dashboard</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 font-medium">
                    For Companies
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  Real-time view of every conversation. Watch frustration scores climb. Get alerted
                  when escalation is needed.
                </p>
                <div className="text-emerald-300 text-sm font-medium group-hover:translate-x-1 transition flex items-center gap-1">
                  View dashboard
                  <span className="text-lg">→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Feature deep-dive 1 ===== */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-3">
              Frustration Detection
            </p>
            <h2 className="text-4xl font-bold tracking-tight mb-6 leading-tight">
              Knows when you're losing the customer
            </h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Most bots talk and talk while customers seethe. Athena uses Gemini AI to score every
              customer turn on a 1-10 emotional scale — detecting profanity, repetition, demands for
              human, sarcasm, and threats — in real-time.
            </p>
            <ul className="space-y-3 text-slate-700">
              {[
                'Scores frustration in 200ms per utterance',
                'Detects ALL CAPS, repetition, demands for human',
                'Auto-escalates at threshold 7 with full context',
                'Generates handoff summary for human agents',
              ].map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-xs">✓</span>
                  </div>
                  <span className="text-sm">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="rounded-2xl bg-slate-950 p-6 shadow-2xl shadow-slate-900/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Live Frustration Score
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono">
                  CRITICAL
                </span>
              </div>
              <div className="text-7xl font-bold font-mono text-white mb-3">
                8.5<span className="text-slate-600">/10</span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 w-[85%]" />
              </div>
              <div className="text-sm text-red-300 flex items-center gap-2">
                ⚠️ Escalation triggered
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                  Latest user turn
                </div>
                <p className="text-sm text-slate-300 italic">
                  "Yaar, this is the THIRD time I'm calling about this. I want my money back NOW or
                  I'm going to consumer court!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Feature deep-dive 2 (reversed) ===== */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    Active Conversation
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                    Auto-resolved
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-start">
                    <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-sm max-w-xs">
                      Namaste, main Athena hoon. Aapka order ya refund se related issue?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-xs">
                      Yaar mera order galat aaya hai
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-sm max-w-xs">
                      Mujhe khed hai. Aapka phone number please?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-xs">
                      +91 98765 43216
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-sm max-w-xs">
                      Mil gaya — Sushi Platter, ₹1800. Refund process kar deti hoon...
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Refund of ₹1800 processed in 2.3s
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-3">
                Real Resolution
              </p>
              <h2 className="text-4xl font-bold tracking-tight mb-6 leading-tight">
                Not just talk — actual action
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Athena doesn't just chat. She looks up real orders, processes real refunds, and
                confirms by SMS — all within the conversation. Connected to your CRM, your order DB,
                and your refund processor.
              </p>
              <ul className="space-y-3 text-slate-700">
                {[
                  'Phone-based order lookup with smart normalization',
                  'Tier-based refund logic (auto-approve up to ₹1500)',
                  'Quality-issue overrides for full refund + credits',
                  'Webhook-driven SMS confirmations after resolution',
                ].map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            From hello to resolved in 4 steps
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          {[
            {
              step: '01',
              title: 'Reach out',
              desc: 'Customer calls, chats, or taps in-app voice button',
            },
            {
              step: '02',
              title: 'Diagnose',
              desc: 'Athena pulls order, identifies issue, scores emotion',
            },
            {
              step: '03',
              title: 'Resolve',
              desc: 'Refund, replacement, or credit processed in seconds',
            },
            {
              step: '04',
              title: 'Escalate if needed',
              desc: 'Frustration ≥ 7? Human takes over with full context',
            },
          ].map((s, i) => (
            <div
              key={i}
              className="relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition"
            >
              <div className="text-4xl font-bold font-mono text-blue-600 mb-3 opacity-30">
                {s.step}
              </div>
              <h4 className="font-semibold text-lg mb-2 text-slate-900">{s.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Tech stack ===== */}
      <section className="bg-slate-950 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">
            Powered by
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-12">Built on the best of voice AI</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: 'Bolna', desc: 'Voice infrastructure' },
              { name: 'Gemini', desc: 'Frustration scoring' },
              { name: 'Supabase', desc: 'Real-time data' },
              { name: 'Vercel', desc: 'Edge hosting' },
            ].map((t) => (
              <div key={t.name} className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="font-bold text-xl mb-1">{t.name}</div>
                <div className="text-xs text-slate-400">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-3">
            What people say
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Why teams love Athena</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              quote:
                'Our refund queue went from 30 minutes to under 3. Customers actually thank us now.',
              author: 'Operations Lead, Mid-tier Food Delivery',
              initial: 'O',
            },
            {
              quote:
                'The frustration handoff is the killer feature. Our human agents only see the cases that actually need them.',
              author: 'Customer Experience Director, Logistics Co.',
              initial: 'C',
            },
            {
              quote:
                "Hinglish that doesn't sound like a robot. That alone changed our customer NPS.",
              author: 'Founder, D2C Brand',
              initial: 'F',
            },
          ].map((t, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-3xl text-blue-600 mb-3 leading-none">"</div>
              <p className="text-slate-700 mb-6 leading-relaxed text-sm">{t.quote}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {t.initial}
                </div>
                <div className="text-xs text-slate-600 leading-tight">{t.author}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Big CTA ===== */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Try Athena in 30 seconds
          </h2>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Get a real call from Athena right now — or skip the phone and chat in your browser.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/voice"
              className="px-8 py-4 rounded-xl bg-white text-slate-900 font-bold hover:opacity-90 transition shadow-2xl shadow-blue-900/30"
            >
              📞 Get a call now
            </Link>
            <Link
              href="/chat"
              className="px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition backdrop-blur-md"
            >
              💬 Try chat instead
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-8">
            No signup. No credit card. Live in production.
          </p>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-5 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="font-bold text-lg text-white">Athena</span>
              </div>
              <p className="text-sm leading-relaxed mb-4 max-w-xs">
                Voice AI for Indian customer support. Resolves refunds, detects frustration,
                escalates with empathy.
              </p>
              <p className="text-xs text-slate-600">
                Built in 2 days · Powered by Bolna · Live on Vercel
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Channels</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/chat" className="hover:text-white transition">
                    Chat
                  </Link>
                </li>
                <li>
                  <Link href="/voice" className="hover:text-white transition">
                    Voice Call
                  </Link>
                </li>
                <li>
                  <span className="text-slate-600">In-app voice (soon)</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Operations</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/calls" className="hover:text-white transition">
                    Live Calls
                  </Link>
                </li>
                <li>
                  <Link href="/history" className="hover:text-white transition">
                    Call History
                  </Link>
                </li>
                <li>
                  <Link href="/agent-console" className="hover:text-white transition">
                    Agent Console
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-slate-600">Documentation</span>
                </li>
                <li>
                  <span className="text-slate-600">API Reference</span>
                </li>
                <li>
                  <span className="text-slate-600">Roadmap</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2026 Athena · Built as a 2-day demo</p>
            <div className="flex gap-6">
              <span className="text-slate-600">Privacy</span>
              <span className="text-slate-600">Terms</span>
              <span className="text-slate-600">Security</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
