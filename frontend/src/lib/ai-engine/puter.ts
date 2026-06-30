interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PuterChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface PuterImageOptions {
  model?: string;
  prompt: string;
}

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat: (messages: any, options?: any) => Promise<any>;
        txt2img: (prompt: string, model?: string) => Promise<{ src?: string }>;
      };
    };
  }
}

export function isPuterAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof window.puter !== 'undefined' && !!window.puter?.ai;
}

export async function puterChat(
  messages: ChatMessage[],
  opts?: PuterChatOptions
): Promise<string> {
  if (!isPuterAvailable()) {
    throw new Error('Puter.js غير محمل. تأكد من تحميل المكتبة.');
  }

  const model = opts?.model || 'gpt-4o';
  const systemMsg = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const puterMessages = userMessages.map(m => ({
    role: m.role,
    content: [{ type: 'text', text: m.content }],
  }));

  if (systemMsg) {
    puterMessages.unshift({
      role: 'system',
      content: [{ type: 'text', text: systemMsg.content }],
    });
  }

  const options: Record<string, any> = { model };
  if (opts?.temperature) options.temperature = opts.temperature;
  if (opts?.maxTokens) options.maxTokens = opts.maxTokens;

  try {
    const response = await window.puter!.ai!.chat(puterMessages, options);
    if (typeof response === 'string') return response;
    if (response?.message?.content) return response.message.content;
    if (response?.content) return response.content;
    return String(response);
  } catch (e: any) {
    throw new Error(`Puter Chat error: ${e.message || e}`);
  }
}

export async function puterGenerateImage(
  prompt: string,
  model?: string
): Promise<string> {
  if (!isPuterAvailable()) {
    throw new Error('Puter.js غير محمل. تأكد من تحميل المكتبة.');
  }

  const imageModel = model || 'flux-schnell';

  try {
    const result = await window.puter!.ai!.txt2img(prompt, imageModel);
    const src = result?.src;
    if (!src) throw new Error('لم يتم استلام رابط الصورة من Puter');
    return src;
  } catch (e: any) {
    throw new Error(`Puter Image error: ${e.message || e}`);
  }
}

export const PUTER_CHAT_MODELS = [
  'gpt-4o',
  'claude-3-5-sonnet',
  'gemini-1-5-pro',
  'deepseek-chat',
];

export const PUTER_IMAGE_MODELS = [
  'flux-schnell',
  'gpt-image-2',
  'stability-ai/stable-diffusion-xl',
];

export const DEFAULT_PUTER_CHAT_MODEL = 'gpt-4o';
export const DEFAULT_PUTER_IMAGE_MODEL = 'flux-schnell';
