import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

const MODEL_CANDIDATES = [
  'gemini-2.5-flash'
];

const FRUSTRATION_PROMPT = [
  'You are a customer service quality analyst for Indian customer interactions (English, Hindi, Hinglish).',
  '',
  'Score the customer utterance for frustration on a scale of 1-10.',
  '',
  'Frustration signals:',
  '- Profanity or harsh tone (yaar, kya bakwaas, swears)',
  '- Repetition of complaints (already TOLD you, third time calling)',
  '- Demands for human (manager, real person, supervisor)',
  '- Sarcasm (wah bahut accha, great job)',
  '- Threats (Twitter, consumer court, deleting app)',
  '- Words: ridiculous, wasting my time, useless, pathetic',
  '- ALL CAPS or repeated punctuation',
  '- Strong emotional intensity',
  '',
  'Scoring:',
  '- 1-3: Calm, neutral, friendly',
  '- 4-5: Slightly annoyed but cooperative',
  '- 6-7: Clearly frustrated',
  '- 8-10: Very angry, may abandon call',
  '',
  'Respond ONLY with valid JSON: {"score": <1-10>, "signals": ["x"], "reasoning": "<short>"}',
  'No markdown. No code fences. ONLY JSON.',
].join('\n');

export interface FrustrationResult {
  score: number;
  signals: string[];
  reasoning: string;
}

export async function scoreFrustration(
  utterance: string,
  conversationHistory: string = ''
): Promise<FrustrationResult> {
  const userPrompt = [
    'Conversation history so far:',
    conversationHistory || '(this is the first turn)',
    '',
    'Latest customer utterance to score:',
    '"' + utterance + '"',
    '',
    'Score the frustration level. Respond ONLY with the JSON object.',
  ].join('\n');

  let lastError = 'unknown';

  for (const modelName of MODEL_CANDIDATES) {
    try {
      console.log('[Gemini] Trying model: ' + modelName);

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent([
        { text: FRUSTRATION_PROMPT },
        { text: userPrompt },
      ]);

      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      console.log('[Gemini] Success with ' + modelName + ', score: ' + parsed.score);

      return {
        score: Math.max(1, Math.min(10, Number(parsed.score) || 1)),
        signals: Array.isArray(parsed.signals) ? parsed.signals : [],
        reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.warn('[Gemini] Model ' + modelName + ' failed: ' + lastError);
    }
  }

  console.error('[Gemini] All models failed. Last error: ' + lastError);
  return {
    score: 1,
    signals: [],
    reasoning: 'Scoring failed, defaulted to neutral',
  };
}
