import { zenChat, ZEN_MODELS, DEFAULT_ZEN_MODEL } from './zen';
import { pollinationsChat, POLLINATIONS_MODELS, DEFAULT_CHAT_MODEL } from './pollinations';
import { puterChat, PUTER_CHAT_MODELS, DEFAULT_PUTER_CHAT_MODEL, isPuterAvailable } from './puter';

export type AiEngine = 'zen' | 'pollinations' | 'puter';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  provider?: AiEngine;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

const ENGINE_CONFIG = {
  zen: {
    chat: zenChat,
    defaultModel: DEFAULT_ZEN_MODEL,
    models: ZEN_MODELS,
    label: 'OpenCode Zen',
  },
  pollinations: {
    chat: pollinationsChat,
    defaultModel: DEFAULT_CHAT_MODEL,
    models: POLLINATIONS_MODELS,
    label: 'Pollinations AI',
  },
  puter: {
    chat: puterChat,
    defaultModel: DEFAULT_PUTER_CHAT_MODEL,
    models: PUTER_CHAT_MODELS,
    label: 'Puter.js',
  },
};

export const DEFAULT_ENGINE: AiEngine = (process.env.NEXT_PUBLIC_AI_ENGINE as AiEngine) || 'pollinations';

export async function aiChat(
  messages: ChatMessage[],
  opts?: ChatOptions
): Promise<string> {
  const engine = opts?.provider || DEFAULT_ENGINE;
  const config = ENGINE_CONFIG[engine];
  const model = opts?.model || config.defaultModel;

  try {
    if (engine === 'puter' && !isPuterAvailable()) {
      throw new Error('Puter.js غير محمل في المتصفح');
    }
    return await config.chat(messages, {
      model,
      temperature: opts?.temperature ?? 0.7,
      maxTokens: opts?.maxTokens ?? 2000,
    });
  } catch (primaryError: any) {
    if (engine === 'zen') {
      console.warn('Zen failed, falling back to Pollinations:', primaryError.message);
      try {
        return await pollinationsChat(messages, {
          model: DEFAULT_CHAT_MODEL,
          temperature: opts?.temperature ?? 0.7,
          maxTokens: opts?.maxTokens ?? 2000,
        });
      } catch (pollError: any) {
        throw new Error(`AI unavailable (Zen: ${primaryError.message}, Pollinations: ${pollError.message})`);
      }
    }
    if (engine === 'puter') {
      console.warn('Puter failed, falling back to Zen:', primaryError.message);
      try {
        return await zenChat(messages, {
          model: opts?.model || DEFAULT_ZEN_MODEL,
          temperature: opts?.temperature ?? 0.7,
          maxTokens: opts?.maxTokens ?? 2000,
        });
      } catch (zenError: any) {
        throw new Error(`AI unavailable (Puter: ${primaryError.message}, Zen: ${zenError.message})`);
      }
    }
    throw primaryError;
  }
}

export function getAvailableEngines() {
  return Object.entries(ENGINE_CONFIG).map(([key, cfg]) => ({
    name: key,
    label: cfg.label,
    configured: key !== 'puter' ? true : true, // Puter.js is always available client-side via script tag
    default: key === DEFAULT_ENGINE,
    models: cfg.models,
  }));
}

export function getModelsForEngine(engine: AiEngine): string[] {
  return ENGINE_CONFIG[engine]?.models || [];
}

export { ZEN_MODELS, DEFAULT_ZEN_MODEL } from './zen';
export { POLLINATIONS_MODELS, DEFAULT_CHAT_MODEL, pollinationsGenerateImage, getPollinationsImageUrl } from './pollinations';
export { PUTER_CHAT_MODELS, DEFAULT_PUTER_CHAT_MODEL, PUTER_IMAGE_MODELS, DEFAULT_PUTER_IMAGE_MODEL, puterGenerateImage, isPuterAvailable } from './puter';
