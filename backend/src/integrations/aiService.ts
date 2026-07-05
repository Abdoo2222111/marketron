import axios from 'axios';
import { config } from '../config';
import logger from '../utils/logger';

export type AiProviderName =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'groq'
  | 'mistral'
  | 'cohere'
  | 'deepseek'
  | 'perplexity'
  | 'pollinations'
  | 'huggingface';

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

// ── Full Provider Models Registry ──────────────────────
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
  pollinations: {
    label: 'Pollinations AI (مجاني)',
    models: [
      'openai', 'openai-fast', 'openai-large',
      'gpt-5.4', 'gpt-5.4-mini',
      'claude', 'claude-fast', 'claude-large', 'claude-opus-4.6', 'claude-opus-4.7',
      'gemini', 'gemini-3-flash', 'gemini-fast', 'gemini-flash-lite-3.1', 'gemini-large',
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
    ],
  },
  huggingface: {
    label: 'Hugging Face (مجاني - مفتوح المصدر)',
    models: [
      'microsoft/Phi-3-mini-4k-instruct',
      'HuggingFaceH4/zephyr-7b-beta',
      'mistralai/Mistral-7B-Instruct-v0.3',
      'meta-llama/Llama-3.2-3B-Instruct',
      'google/gemma-2-2b-it',
      'Qwen/Qwen2.5-7B-Instruct',
    ],
  },
};

// ── Provider Interface ─────────────────────────────────
interface AiProvider {
  name: AiProviderName;
  isConfigured(): boolean;
  generateText(prompt: string, opts?: AiCompletionOptions): Promise<AiCompletionResult>;
}

// ── OpenAI-compatible Provider ─────────────────────────
class OpenAICompatibleProvider implements AiProvider {
  name: AiProviderName;
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private needsApiKey: boolean;

  constructor(name: AiProviderName, envConfig?: { apiKey: string; baseUrl: string; defaultModel: string }, needsApiKey = true) {
    this.name = name;
    this.apiKey = '';
    this.baseUrl = '';
    this.defaultModel = '';
    this.needsApiKey = needsApiKey;
    this.applyConfig(envConfig);
  }

  applyConfig(cfg?: { apiKey: string; baseUrl: string; defaultModel: string }) {
    if (cfg) {
      this.apiKey = cfg.apiKey || this.apiKey;
      this.baseUrl = cfg.baseUrl || this.baseUrl;
      this.defaultModel = cfg.defaultModel || this.defaultModel;
    }
  }

  reloadFromEnv() {
    const p = config.ai.providers[this.name];
    this.apiKey = p.apiKey;
    this.baseUrl = p.baseUrl;
    this.defaultModel = p.defaultModel;
  }

  isConfigured() {
    return !this.needsApiKey || !!this.apiKey;
  }

  async generateText(prompt: string, opts?: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.isConfigured()) throw new Error(`${this.name} API key not configured`);
    const model = opts?.model || this.defaultModel;
    const messages: any[] = [];
    if (opts?.systemPrompt) messages.push({ role: 'system', content: opts.systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const { data } = await axios.post(
      `${this.baseUrl}/v1/chat/completions`,
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
        timeout: 120000,
      }
    );

    const text = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;
    logger.info(`[${this.name}] Generated ${text.length} chars, ${tokensUsed} tokens, model=${model}`);
    return { text, provider: this.name, model, tokensUsed };
  }
}

// ── Anthropic Provider ─────────────────────────────────
class AnthropicProvider implements AiProvider {
  name: AiProviderName = 'anthropic';
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(envConfig?: { apiKey: string; baseUrl: string; defaultModel: string }) {
    this.apiKey = '';
    this.baseUrl = '';
    this.defaultModel = '';
    this.applyConfig(envConfig);
  }

  private applyConfig(cfg?: { apiKey: string; baseUrl: string; defaultModel: string }) {
    if (cfg) {
      this.apiKey = cfg.apiKey || this.apiKey;
      this.baseUrl = cfg.baseUrl || this.baseUrl;
      this.defaultModel = cfg.defaultModel || this.defaultModel;
    }
  }

  reloadFromEnv() {
    const p = config.ai.providers.anthropic;
    this.apiKey = p.apiKey;
    this.baseUrl = p.baseUrl;
    this.defaultModel = p.defaultModel;
  }

  isConfigured() { return !!this.apiKey; }

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
        headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01' },
        timeout: 60000,
      }
    );
    const text = data.content?.[0]?.text || '';
    const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || 0;
    return { text, provider: this.name, model, tokensUsed };
  }
}

// ── Google Gemini Provider ─────────────────────────────
class GeminiProvider implements AiProvider {
  name: AiProviderName = 'gemini';
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(envConfig?: { apiKey: string; baseUrl: string; defaultModel: string }) {
    this.apiKey = '';
    this.baseUrl = '';
    this.defaultModel = '';
    this.applyConfig(envConfig);
  }

  private applyConfig(cfg?: { apiKey: string; baseUrl: string; defaultModel: string }) {
    if (cfg) {
      this.apiKey = cfg.apiKey || this.apiKey;
      this.baseUrl = cfg.baseUrl || this.baseUrl;
      this.defaultModel = cfg.defaultModel || this.defaultModel;
    }
  }

  reloadFromEnv() {
    const p = config.ai.providers.gemini;
    this.apiKey = p.apiKey;
    this.baseUrl = p.baseUrl;
    this.defaultModel = p.defaultModel;
  }

  isConfigured() { return !!this.apiKey; }

  async generateText(prompt: string, opts?: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.isConfigured()) throw new Error('Gemini API key not configured');
    const model = opts?.model || this.defaultModel;
    const { data } = await axios.post(
      `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: opts?.systemPrompt ? { parts: [{ text: opts.systemPrompt }] } : undefined,
        generationConfig: { temperature: opts?.temperature ?? 0.7, maxOutputTokens: opts?.maxTokens ?? 2000 },
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
    );
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;
    return { text, provider: this.name, model, tokensUsed };
  }
}

// ── Pollinations Provider (custom — not OpenAI-compatible) ─
class PollinationsProvider implements AiProvider {
  name: AiProviderName = 'pollinations';
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.baseUrl = config.ai.providers.pollinations.baseUrl || 'https://text.pollinations.ai';
    this.defaultModel = config.ai.providers.pollinations.defaultModel || 'openai';
  }

  reloadFromEnv() {
    this.baseUrl = config.ai.providers.pollinations.baseUrl || 'https://text.pollinations.ai';
    this.defaultModel = config.ai.providers.pollinations.defaultModel || 'openai';
  }

  applyConfig() { /* no-op */ }
  isConfigured() { return true; }

  async generateText(prompt: string, opts?: AiCompletionOptions): Promise<AiCompletionResult> {
    const model = opts?.model || this.defaultModel;
    const messages: any[] = [];
    if (opts?.systemPrompt) messages.push({ role: 'system', content: opts.systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const { data: responseText } = await axios.post(
      this.baseUrl + '/',
      {
        model,
        messages,
        temperature: opts?.temperature ?? 0.7,
        ...(opts?.maxTokens ? { max_tokens: opts.maxTokens } : {}),
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000,
        responseType: 'text',
      }
    );

    const text = typeof responseText === 'string' ? responseText : String(responseText);
    return { text, provider: this.name, model, tokensUsed: 0 };
  }
}

// ── Hugging Face Provider (Free Inference API) ─────────
class HuggingFaceProvider implements AiProvider {
  name: AiProviderName = 'huggingface';
  private defaultModel: string;

  constructor() {
    this.defaultModel = config.ai.providers.huggingface?.defaultModel || 'microsoft/Phi-3-mini-4k-instruct';
  }

  isConfigured() { return true; }

  reloadFromEnv() {
    this.defaultModel = config.ai.providers.huggingface?.defaultModel || 'microsoft/Phi-3-mini-4k-instruct';
  }

  applyConfig() { /* no-op — HF is always free */ }

  async generateText(prompt: string, opts?: AiCompletionOptions): Promise<AiCompletionResult> {
    const model = opts?.model || this.defaultModel;
    const apiKey = config.ai.providers.huggingface?.apiKey;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const systemMsg = opts?.systemPrompt;
    const fullPrompt = systemMsg ? `${systemMsg}\n\n${prompt}` : prompt;

    try {
      const { data } = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: opts?.maxTokens || 500,
            temperature: opts?.temperature ?? 0.7,
            return_full_text: false,
          },
        },
        { headers, timeout: 60000 }
      );

      const text = Array.isArray(data) ? (data[0]?.generated_text || '') : (data?.generated_text || JSON.stringify(data));
      return { text, provider: this.name, model, tokensUsed: 0 };
    } catch {
      // Fallback: some models use different response format
      const { data } = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        { inputs: fullPrompt },
        { headers, timeout: 60000 }
      );
      const text = Array.isArray(data) ? (data[0]?.generated_text || '') : String(data);
      return { text, provider: this.name, model, tokensUsed: 0 };
    }
  }
}

// ── Provider Registry ──────────────────────────────────
function envFor(name: AiProviderName) {
  const p = config.ai.providers[name];
  return p.apiKey ? p : undefined;
}

const providers: Record<AiProviderName, AiProvider> = {
  openai: new OpenAICompatibleProvider('openai', envFor('openai')),
  anthropic: new AnthropicProvider(envFor('anthropic')),
  gemini: new GeminiProvider(envFor('gemini')),
  groq: new OpenAICompatibleProvider('groq', envFor('groq')),
  mistral: new OpenAICompatibleProvider('mistral', envFor('mistral')),
  cohere: new OpenAICompatibleProvider('cohere', envFor('cohere')),
  deepseek: new OpenAICompatibleProvider('deepseek', envFor('deepseek')),
  perplexity: new OpenAICompatibleProvider('perplexity', envFor('perplexity')),
  pollinations: new PollinationsProvider(),
  huggingface: new HuggingFaceProvider(),
};

// ── Main AI Service (Text) ─────────────────────────────
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
    opts?: AiCompletionOptions & { userId?: string }
  ): Promise<AiCompletionResult> {
    const providerName = opts?.provider || config.ai.defaultProvider as AiProviderName;
    const provider = providers[providerName];

    if (opts?.userId) {
      try {
        const prisma = (await import('../config/database')).default;
        const dbCfg = await (prisma as any).aiProviderConfig.findUnique({
          where: { provider_userId: { provider: providerName, userId: opts.userId } },
        });
        if (dbCfg?.apiKey) {
          (provider as any).applyConfig?.({ apiKey: dbCfg.apiKey, baseUrl: dbCfg.baseUrl || '', defaultModel: dbCfg.defaultModel || '' });
        }
      } catch { /* ignore */ }
    }

    if (!provider || !provider.isConfigured()) {
      const available = this.getAvailableProviders();
      if (available.length === 0) throw new Error('No AI provider configured');
      return providers[available[0]].generateText(prompt, opts);
    }

    return provider.generateText(prompt, opts);
  }

  async generateStructuredJson<T>(prompt: string, opts?: AiCompletionOptions): Promise<T> {
    const result = await this.generateText(prompt, {
      ...opts,
      systemPrompt: (opts?.systemPrompt || '') + ' أعد البيانات بصيغة JSON صالحة فقط.',
    });
    try { return JSON.parse(result.text) as T; }
    catch {
      const match = result.text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]) as T;
      throw new Error('AI response was not valid JSON');
    }
  }
}

export const aiService = new AiService();
export default aiService;
