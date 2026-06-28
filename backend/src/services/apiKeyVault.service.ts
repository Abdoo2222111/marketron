import prisma from '../config/database';
import { encryptKey, decryptKey, testByokKey, type ByokProvider } from '../integrations/engine-router';
import logger from '../utils/logger';

export interface ApiKeyVaultInput {
  provider: ByokProvider;
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  label?: string;
  isDefaultForType?: 'text' | 'image' | 'audio';
  userId: string;
  orgId?: string;
}

export interface ApiKeyVaultRecord {
  id: string;
  provider: ByokProvider;
  label?: string;
  baseUrl?: string;
  defaultModel?: string;
  isDefaultForType?: 'text' | 'image' | 'audio' | null;
  status: string;
  lastUsedAt?: Date;
  createdAt: Date;
}

export class ApiKeyVaultService {
  async list(userId: string, orgId?: string): Promise<ApiKeyVaultRecord[]> {
    const keys = await prisma.apiKeyVault.findMany({
      where: {
        OR: [
          { userId },
          ...(orgId ? [{ orgId }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return keys.map(k => ({
      id: k.id,
      provider: k.provider as ByokProvider,
      label: k.label || undefined,
      baseUrl: k.baseUrl || undefined,
      defaultModel: k.defaultModel || undefined,
      isDefaultForType: k.isDefaultForType as any || null,
      status: k.status,
      lastUsedAt: k.lastUsedAt || undefined,
      createdAt: k.createdAt,
    }));
  }

  async upsert(input: ApiKeyVaultInput): Promise<ApiKeyVaultRecord> {
    const encrypted = encryptKey(input.apiKey);
    const existing = await prisma.apiKeyVault.findFirst({
      where: { userId: input.userId, provider: input.provider },
    });

    const record = existing
      ? await prisma.apiKeyVault.update({
          where: { id: existing.id },
          data: {
            keyEncrypted: encrypted,
            baseUrl: input.baseUrl,
            defaultModel: input.defaultModel,
            label: input.label,
            isDefaultForType: input.isDefaultForType,
            status: 'active',
          },
        })
      : await prisma.apiKeyVault.create({
          data: {
            provider: input.provider,
            keyEncrypted: encrypted,
            baseUrl: input.baseUrl,
            defaultModel: input.defaultModel,
            label: input.label,
            isDefaultForType: input.isDefaultForType,
            userId: input.userId,
            orgId: input.orgId,
            status: 'active',
          },
        });

    logger.info(`[api-key-vault] ${existing ? 'Updated' : 'Created'} key for ${input.provider}, user=${input.userId}`);
    return {
      id: record.id, provider: record.provider as ByokProvider,
      label: record.label || undefined, baseUrl: record.baseUrl || undefined,
      defaultModel: record.defaultModel || undefined,
      isDefaultForType: record.isDefaultForType as any || null,
      status: record.status, lastUsedAt: record.lastUsedAt || undefined, createdAt: record.createdAt,
    };
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const record = await prisma.apiKeyVault.findFirst({ where: { id, userId } });
    if (!record) return false;
    await prisma.apiKeyVault.delete({ where: { id } });
    logger.info(`[api-key-vault] Deleted key ${record.provider}, user=${userId}`);
    return true;
  }

  async test(provider: ByokProvider, apiKey: string, baseUrl?: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const valid = await testByokKey(provider, apiKey, baseUrl);
      return valid ? { valid: true } : { valid: false, error: 'تعذر الاتصال بالمزوّد. تحقق من المفتاح والعنوان.' };
    } catch (err: any) {
      return { valid: false, error: err.message || 'فشل اختبار المفتاح' };
    }
  }
}

export const apiKeyVaultService = new ApiKeyVaultService();
