import prisma from '../config/database';
import { ApiError } from '../utils/apiError';
import logger from '../utils/logger';

export class OrganizationService {
  async create(data: { name: string; domainSlug?: string; mode?: string }) {
    const existing = data.domainSlug
      ? await prisma.organization.findUnique({ where: { domainSlug: data.domainSlug } })
      : null;
    if (existing) {
      throw ApiError.conflict('هذا الرابط مستخدم مسبقاً');
    }
    const org = await prisma.organization.create({
      data: {
        name: data.name,
        domainSlug: data.domainSlug,
        mode: data.mode || 'client',
      },
    });
    await prisma.businessProfile.create({
      data: { organizationId: org.id, productsServices: '[]', faqs: '[]', targetAudience: '{}' },
    });
    await prisma.personaConfig.create({
      data: { organizationId: org.id },
    });
    return org;
  }

  async getById(id: string) {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: { businessProfile: true, personaConfig: true, _count: { select: { users: true, campaigns: true, conversations: true } } },
    });
    if (!org) throw ApiError.notFound('المؤسسة غير موجودة');
    return org;
  }

  async update(id: string, data: any) {
    const { businessProfile, personaConfig, ...orgData } = data;
    const org = await prisma.organization.update({
      where: { id },
      data: orgData,
    });
    if (businessProfile) {
      await prisma.businessProfile.upsert({
        where: { organizationId: id },
        create: { organizationId: id, ...businessProfile },
        update: businessProfile,
      });
    }
    if (personaConfig) {
      await prisma.personaConfig.upsert({
        where: { organizationId: id },
        create: { organizationId: id, ...personaConfig },
        update: personaConfig,
      });
    }
    return this.getById(id);
  }

  async list(ownerId: string) {
    return prisma.organization.findMany({
      where: { users: { some: { id: ownerId } } },
      include: { _count: { select: { users: true, campaigns: true, conversations: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBusinessProfile(orgId: string) {
    const bp = await prisma.businessProfile.findUnique({ where: { organizationId: orgId } });
    if (!bp) throw ApiError.notFound('ملف النشاط غير موجود');
    return bp;
  }

  async updateBusinessProfile(orgId: string, data: any) {
    return prisma.businessProfile.upsert({
      where: { organizationId: orgId },
      create: { organizationId: orgId, ...data },
      update: data,
    });
  }

  async getPersonaConfig(orgId: string) {
    const pc = await prisma.personaConfig.findUnique({ where: { organizationId: orgId } });
    if (!pc) throw ApiError.notFound('إعدادات الشخصية غير موجودة');
    return pc;
  }

  async updatePersonaConfig(orgId: string, data: any) {
    return prisma.personaConfig.upsert({
      where: { organizationId: orgId },
      create: { organizationId: orgId, ...data },
      update: data,
    });
  }
}

export const organizationService = new OrganizationService();
