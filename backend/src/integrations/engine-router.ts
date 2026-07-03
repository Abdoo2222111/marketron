import { config } from '../config';
import logger from '../utils/logger';
import { personaInjector, type SectionType } from './persona-injector';
import * as pollinationsService from './pollinationsService';
import type { AiProviderName } from './aiService';

// ── BYOK Provider types supported ──────────────────────
export type ByokProvider = 'openai' | 'anthropic' | 'openrouter' | 'deepseek' | 'google' | 'pollinations' | 'zen';

export interface EngineRequest {
  section: SectionType;
  prompt: string;
  userId: string;
  orgId?: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'embedding' | 'vision';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  size?: string;
  businessContext?: Record<string, any>;
  extraParams?: Record<string, any>;
}

export interface EngineResult {
  success: boolean;
  data: any;
  provider: ByokProvider;
  model: string;
  fallbackUsed: boolean;
}

// ── BYOK vault (loaded from DB at runtime) ─────────────
interface ByokVaultEntry {
  provider: ByokProvider;
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  isDefaultForType?: string;
}

async function loadByokKeys(userId: string, orgId?: string): Promise<ByokVaultEntry[]> {
  try {
    const prisma = (await import('../config/database')).default;
    const configs = await (prisma as any).apiKeyVault.findMany({
      where: {
        OR: [
          { userId, status: 'active' },
          ...(orgId ? [{ orgId, status: 'active' }] : []),
        ],
      },
    });
    return (configs || []).map((c: any) => ({
      provider: c.provider as ByokProvider,
      apiKey: c.keyEncrypted ? decryptKey(c.keyEncrypted) : '',
      baseUrl: c.baseUrl || undefined,
      defaultModel: c.defaultModel || undefined,
      isDefaultForType: c.isDefaultForType || undefined,
    }));
  } catch {
    return [];
  }
}

// Simple AES-like encryption using Node.js crypto
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY || 'marketron-default-dev-key-32chars!';

function getKey(): Buffer {
  return crypto.scryptSync(MASTER_KEY, 'marketron-salt', 32);
}

export function encryptKey(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptKey(encrypted: string): string {
  try {
    const key = getKey();
    const parts = encrypted.split(':');
    if (parts.length !== 3) return encrypted;
    const [ivHex, authTagHex, ciphertext] = parts;
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return encrypted;
  }
}

// Strip trailing /v1 or /v1/ so we can consistently append it
function normalizeBaseUrl(url: string): string {
  return url.replace(/\/v1\/?$/, '');
}

// ── Test a BYOK key by making a small API call ─────────
export async function testByokKey(provider: ByokProvider, apiKey: string, baseUrl?: string): Promise<boolean> {
  try {
    const axios = (await import('axios')).default;
    const url = normalizeBaseUrl(baseUrl || getDefaultBaseUrl(provider));
    const { status } = await axios.get(`${url}/v1/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 15000,
    });
    return status === 200;
  } catch {
    return false;
  }
}

function getDefaultBaseUrl(provider: ByokProvider): string {
  const map: Record<ByokProvider, string> = {
    openai: 'https://api.openai.com',
    anthropic: 'https://api.anthropic.com',
    openrouter: 'https://openrouter.ai/api',
    deepseek: 'https://api.deepseek.com',
    google: 'https://generativelanguage.googleapis.com',
    pollinations: config.ai.providers.pollinations.baseUrl,
    zen: 'https://opencode.ai/zen',
  };
  return map[provider] || '';
}

// ── Main engine router ─────────────────────────────────
export class EngineRouter {
  async route(req: EngineRequest): Promise<EngineResult> {
    const { section, prompt, userId, orgId, type, businessContext } = req;

    // 1. Inject persona
    const enrichedPrompt = personaInjector.inject(section, prompt, businessContext);

    // 2. Load BYOK keys for this user
    const userKeys = await loadByokKeys(userId, orgId);
    const matchingKey = userKeys.find(k => {
      if (type === 'text' && k.isDefaultForType === 'text') return true;
      if (type === 'image' && k.isDefaultForType === 'image') return true;
      if (type === 'audio' && k.isDefaultForType === 'audio') return true;
      return false;
    });

    // 3. Determine provider + params
    const fallbackUsed = !matchingKey;
    const provider = matchingKey?.provider || 'pollinations';
    const apiKey = matchingKey?.apiKey || '';
    const baseUrl = matchingKey?.baseUrl;

    logger.info(`[engine-router] section=${section} type=${type} provider=${provider} fallback=${fallbackUsed}`);

    try {
      let result: any;

      switch (type) {
        case 'text': {
          if (!fallbackUsed && apiKey) {
            result = await this.callByokText(provider, enrichedPrompt, apiKey, baseUrl, req);
          } else {
            result = await this.callPollinationsText(enrichedPrompt, req);
          }
          break;
        }
        case 'image': {
          if (!fallbackUsed && apiKey) {
            result = await this.callByokImage(provider, enrichedPrompt, apiKey, baseUrl, req);
          } else {
            result = await pollinationsService.generateImage({
              prompt: enrichedPrompt,
              model: req.model || 'flux',
              size: req.size || '1024x1024',
              ...req.extraParams,
            });
          }
          break;
        }
        case 'audio':
          result = await pollinationsService.generateAudio({
            text: enrichedPrompt,
            model: req.model || 'elevenflash',
            ...req.extraParams,
          });
          break;
        case 'video':
          result = await pollinationsService.generateVideo({
            prompt: enrichedPrompt,
            model: req.model || 'veo',
            size: req.size || '1920x1080',
            ...req.extraParams,
          });
          break;
        case 'vision':
          result = await pollinationsService.analyzeImage({
            imageUrl: req.extraParams?.imageUrl || '',
            prompt: enrichedPrompt,
            model: req.model || 'gemini-3-flash',
          });
          break;
        case 'embedding':
          result = await pollinationsService.generateEmbeddings({
            input: enrichedPrompt,
            model: req.model || 'openai-3-small',
            dimensions: req.extraParams?.dimensions || 512,
          });
          break;
        default:
          throw new Error(`Unknown generation type: ${type}`);
      }

      return { success: true, data: result, provider, model: req.model || 'default', fallbackUsed };
    } catch (error: any) {
      // If BYOK fails → fallback to Pollinations
      if (!fallbackUsed) {
        logger.warn(`[engine-router] BYOK failed for ${provider}, falling back to Pollinations: ${error.message}`);
        try {
          let result: any;
          if (type === 'text') {
            result = await this.callPollinationsText(enrichedPrompt, req);
          } else if (type === 'image') {
            result = await pollinationsService.generateImage({
              prompt: enrichedPrompt,
              model: req.model || 'flux',
              size: req.size || '1024x1024',
              ...req.extraParams,
            });
          } else {
            throw error;
          }
          return { success: true, data: result, provider: 'pollinations', model: req.model || 'default', fallbackUsed: true };
        } catch {
          return { success: false, data: null, provider, model: req.model || 'default', fallbackUsed: true, ...{ error: error.message } };
        }
      }
      return { success: false, data: null, provider, model: req.model || 'default', fallbackUsed, ...{ error: error.message } };
    }
  }

  private async callPollinationsText(prompt: string, req: EngineRequest): Promise<string> {
    const { aiService } = await import('./aiService');
    const result = await aiService.generateText(prompt, {
      provider: 'pollinations',
      model: req.model || 'openai',
      temperature: req.temperature ?? 0.7,
      maxTokens: req.maxTokens ?? 2000,
    });
    return result.text;
  }

  private async callByokText(provider: ByokProvider, prompt: string, apiKey: string, baseUrl?: string, req?: EngineRequest): Promise<string> {
    const axios = (await import('axios')).default;
    const url = normalizeBaseUrl(baseUrl || getDefaultBaseUrl(provider));
    const model = req?.model || 'gpt-4o-mini';

    const { data } = await axios.post(
      `${url}/v1/chat/completions`,
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: req?.temperature ?? 0.7,
        max_tokens: req?.maxTokens ?? 2000,
      },
      {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        timeout: 60000,
      }
    );
    return data.choices?.[0]?.message?.content || '';
  }

  private async callByokImage(provider: ByokProvider, prompt: string, apiKey: string, baseUrl?: string, req?: EngineRequest): Promise<any> {
    const axios = (await import('axios')).default;
    const url = normalizeBaseUrl(baseUrl || getDefaultBaseUrl(provider));
    const model = req?.model || 'dall-e-3';

    const { data } = await axios.post(
      `${url}/v1/images/generations`,
      { model, prompt, n: 1, size: req?.size || '1024x1024' },
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, timeout: 120000 }
    );
    return { images: data.data || [], model };
  }
}

export const engineRouter = new EngineRouter();
