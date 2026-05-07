import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const ATHENA_SYSTEM_PROMPT = `You are Athena, a customer support agent for a food delivery platform. You handle refund and complaint requests. 
 
PERSONALITY: 
- Warm, calm, professional. Like an experienced human agent who has done this for two years. 
- You are FEMALE. Always use feminine Hindi verbs: "karti hoon", "samajhti hoon", "madad karungi" — never "karta hoon" or "karunga". 
- Speak naturally in Hinglish. Match the customer's language preference. 
- Keep responses short (1-2 sentences). This is conversational. 
 
CONVERSATION FLOW: 
1. Greet warmly. Ask what's wrong. 
2. Get phone number → call lookup_order tool. 
3. Confirm order details with customer. 
4. Understand the issue category (missing_item, wrong_item, quality_issue, late_delivery, double_charge, other). 
5. Offer resolution based on order amount: 
  - ≤ ₹500 → full refund auto-approved 
  - ₹500-₹1500 → full refund OR replacement 
  - > ₹1500 → partial refund (50%) + 100 credits, OR full refund 
  - Quality issues → always offer full refund + 50 credits 
6. Call process_refund tool with order_id, amount, reason. 
7. Confirm refund and close politely. 
 
CRITICAL — FRUSTRATION DETECTION: 
After every customer turn, internally assess frustration 1-10 based on: 
- Profanity, threats, sarcasm 
- Repetition ("I already TOLD you", "third time calling") 
- Demands for human ("manager", "human", "real person") 
- ALL CAPS, exclamation marks 
- Words like "ridiculous", "useless", "consumer court", "Twitter" 
 
If frustration ≥ 7 OR customer explicitly demands a human → IMMEDIATELY call escalate_to_human tool with reason, frustration_level, conversation_summary. Then say warmly: "I understand this has been frustrating. Main aapko abhi senior agent se connect kar deti hoon." 
 
NEVER: 
- Say "as an AI" or break character 
- Make up order details — always use lookup_order tool first 
- Promise refunds before calling the tool 
- Use masculine Hindi verbs 
- Continue trying to resolve after escalating`;

const TOOLS: FunctionDeclaration[] = [
  {
    name: 'lookup_order',
    description:
      'Look up customer order by phone number. Always call this when the user provides their phone number.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        phone_number: {
          type: SchemaType.STRING,
          description: 'Customer phone number, e.g. +919876543216',
        },
      },
      required: ['phone_number'],
    },
  },
  {
    name: 'process_refund',
    description: 'Process a refund after customer agrees to a resolution. Returns confirmation.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        order_id: { type: SchemaType.STRING, description: 'Order ID from lookup_order response' },
        amount: { type: SchemaType.NUMBER, description: 'Refund amount in rupees' },
        reason: {
          type: SchemaType.STRING,
          description:
            'One of: missing_item, wrong_item, quality_issue, late_delivery, double_charge, other',
        },
      },
      required: ['order_id', 'amount', 'reason'],
    },
  },
  {
    name: 'escalate_to_human',
    description: 'Transfer to human agent. Call when frustration ≥ 7 or customer demands human.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        reason: { type: SchemaType.STRING, description: 'Brief reason for escalation' },
        frustration_level: { type: SchemaType.NUMBER, description: 'Score 1-10' },
        conversation_summary: {
          type: SchemaType.STRING,
          description: '2-sentence summary for human agent',
        },
      },
      required: ['reason', 'conversation_summary'],
    },
  },
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const BASE_URL = 'https://athena-taupe.vercel.app';

async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  console.log(`[chat] executing tool: ${name}`, args);

  const endpointMap: Record<string, string> = {
    lookup_order: '/api/lookup-order',
    process_refund: '/api/process-refund',
    escalate_to_human: '/api/escalate',
  };

  const endpoint = endpointMap[name];
  if (!endpoint) return { success: false, error: `Unknown tool: ${name}` };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });

    const contentType = res.headers.get('content-type') || '';

    // Guard: if we got HTML back (auth redirect, error page), don't try to parse as JSON
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.error(`[chat] tool ${name} returned non-JSON (${res.status}):`, text.slice(0, 200));
      return {
        success: false,
        error: `Tool ${name} returned HTML instead of JSON (status ${res.status})`,
      };
    }

    const data = await res.json();
    console.log(`[chat] tool ${name} result:`, JSON.stringify(data).slice(0, 300));
    return data;
  } catch (e) {
    console.error(`[chat] tool ${name} threw:`, e);
    return { success: false, error: `Tool execution failed: ${(e as Error).message}` };
  }
}
async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  console.log(`[chat] executing tool: ${name}`, args);

  const endpointMap: Record<string, string> = {
    lookup_order: '/api/lookup-order',
    process_refund: '/api/process-refund',
    escalate_to_human: '/api/escalate',
  };

  const endpoint = endpointMap[name];
  if (!endpoint) return { success: false, error: `Unknown tool: ${name}` };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });

    const contentType = res.headers.get('content-type') || '';

    // Guard: if we got HTML back (auth redirect, error page), don't try to parse as JSON
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.error(`[chat] tool ${name} returned non-JSON (${res.status}):`, text.slice(0, 200));
      return {
        success: false,
        error: `Tool ${name} returned HTML instead of JSON (status ${res.status})`,
      };
    }

    const data = await res.json();
    console.log(`[chat] tool ${name} result:`, JSON.stringify(data).slice(0, 300));
    return data;
  } catch (e) {
    console.error(`[chat] tool ${name} threw:`, e);
    return { success: false, error: `Tool execution failed: ${(e as Error).message}` };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];

    if (messages.length === 0) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 });
    }

    const MODEL_CANDIDATES = ['gemini-2.5-flash'];

    for (const modelName of MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: ATHENA_SYSTEM_PROMPT,
          tools: [{ functionDeclarations: TOOLS }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        });

        // Convert chat history to Gemini format
        let historySource = messages.slice(0, -1);

        while (historySource.length > 0 && historySource[0].role !== 'user') {
          historySource = historySource.slice(1);
        }

        const history = historySource.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',

          parts: [{ text: m.content }],
        }));

        const lastMessage = messages[messages.length - 1].content;

        const chat = model.startChat({ history });
        let result = await chat.sendMessage(lastMessage);

        // Tool-call loop — Gemini may want to call multiple tools sequentially
        let safetyCounter = 0;
        const toolsCalled: string[] = [];

        while (safetyCounter < 5) {
          const response = result.response;
          const functionCalls = response.functionCalls();

          if (!functionCalls || functionCalls.length === 0) {
            // Final assistant text response
            const text = response.text();
            return NextResponse.json({
              success: true,
              reply: text,
              tools_called: toolsCalled,
              model: modelName,
            });
          }

          // Execute all requested function calls
          const functionResponses = [];
          for (const fc of functionCalls) {
            const toolResult = await executeTool(fc.name, fc.args as Record<string, unknown>);
            toolsCalled.push(fc.name);
            functionResponses.push({
              functionResponse: {
                name: fc.name,
                response: toolResult as object,
              },
            });
          }

          // Send tool results back to Gemini for follow-up
          result = await chat.sendMessage(functionResponses);
          safetyCounter++;
        }

        // If we hit the safety limit, send final text
        return NextResponse.json({
          success: true,
          reply: result.response.text() || 'I apologize, please try again.',
          tools_called: toolsCalled,
          warning: 'Hit tool-call limit',
        });
      } catch (err) {
        console.warn(`[chat] model ${modelName} failed:`, (err as Error).message);
        continue;
      }
    }

    return NextResponse.json({ success: false, error: 'All models failed' }, { status: 500 });
  } catch (e) {
    console.error('[chat] handler error:', e);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Athena chat endpoint is live',
    timestamp: new Date().toISOString(),
  });
}
