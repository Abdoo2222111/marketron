import { puterChat, puterGenerateImage } from './ai-engine/puter';
import { aiProvidersApi } from '@/services/api-modules';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GenerateTextOptions {
  prompt: string;
  provider?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

interface GenerateImageOptions {
  prompt: string;
  provider?: string;
  model?: string;
  style?: string;
  platform?: string;
}

interface ChatOptions {
  messages: ChatMessage[];
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function generateClientText(opts: GenerateTextOptions): Promise<{ text: string; provider: string; model: string }> {
  const provider = opts.provider || 'pollinations';
  const model = opts.model || (provider === 'puter' ? 'gpt-4o' : provider === 'zen' ? 'gpt-5.4-mini' : 'openai');

  if (provider === 'puter') {
    const messages = [] as { role: 'system' | 'user'; content: string }[];
    if (opts.systemPrompt) messages.push({ role: 'system', content: opts.systemPrompt });
    messages.push({ role: 'user', content: opts.prompt });
    const text = await puterChat(messages, { model, temperature: opts.temperature, maxTokens: opts.maxTokens });
    return { text, provider: 'puter', model };
  }

  try {
    const res = await aiProvidersApi.generate({
      prompt: opts.prompt,
      systemPrompt: opts.systemPrompt,
      provider,
      model,
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
    });
    return {
      text: res.data?.data?.text || '',
      provider: res.data?.data?.provider || provider,
      model: res.data?.data?.model || model,
    };
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 500) {
      const fallbackRes = await aiProvidersApi.generate({
        prompt: opts.prompt,
        systemPrompt: opts.systemPrompt,
        provider: 'pollinations',
        model: 'openai',
        temperature: opts.temperature,
        maxTokens: opts.maxTokens,
      });
      return {
        text: fallbackRes.data?.data?.text || '',
        provider: 'pollinations',
        model: 'openai',
      };
    }
    throw err;
  }
}

export async function generateClientImage(opts: GenerateImageOptions): Promise<{ imageUrl: string; provider: string; model: string }> {
  const provider = opts.provider || 'pollinations';
  const model = opts.model || (provider === 'puter' ? 'flux-schnell' : 'flux');

  if (provider === 'puter') {
    const imageUrl = await puterGenerateImage(opts.prompt, model);
    return { imageUrl, provider: 'puter', model };
  }

  const res = await aiProvidersApi.generateImage({
    prompt: opts.prompt,
    style: opts.style,
    platform: opts.platform,
  });

  const data = res.data?.data || res.data;
  const imageUrl = data?.imageUrl || data?.url || data?.[0]?.url || '';
  return { imageUrl, provider: res.data?.provider || 'pollinations', model };
}

export async function chatWithClientAI(opts: ChatOptions): Promise<{ content: string; provider: string; model: string }> {
  const provider = opts.provider || 'pollinations';
  const model = opts.model || (provider === 'puter' ? 'gpt-4o' : provider === 'zen' ? 'gpt-5.4-mini' : 'openai');

  if (provider === 'puter') {
    const text = await puterChat(opts.messages, { model, temperature: opts.temperature, maxTokens: opts.maxTokens });
    return { content: text, provider: 'puter', model };
  }

  const userMsg = opts.messages.find(m => m.role === 'user');
  const systemMsg = opts.messages.find(m => m.role === 'system');
  if (!userMsg) throw new Error('لا يوجد رسالة مستخدم');

  const res = await aiProvidersApi.generate({
    prompt: userMsg.content,
    systemPrompt: systemMsg?.content,
    provider,
    model,
    temperature: opts.temperature,
    maxTokens: opts.maxTokens,
  });

  return {
    content: res.data?.data?.text || '',
    provider: res.data?.data?.provider || provider,
    model: res.data?.data?.model || model,
  };
}
