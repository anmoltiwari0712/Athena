<div align="center">

🛎️ Athena

The customer support agent that knows when to call in a human.

A multi-channel AI customer support platform built for India's food delivery and quick commerce platforms — Swiggy, Zomato, EatClub, Zepto, Blinkit, BigBasket.

Live Demo → · Get a real call → · Try the chat →

</div>

🎯 The Pitch in 30 Seconds

Most chatbots talk while customers boil over. Athena listens for the breaking point.

Every customer turn is scored 1-10 for frustration in real-time. Profanity, repetition, demands for human, sarcasm, threats to escalate to Twitter or consumer court — all detected. The moment frustration crosses 7, Athena hands off to your human team with a full AI-generated summary already prepared.

The result: 70% of refund tickets resolved without humans. The other 30% reach a senior agent who's already informed.

🧩 Three Modules. One Brain.

┌─────────────────────────────────────────────────────────────────────┐
│ ATHENA PLATFORM │
│ │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│ │ 💬 CHAT │ │ 📞 VOICE │ │ 📊 OPS DASHBOARD │ │
│ │ WIDGET │ │ IVR LAYER │ │ (LIVE / HISTORY / │ │
│ │ │ │ │ │ AGENT CONSOLE) │ │
│ │ Embed in │ │ Replace │ │ │ │
│ │ your app │ │ your IVR │ │ Watch frustration │ │
│ │ (3 lines │ │ (SIP │ │ scores live, take │ │
│ │ of code) │ │ forward) │ │ over with 1 click │ │
│ └──────┬───────┘ └──────┬───────┘ └──────────┬───────────┘ │
│ │ │ │ │
│ └───────────────────┴───────────────────────┘ │
│ │ │
│ ┌──────────────┴──────────────┐ │
│ │ SHARED ATHENA BRAIN │ │
│ │ • Hinglish-fluent persona │ │
│ │ • Real-time frustration │ │
│ │ scoring (1-10) │ │
│ │ • Tool execution layer │ │
│ │ (lookup / refund / esc) │ │
│ │ • Same Supabase backend │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

Module

What It Does

Audience

💬 Chat Widget

Drop-in chat bot for refund tickets. Embed via script tag.

End customers in your app

📞 Voice IVR Layer

Picks up support calls before humans need to.

End customers calling support

📊 Operations Dashboard

Live calls, analytics, escalation queue.

Your CX team & senior agents

⭐ The Killer Feature: Frustration Detection

This is the thing reviewers should remember.

Customer says: "Yaar, this is the THIRD time I'm calling.  
 I want my money back NOW or I'm going to consumer court!"

        ↓

Gemini scores it 8.5/10
↓  
 Threshold (7) breached
↓
Auto-handoff fires
↓
Senior agent screen lights up with:
• Reason for escalation
• Frustration score
• AI-generated handoff summary
• Suggested resolution

The signals Athena detects:

Signal

Example

Score impact

All-caps shouting

"I WANT MY MONEY NOW"

+2

Repetition

"third time I'm calling"

+2

Demands for human

"manager", "real person"

+3

External threats

"Twitter", "consumer court"

+3

Profanity

(you know the words)

+2

Sarcasm

"great service, really"

+1

When score ≥ 7, the system fires escalate_to_human() automatically.

🏛️ System Architecture

graph TB
subgraph "Customer Channels"
A[Customer Phone Call]
B[Customer Chat]
end

subgraph "Voice Layer · Bolna"
C[Athena Voice Agent]
D[ASR · Deepgram]
E[TTS · ElevenLabs]
F[LLM · GPT-4.1]
end

subgraph "Chat Layer · Custom"
G[Athena Chat Endpoint]
H[Gemini 2.5 Flash]
end

subgraph "Backend Tools"
I[lookup_order]
J[process_refund]
K[escalate_to_human]
end

subgraph "Data Layer · Supabase"
L[(orders)]
M[(calls)]
N[(transcripts)]
O[(refunds)]
P[(escalations)]
end

subgraph "Operations UI"
Q[Live Calls Dashboard]
R[Analytics & ROI]
S[Agent Console]
end

A --> C
B --> G
C --> D & E & F
C --> I & J & K
G --> H
G --> I & J & K
I --> L
J --> O
K --> P
C -.post-call webhook.-> M
C -.transcript.-> N
M --> Q & R
P --> S
N --> Q

style C fill:#a78bfa
style G fill:#60a5fa
style H fill:#fbbf24
style P fill:#ef4444

🛠️ Tech Stack & Why

Layer

Choice

Why this one

Voice telephony

Bolna

India-native voice AI platform. Plivo for telephony, Deepgram for ASR, ElevenLabs for TTS. Hinglish out of the box.

Voice LLM

GPT-4.1 mini

Routed via Bolna. Best at multi-turn tool calling for voice.

Chat LLM

Gemini 2.5 Flash

Free tier sufficient for demo, native function calling, fastest of the cheap models.

Frustration scoring

Gemini 2.5 Flash

Same model, separate prompt. Returns score + signal categories.

Database

Supabase

Postgres + real-time subscriptions + RLS. Lets the dashboard update live without polling.

Frontend

Next.js 15 (App Router) + TypeScript + Tailwind

Standard modern stack. Server components for the data fetches, client components for the interactive bits.

Hosting

Vercel

Zero-config, edge functions, auto-deploys from GitHub.

Honest call-out: Voice and chat use different LLMs underneath. We tried unifying on Bolna's chat API but it isn't externally exposed yet. Different runtimes, same persona prompt, same backend tools, same database. Net effect for the customer is identical — and architecturally this is actually how most real platforms work.

📂 Project Structure

athena/
├── app/ # Next.js App Router
│ ├── page.tsx # 🏠 Marketing landing
│ ├── chat/page.tsx # 💬 Chat widget surface
│ ├── voice/page.tsx # 📞 Voice request form
│ ├── calls/page.tsx # 📊 Live calls dashboard
│ ├── history/page.tsx # 📈 Analytics & ROI
│ ├── agent-console/page.tsx # 🚨 Escalation queue
│ └── api/
│ ├── lookup-order/ # Phone → order details
│ ├── process-refund/ # Issue refund + DB write
│ ├── escalate/ # Generate AI handoff summary
│ ├── bolna-webhook/ # Post-call ingestion
│ ├── chat/ # Gemini-backed chat
│ └── trigger-call/ # Outbound call via Bolna
├── lib/
│ ├── supabase.ts # Server-side client (service role)
│ ├── supabase-browser.ts # Browser client (anon key + RLS)
│ └── gemini.ts # Frustration scoring
└── README.md # You're reading it

🗃️ Database Schema

Five tables, all in Supabase Postgres:

-- The catalog
orders (
id uuid PRIMARY KEY,
customer_phone text, -- e.g. +919876543216
customer_name text,
restaurant_name text,
item_name text,
amount numeric, -- in rupees
ordered_at timestamp,
status text -- delivered / pending / refunded
)

-- One row per conversation (voice OR chat)
calls (
id uuid PRIMARY KEY,
bolna_call_id text, -- null for chat
customer_phone text,
status text, -- initiated / completed / escalated
started_at timestamp,
ended_at timestamp,
outcome text, -- resolved / escalated / dropped
max_frustration_score numeric, -- peak across all turns
was_escalated boolean
)

-- Every utterance, scored
transcripts (
id uuid PRIMARY KEY,
call_id uuid REFERENCES calls,
speaker text, -- assistant / user
text text,
frustration_score numeric, -- 1-10, only for user turns
frustration_signals jsonb, -- ["repetition", "all_caps", ...]
timestamp timestamp
)

-- Refund actions Athena took
refunds (
id uuid PRIMARY KEY,
order_id uuid REFERENCES orders,
call_id uuid REFERENCES calls,
amount numeric,
reason text, -- quality_issue / wrong_item / etc
status text, -- approved / pending / failed
created_at timestamp
)

-- Hand-off records for human agents
escalations (
id uuid PRIMARY KEY,
call_id uuid REFERENCES calls,
reason text, -- short reason
frustration_level numeric,
conversation_summary text, -- what happened so far
handoff_summary text, -- AI-generated bullets for agent
created_at timestamp
)

All tables have Row Level Security enabled with public-read policies (this is a demo). Real-time subscriptions enabled on calls, transcripts, and escalations so the dashboard updates without polling.

🔌 API Reference

Endpoint

Method

Purpose

/api/lookup-order

POST

Find order by phone number. Used by Athena during refund flow.

/api/process-refund

POST

Issue a refund; writes to refunds table.

/api/escalate

POST

Create escalation record + generate AI handoff summary via Gemini.

/api/bolna-webhook

POST

Receive post-call payload from Bolna; parses transcript, scores each user turn for frustration, populates calls and transcripts.

/api/chat

POST

Gemini-backed chat completion with tool execution loop.

/api/trigger-call

POST

Validate Indian phone number, call Bolna's /call API to initiate outbound call.

Sample request — lookup_order

curl -X POST https://athena-taupe.vercel.app/api/lookup-order \
-H "Content-Type: application/json" \
-d '{"phone_number": "+919876543216"}'

Response:

{
"success": true,
"order": {
"id": "...",
"customer_name": "Arjun Kumar",
"restaurant_name": "Premium Sushi Bar",
"item_name": "Sushi Platter",
"amount": 1800,
"status": "delivered"
}
}

Sample request — process_refund

curl -X POST https://athena-taupe.vercel.app/api/process-refund \
-H "Content-Type: application/json" \
-d '{
"order_id": "abc123",
"amount": 1800,
"reason": "quality_issue"
}'

🚀 Setup & Local Development

Prerequisites

Node.js 20+

A Supabase project (free tier works)

A Bolna account with an agent created

A Google AI Studio API key (Gemini 2.5 Flash)

1. Clone & install

git clone https://github.com/anmoltiwari0712/Athena.git
cd Athena
npm install

2. Set up environment variables

Create .env.local in the project root:

# Supabase

NEXT*PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable*...
SUPABASE*SERVICE_ROLE_KEY=sb_secret*...

# Gemini

GEMINI_API_KEY=AIzaSy...

# Bolna

BOLNA_API_KEY=your_bolna_api_key
ATHENA_AGENT_ID=7484628d-f846-4c67-875b-9edb5f31a8e5

3. Set up the database

In your Supabase SQL editor, create the 5 tables from the schema above. Add a few seed orders so Athena has something to look up:

INSERT INTO orders (customer_phone, customer_name, restaurant_name, item_name, amount, ordered_at, status) VALUES
('+919876543216', 'Arjun Kumar', 'Premium Sushi Bar', 'Sushi Platter', 1800, NOW(), 'delivered'),
('+919876543217', 'Priya Sharma', 'Biryani House', 'Hyderabadi Biryani', 450, NOW(), 'delivered'),
('+919876543218', 'Rahul Verma', 'Pizza Palace', 'Margherita Pizza', 599, NOW(), 'delivered');
-- add more as needed

Enable real-time on the relevant tables in Supabase Dashboard → Database → Replication.

4. Configure Bolna agent

In Bolna playground:

Create an agent named "Athena" (female Hinglish voice — we use ElevenLabs FaqthkZu1EWxXxUFbAfb)

Paste the Athena system prompt (see /docs/agent-prompt.md if you create that file)

Add the 3 tools: lookup_order, process_refund, escalate_to_human — pointing to your deployed endpoints

Set the post-call webhook to https://your-deployment.vercel.app/api/bolna-webhook

5. Run locally

npm run dev

Visit http://localhost:3000.

6. Deploy

Push to GitHub and connect Vercel. Add the same env vars to Vercel's Environment Variables tab. Trigger a deploy with build cache unchecked (so env vars get picked up).

🧪 How to Test the Whole System

The 5-minute end-to-end demo

Tab 1: /voice — trigger an outbound call to your phone

Tab 2: /calls — watch the live transcript appear

Tab 3: /agent-console — see the escalation land

Then run this script:

Click "Call me now" → pick up

"Hi, I have a problem with my order"

"My number is +91 9876 5432 16" (Athena pulls Sushi order)

"The food was completely rotten" (she offers refund)

"Yes please process the refund" (refund row created in Supabase)

"Wait, this is the THIRD time I'm calling. Your service is RIDICULOUS. Manager NOW or I'm going to consumer court!"

→ 🚨 escalation lands in Tab 3 within 3 seconds

Hang up

Verify in Supabase

After hanging up, check:

✅ calls table — new row, max_frustration_score ≥ 7, was_escalated = true

✅ transcripts table — multiple rows, user turns scored

✅ refunds table — new row, amount 1800, reason quality_issue

✅ escalations table — new row with handoff_summary populated

If all 4 ✅, the system is working end-to-end.

📊 Performance Targets

The numbers Athena is designed to hit at scale:

Metric

Target

Industry baseline

Avg resolution time

< 3 min

12-15 min

Auto-resolved (no human)

70%+

0%

Cost per call

₹15-20

₹80-120

Escalation rate

< 15%

N/A

Frustration score on resolved calls

< 4

N/A

Current demo numbers (small sample, real calls): hitting these targets on the seeded orders.

🗺️ Roadmap

What's live today

✅ Voice agent (Bolna + GPT-4.1 + ElevenLabs Hinglish)

✅ Embeddable chat (Gemini-backed)

✅ Real-time frustration scoring

✅ Tool execution (lookup / refund / escalate)

✅ Live operations dashboard

✅ AI-generated handoff summaries

✅ Post-call webhook ingestion

✅ Real-time Supabase subscriptions

What's next

🚧 In-app voice button (web SDK so customers can voice-chat without dialing)

🚧 Multi-language expansion (Tamil, Telugu, Bengali)

🚧 Slack alerting integration when frustration crosses threshold

🚧 Quality issue auto-photo upload

🚧 Custom escalation rules per merchant

🚧 A/B testing different agent personas

🚧 Voice biometrics for return-customer recognition

What we'd build with more time

Bolna chat API integration (so voice + chat run on the same runtime)

Per-platform white-labeling (custom agent per Swiggy / Zomato / etc.)

Refund-fraud detection

Outcome-based pricing model

🎬 Demo Assets

Live URL: https://athena-taupe.vercel.app

Real call recording (₹1800 sushi escalation, 224 sec): Listen here

GitHub: https://github.com/anmoltiwari0712/Athena

📐 Decision Log

A short list of "why we did it this way" notes:

Why food delivery refunds specifically? It's a tight, well-defined use case where the killer feature (frustration detection) actually matters. Customers get genuinely angry about cold biryani.

Why Bolna for voice? They're India-native, Hinglish out of the box, and integrate Plivo + Deepgram + ElevenLabs in one platform. We didn't have time to wire those up individually.

Why Gemini for chat instead of also Bolna? Bolna's chat API isn't externally exposed yet. Building chat directly with Gemini was 30 minutes; trying to reverse-engineer Bolna's chat could have been 4 hours.

Why score frustration with a separate Gemini call instead of inline in the agent prompt? Cleaner separation of concerns. Lets us swap models or change scoring logic without touching the agent persona. Also makes it auditable.

Why hand-roll the dashboard instead of using a tool like Retool? Real-time subscriptions on Supabase are basically free, and Tailwind + Next.js made the UI fast to build. The dashboard is part of the pitch — couldn't outsource that look.

Why hardcode BASE_URL to the public domain? Vercel's VERCEL_URL env var returns the deployment-specific preview URL, which is auth-protected and returned HTML for our internal tool calls. Hardcoding the public alias eliminates that whole class of bug.

🤖 What Athena Cannot Do (Yet)

In the spirit of honesty:

❌ No memory across calls. Athena doesn't remember last week's complaint from the same customer. Each call is fresh.

❌ No outbound proactive calls. She only responds. No "Hi, your order from yesterday — are you happy with it?"

❌ English/Hindi only. No Tamil, no Telugu, no Bengali, no Punjabi.

❌ No image understanding. Customer can't show her a photo of cold food.

❌ No payment refund integration. We log the refund intent; an actual payment processor wires up to the refunds table.

❌ No fraud detection. A motivated customer could refund the same kind of order over and over.

These are all roadmap, not architectural blockers.

🙏 Built With

Built in 2 days for a take-home assignment. Coffee count: classified.

Bolna — voice infrastructure

Google AI Studio — Gemini access

Supabase — Postgres + real-time

Vercel — hosting

Next.js — framework

Tailwind CSS — styling

The patient soul who picked up at 12:30 AM to test the escalation flow with me

📜 License

MIT — do whatever you want with this code. If you ship something cool with it, drop me a line.

<div align="center">

Built by Anmol Tiwari

If frustrated customers are your problem, give Athena a call.

</div>
