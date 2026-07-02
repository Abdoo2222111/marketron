import prisma from '../config/database';
import { ApiError } from '../utils/apiError';

export class WorkspaceService {
  async createWorkspace(ownerId: string, data: {
    companyName: string;
    companySize?: string;
    industry?: string;
    country?: string;
    city?: string;
    vatNumber?: string;
  }) {
    const org = await prisma.organization.create({
      data: {
        name: data.companyName,
        ...(data as any),
      } as any,
    });

    // Associate owner with the organization
    await prisma.user.update({
      where: { id: ownerId },
      data: { organizationId: org.id },
    });

    // Store additional profile info
    await prisma.clientProfile.upsert({
      where: { userId: ownerId },
      update: {
        companyName: data.companyName,
        companySize: data.companySize,
        industry: data.industry,
        country: data.country,
        city: data.city,
      },
      create: {
        userId: ownerId,
        companyName: data.companyName,
        companySize: data.companySize,
        industry: data.industry,
        country: data.country,
        city: data.city,
      },
    });

    return org;
  }

  async getWorkspace(ownerId: string) {
    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      include: { organization: true },
    });
    if (!user?.organization) return null;

    const org = user.organization;

    // Get all users in this org as "clients"
    const clients = await prisma.user.findMany({
      where: { organizationId: org.id },
      select: { id: true, name: true, email: true, avatarUrl: true, role: true },
    });

    // Get billing info (invoices for org members)
    const billing = await prisma.invoice.findMany({
      where: { userId: { in: clients.map((c: { id: string }) => c.id) } },
    });

    return {
      ...org,
      clients: clients.map((c: { id: string; name: string | null; email: string; avatarUrl: string | null; role: string }) => ({
        id: c.id,
        userId: c.id,
        role: 'member',
        permissions: JSON.stringify(['view_campaigns', 'view_reports']),
        user: {
          id: c.id,
          name: c.name,
          email: c.email,
          avatar: c.avatarUrl,
          role: c.role,
        },
      })),
      billing,
    };
  }

  async updateWorkspace(ownerId: string, data: any) {
    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { organizationId: true },
    });
    if (!user?.organizationId) throw ApiError.notFound('مساحة العمل غير موجودة');

    return prisma.organization.update({
      where: { id: user.organizationId },
      data: data as any,
    });
  }

  async addClientToWorkspace(ownerId: string, data: {
    email: string;
    name: string;
    role?: string;
  }) {
    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { organizationId: true, organization: { select: { name: true } } },
    });
    if (!user?.organizationId || !user.organization) throw ApiError.notFound('مساحة العمل غير موجودة');

    // Find or create user
    let client = await prisma.user.findUnique({ where: { email: data.email } });
    if (!client) {
      client = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: '$2b$10$placeholder', // Will be set on first login
          role: 'client',
          company: user.organization.name,
          organizationId: user.organizationId,
        },
      });
    } else {
      // Update existing user's org
      await prisma.user.update({
        where: { id: client.id },
        data: { organizationId: user.organizationId },
      });
    }

    return {
      id: client.id,
      userId: client.id,
      role: data.role || 'member',
      permissions: JSON.stringify(['view_campaigns', 'view_reports']),
      user: { id: client.id, name: client.name, email: client.email, avatar: client.avatarUrl },
    };
  }

  async removeClientFromWorkspace(ownerId: string, clientId: string) {
    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { organizationId: true },
    });
    if (!user?.organizationId) throw ApiError.notFound('مساحة العمل غير موجودة');

    const client = await prisma.user.findFirst({
      where: { id: clientId, organizationId: user.organizationId },
    });
    if (!client) throw ApiError.notFound('العميل غير موجود');

    // Remove from org instead of deleting
    await prisma.user.update({
      where: { id: clientId },
      data: { organizationId: null },
    });
    return { message: 'تم حذف العميل من مساحة العمل' };
  }

  async getWorkspaceStats(ownerId: string) {
    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { organizationId: true },
    });
    if (!user?.organizationId) return null;

    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: {
        _count: { select: { users: true } },
      } as any,
    });
    if (!org) return null;

    const campaignCount = await prisma.campaign.count({
      where: { userId: ownerId },
    });

    const totalSpend = await prisma.campaign.aggregate({
      where: { userId: ownerId },
      _sum: { spend: true },
    });

    return {
      clientCount: (org as any)._count.users,
      campaignCount,
      totalSpend: totalSpend._sum.spend || 0,
      storageUsed: 0,
      storageLimit: 0,
      subscriptionTier: 'starter',
      status: 'active',
    };
  }
}

export const workspaceService = new WorkspaceService();
