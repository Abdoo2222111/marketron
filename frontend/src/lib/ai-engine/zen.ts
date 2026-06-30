const ZEN_BASE_URL = 'https://opencode.ai/zen/v1';
const ZEN_API_KEY = process.env.NEXT_PUBLIC_ZEN_API_KEY || process.env.ZEN_API_KEY || '';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ZenChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export async function zenChat(
  messages: ChatMessage[],
  opts?: ZenChatOptions
): Promise<string> {
  const apiKey = ZEN_API_KEY;
  if (!apiKey) {
    throw new Error('OpenCode Zen API key not configured. Add NEXT_PUBLIC_ZEN_API_KEY to .env.local');
  }

  const model = opts?.model || 'gpt-5.4-mini';
  const body: Record<string, any> = {
    model,
    messages,
    temperature: opts?.temperature ?? 0.7,
    ...(opts?.maxTokens ? { max_tokens: opts.maxTokens } : {}),
  };

  const res = await fetch(`${ZEN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`OpenCode Zen API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function zenChatJSON<T>(
  messages: ChatMessage[],
  opts?: ZenChatOptions
): Promise<T> {
  const text = await zenChat(messages, opts);
  try { return JSON.parse(text) as T; }
  catch {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error('Zen response was not valid JSON');
  }
}

export const ZEN_MODELS = [
  'gpt-5.5', 'gpt-5.5-pro',
  'gpt-5.4', 'gpt-5.4-pro', 'gpt-5.4-mini', 'gpt-5.4-nano',
  'gpt-5.3-codex', 'gpt-5.3-codex-spark',
  'gpt-5.2', 'gpt-5.2-codex',
  'gpt-5.1', 'gpt-5.1-codex',
];

export const DEFAULT_ZEN_MODEL = 'gpt-5.4-mini';
