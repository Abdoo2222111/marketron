const POLLINATIONS_BASE = process.env.NEXT_PUBLIC_POLLINATIONS_URL || 'https://text.pollinations.ai';
const POLLINATIONS_IMAGE_BASE = 'https://image.pollinations.ai';
const POLLINATIONS_API_BASE = 'https://api.pollinations.ai';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PollinationsChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  seed?: number;
}

interface PollinationsImageOptions {
  model?: string;
  prompt: string;
  negativePrompt?: string;
  size?: string;
  n?: number;
  seed?: number;
  enhance?: boolean;
}

export async function pollinationsChat(
  messages: ChatMessage[],
  opts?: PollinationsChatOptions
): Promise<string> {
  const model = opts?.model || 'openai';
  const body: Record<string, any> = {
    messages,
    model,
    temperature: opts?.temperature ?? 0.7,
    ...(opts?.maxTokens ? { max_tokens: opts.maxTokens } : {}),
    ...(opts?.seed ? { seed: opts.seed } : {}),
  };

  const res = await fetch(`${POLLINATIONS_BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Pollinations API error ${res.status}: ${errText}`);
  }

  const text = await res.text();
  return text;
}

export async function pollinationsChatJSON(
  messages: ChatMessage[],
  opts?: PollinationsChatOptions
): Promise<string> {
  const model = opts?.model || 'openai';
  const body: Record<string, any> = {
    messages,
    model,
    temperature: opts?.temperature ?? 0.7,
    jsonMode: true,
    ...(opts?.maxTokens ? { max_tokens: opts.maxTokens } : {}),
    ...(opts?.seed ? { seed: opts.seed } : {}),
  };

  const res = await fetch(`${POLLINATIONS_BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Pollinations JSON API error ${res.status}: ${errText}`);
  }

  return await res.text();
}

export async function pollinationsGenerateImage(
  opts: PollinationsImageOptions
): Promise<{ url: string; b64_json?: string }[]> {
  const model = opts.model || 'flux';
  const width = parseInt(opts.size?.split('x')[0] || '1024');
  const height = parseInt(opts.size?.split('x')[1] || '1024');
  const params = new URLSearchParams({
    model, width: String(width), height: String(height), nologo: 'true', private: 'true',
    ...(opts.seed ? { seed: String(opts.seed) } : {}),
    ...(opts.enhance ? { enhance: 'true' } : {}),
    ...(opts.negativePrompt ? { negative_prompt: opts.negativePrompt } : {}),
  });
  const url = `${POLLINATIONS_IMAGE_BASE}/prompt/${encodeURIComponent(opts.prompt)}?${params}`;

  const res = await fetch(url);
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Pollinations Image API error ${res.status}: ${errText}`);
  }

  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return [{ url, b64_json: base64 }];
}

export function getPollinationsImageUrl(prompt: string, options?: { width?: number; height?: number; model?: string; seed?: number }): string {
  const params = new URLSearchParams();
  if (options?.width) params.set('width', String(options.width));
  if (options?.height) params.set('height', String(options.height));
  if (options?.model) params.set('model', options.model);
  if (options?.seed) params.set('seed', String(options.seed));
  const query = params.toString();
  return `${POLLINATIONS_IMAGE_BASE}/prompt/${encodeURIComponent(prompt)}${query ? '?' + query : ''}`;
}

export async function pollinationsListModels(): Promise<any[]> {
  try {
    const res = await fetch(`${POLLINATIONS_API_BASE}/v1/models`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export const POLLINATIONS_MODELS = [
  'openai', 'openai-fast', 'openai-large',
  'gpt-5.4', 'gpt-5.4-mini',
  'claude', 'claude-fast', 'claude-large', 'claude-opus-4.6', 'claude-opus-4.7',
  'gemini', 'gemini-3-flash', 'gemini-fast', 'gemini-2.5-flash', 'gemini-large',
  'deepseek', 'deepseek-pro',
  'mistral', 'mistral-large', 'mistral-small-3.2',
  'llama', 'llama-maverick', 'llama-scout',
  'grok', 'grok-4-20-reasoning', 'grok-large',
  'qwen-coder', 'qwen-coder-large', 'qwen-large', 'qwen-vision', 'qwen-vision-pro',
  'minimax', 'minimax-m2.7',
  'kimi', 'kimi-code',
  'gemma', 'glm', 'nova', 'nova-fast',
  'mercury', 'polly', 'step-flash',
  'perplexity', 'perplexity-fast', 'perplexity-deep', 'perplexity-reasoning',
  'gemini-search', 'gemini-search-fast', 'gemini-search-large',
];

export const DEFAULT_CHAT_MODEL = 'openai';
export const DEFAULT_IMAGE_MODEL = 'flux';
