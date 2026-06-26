import axios from 'axios';
import { config } from '../config';
import logger from '../utils/logger';

// ============================================================
// Multi-AI Provider Layer
// يدعم: OpenAI, Anthropic Claude, Google Gemini, Groq, Mistral,
//       Cohere, DeepSeek, Perplexity، وأي مزود متوافق مع OpenAI
// كل المزودين بيتبعوا نفس الواجهة: generateText(prompt, opts)
// ============================================================

export type AiProviderName =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'groq'
  | 'mistral'
  | 'cohere'
  | 'deepseek'
  | 'perplexity';

export interface AiCompletionOptions {
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  provider?: AiProviderName;
}

export interface AiCompletionResult {
  text: string;
  provider: AiProviderName;
  model: string;
  tokensUsed: number;
}

// ── Provider Models Registry ─────────────────────────────
export const PROVIDER_MODELS: Record<AiProviderName, { label: string; models: string[] }> = {
  openai: {
    label: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini', 'o3-mini'],
  },
  anthropic: {
    label: 'Anthropic Claude',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  },
  gemini: {
    label: 'Google Gemini',
    models: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-8b'],
  },
  groq: {
    label: 'Groq',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  },
  mistral: {
    label: 'Mistral AI',
    models: ['mistral-large-latest', 'mistral-small-latest', 'open-mistral-nemo', 'codestral-latest'],
  },
  cohere: {
    label: 'Cohere',
    models: ['command-r-plus', 'command-r', 'command', 'command-light'],
  },
  deepseek: {
    label: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-reasoner', 'deepseek-coder'],
  },
  perplexity: {
    label: 'Perplexity',
    models: ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online', 'llama-3.1-sonar-huge-128k-online'],
  },
};

// ── Base Provider Interface ──────────────────────────────
interface AiProvider {
  name: AiProviderName;
  isConfigured(): boolean;
  generateText(prompt: string, opts?: AiCompletionOptions): Promise<AiCompletionResult>;
}

// ── OpenAI-compatible Provider (covers OpenAI, Groq, DeepSeek, Mistral, Perplexity) ──
class OpenAICompatibleProvider implements AiProvider {
  name: AiProviderName;
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(name: AiProviderName) {
    const p = config.ai.providers[name];
    this.name = name;
    this.apiKey = p.apiKey;
    this.baseUrl = p.baseUrl;
    this.defaultModel = p.defaultModel;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async generateText(prompt: string, opts?: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.isConfigured()) throw new Error(`${this.name} API key not configured`);
    const model = opts?.model || this.defaultModel;
    const messages: any[] = [];
    if (opts?.systemPrompt) messages.push({ role: 'system', content: opts.systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const { data } = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model,
        messages,
        temperature: opts?.temperature ?? 0.7,
        max_tokens: opts?.maxTokens ?? 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        timeout: 60000,
      }
    );

    const text = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;
    logger.info(`[${this.name}] Generated ${text.length} chars, ${tokensUsed} tokens, model=${model}`);
    return { text, provider: this.name, model, tokensUsed };
  }
}

// ── Anthropic Claude Provider ────────────────────────────
class AnthropicProvider implements AiProvider {
  name: AiProviderName = 'anthropic';
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    const p = config.ai.providers.anthropic;
    this.apiKey = p.apiKey;
    this.baseUrl = p.baseUrl;
    this.defaultModel = p.defaultModel;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async generateText(prompt: string, opts?: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.isConfigured()) throw new Error('Anthropic API key not configured');
    const model = opts?.model || this.defaultModel;
    const { data } = await axios.post(
      `${this.baseUrl}/v1/messages`,
      {
        model,
        max_tokens: opts?.maxTokens ?? 2000,
        temperature: opts?.temperature ?? 0.7,
        system: opts?.systemPrompt || 'أنت مساعد ذكي في منصة MARKETRON. تجيب بالعربية الفصحى بشكل احترافي.',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        timeout: 60000,
      }
    );
    const text = data.content?.[0]?.text || '';
    const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || 0;
    logger.info(`[anthropic] Generated ${text.length} chars, ${tokensUsed} tokens, model=${model}`);
    return { text, provider: this.name, model, tokensUsed };
  }
}

// ── Google Gemini Provider ───────────────────────────────
class GeminiProvider implements AiProvider {
  name: AiProviderName = 'gemini';
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    const p = config.ai.providers.gemini;
    this.apiKey = p.apiKey;
    this.baseUrl = p.baseUrl;
    this.defaultModel = p.defaultModel;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async generateText(prompt: string, opts?: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.isConfigured()) throw new Error('Gemini API key not configured');
    const model = opts?.model || this.defaultModel;
    const { data } = await axios.post(
      `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: opts?.systemPrompt ? { parts: [{ text: opts.systemPrompt }] } : undefined,
        generationConfig: {
          temperature: opts?.temperature ?? 0.7,
          maxOutputTokens: opts?.maxTokens ?? 2000,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
      }
    );
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;
    logger.info(`[gemini] Generated ${text.length} chars, ${tokensUsed} tokens, model=${model}`);
    return { text, provider: this.name, model, tokensUsed };
  }
}

// ── Provider Registry ────────────────────────────────────
const providers: Record<AiProviderName, AiProvider> = {
  openai: new OpenAICompatibleProvider('openai'),
  anthropic: new AnthropicProvider(),
  gemini: new GeminiProvider(),
  groq: new OpenAICompatibleProvider('groq'),
  mistral: new OpenAICompatibleProvider('mistral'),
  cohere: new OpenAICompatibleProvider('cohere'),
  deepseek: new OpenAICompatibleProvider('deepseek'),
  perplexity: new OpenAICompatibleProvider('perplexity'),
};

// ── Main AI Service ──────────────────────────────────────
export class AiService {
  getAvailableProviders(): AiProviderName[] {
    return (Object.keys(providers) as AiProviderName[]).filter(p => providers[p].isConfigured());
  }

  getProviderInfo() {
    return (Object.keys(providers) as AiProviderName[]).map(name => ({
      name,
      label: PROVIDER_MODELS[name].label,
      configured: providers[name].isConfigured(),
      models: PROVIDER_MODELS[name].models,
    }));
  }

  async generateText(
    prompt: string,
    opts?: AiCompletionOptions
  ): Promise<AiCompletionResult> {
    const providerName = opts?.provider || config.ai.defaultProvider as AiProviderName;
    const provider = providers[providerName];

    if (!provider || !provider.isConfigured()) {
      // Fallback to any configured provider
      const available = this.getAvailableProviders();
      if (available.length === 0) {
        throw new Error('No AI provider configured. Set at least one API key in .env');
      }
      const fallback = providers[available[0]];
      logger.warn(`Provider ${providerName} not configured, falling back to ${available[0]}`);
      return fallback.generateText(prompt, opts);
    }

    return provider.generateText(prompt, opts);
  }

  async generateStructuredJson<T>(
    prompt: string,
    opts?: AiCompletionOptions
  ): Promise<T> {
    const result = await this.generateText(prompt, {
      ...opts,
      systemPrompt: (opts?.systemPrompt || 'أنت مساعد ذكي. أعد البيانات بصيغة JSON صالحة فقط.') + ' أعد البيانات بصيغة JSON صالحة فقط.',
    });
    try {
      return JSON.parse(result.text) as T;
    } catch {
      // Try to extract JSON from text
      const match = result.text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]) as T;
      throw new Error('AI response was not valid JSON');
    }
  }
}

export const aiService = new AiService();
export default aiService;
