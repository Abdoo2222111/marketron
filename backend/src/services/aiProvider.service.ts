import prisma from '../config/database';
import { config } from '../config';
import { ApiError } from '../utils/apiError';
import logger from '../utils/logger';
import type { AiProviderName } from '../integrations/aiService';

const PROVIDER_NAMES: AiProviderName[] = [
  'openai', 'anthropic', 'gemini', 'groq',
  'mistral', 'cohere', 'deepseek', 'perplexity',
  'pollinations',
];

export class AiProviderService {
  async getProviderConfigs(userId: string) {
    const dbConfigs = await prisma.aiProviderConfig.findMany({
      where: { userId },
    });
    const dbMap = new Map(dbConfigs.map(c => [c.provider, c]));

    return PROVIDER_NAMES.map(name => {
      const env = config.ai.providers[name];
      const db = dbMap.get(name);
      const hasEnvKey = !!env.apiKey;
      const hasDbKey = !!db?.apiKey;
      const isFree = name === 'pollinations';
      return {
        provider: name,
        label: name === 'pollinations' ? 'Pollinations AI' : name.charAt(0).toUpperCase() + name.slice(1),
        configured: isFree || hasEnvKey || hasDbKey,
        source: isFree ? 'free' : hasEnvKey ? 'env' : hasDbKey ? 'database' : 'none',
        apiKey: db?.apiKey || (isFree ? 'free' : ''),
        baseUrl: db?.baseUrl || env.baseUrl,
        defaultModel: db?.defaultModel || env.defaultModel,
        isActive: db?.isActive ?? true,
      };
    });
  }

  async upsertProviderConfig(
    userId: string,
    provider: string,
    data: { apiKey?: string; baseUrl?: string; defaultModel?: string; isActive?: boolean }
  ) {
    if (!PROVIDER_NAMES.includes(provider as AiProviderName)) {
      throw ApiError.badRequest(`المزود ${provider} غير مدعوم`);
    }

    const existing = await prisma.aiProviderConfig.findUnique({
      where: { provider_userId: { provider, userId } },
    });

    if (!data.apiKey && !existing?.apiKey && provider !== 'pollinations') {
      throw ApiError.badRequest('مفتاح API مطلوب');
    }

    const upserted = await prisma.aiProviderConfig.upsert({
      where: { provider_userId: { provider, userId } },
      create: { userId, provider, ...data },
      update: { ...data },
    });

    logger.info(`AI provider config updated: ${provider} for user ${userId}`);
    return upserted;
  }

  async deleteProviderConfig(userId: string, provider: string) {
    await prisma.aiProviderConfig.delete({
      where: { provider_userId: { provider, userId } },
    });
    logger.info(`AI provider config deleted: ${provider} for user ${userId}`);
  }

  async getEffectiveConfig(provider: AiProviderName) {
    const env = config.ai.providers[provider];
    if (env.apiKey) {
      return { apiKey: env.apiKey, baseUrl: env.baseUrl, defaultModel: env.defaultModel };
    }
    return null;
  }
}

export const aiProviderService = new AiProviderService();
