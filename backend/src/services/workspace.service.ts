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
    const workspace = await prisma.clientWorkspace.create({
      data: {
        ownerId,
        companyName: data.companyName,
        companySize: data.companySize,
        industry: data.industry,
        country: data.country,
        city: data.city,
        vatNumber: data.vatNumber,
        status: 'trial',
        subscriptionTier: 'starter',
        subscriptionEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    // Add owner as client
    await prisma.workspaceClient.create({
      data: {
        workspaceId: workspace.id,
        userId: ownerId,
        role: 'owner',
        permissions: JSON.stringify(['all']),
      },
    });

    return workspace;
  }

  async getWorkspace(ownerId: string) {
    const workspace = await prisma.clientWorkspace.findFirst({
      where: { ownerId },
      include: {
        clients: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, role: true },
            },
          },
        },
        billing: true,
      },
    });
    return workspace;
  }

  async updateWorkspace(ownerId: string, data: any) {
    const workspace = await prisma.clientWorkspace.findFirst({
      where: { ownerId },
    });
    if (!workspace) throw ApiError.notFound('مساحة العمل غير موجودة');

    return prisma.clientWorkspace.update({
      where: { id: workspace.id },
      data,
    });
  }

  async addClientToWorkspace(ownerId: string, data: {
    email: string;
    name: string;
    role?: string;
  }) {
    const workspace = await prisma.clientWorkspace.findFirst({
      where: { ownerId },
    });
    if (!workspace) throw ApiError.notFound('مساحة العمل غير موجودة');

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: '$2b$10$placeholder', // Will be set on first login
          role: 'client',
          company: workspace.companyName,
        },
      });
    }

    // Add to workspace
    const client = await prisma.workspaceClient.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: data.role || 'member',
        permissions: JSON.stringify(['view_campaigns', 'view_reports']),
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    return client;
  }

  async removeClientFromWorkspace(ownerId: string, clientId: string) {
    const workspace = await prisma.clientWorkspace.findFirst({
      where: { ownerId },
    });
    if (!workspace) throw ApiError.notFound('مساحة العمل غير موجودة');

    const client = await prisma.workspaceClient.findFirst({
      where: { id: clientId, workspaceId: workspace.id },
    });
    if (!client) throw ApiError.notFound('العميل غير موجود');

    await prisma.workspaceClient.delete({ where: { id: clientId } });
    return { message: 'تم حذف العميل من مساحة العمل' };
  }

  async getWorkspaceStats(ownerId: string) {
    const workspace = await prisma.clientWorkspace.findFirst({
      where: { ownerId },
    });
    if (!workspace) return null;

    const clientCount = await prisma.workspaceClient.count({
      where: { workspaceId: workspace.id, isActive: true },
    });

    const campaignCount = await prisma.campaign.count({
      where: { userId: ownerId },
    });

    const totalSpend = await prisma.campaign.aggregate({
      where: { userId: ownerId },
      _sum: { spend: true },
    });

    return {
      clientCount,
      campaignCount,
      totalSpend: totalSpend._sum.spend || 0,
      storageUsed: Number(workspace.storageUsed),
      storageLimit: Number(workspace.storageLimit),
      subscriptionTier: workspace.subscriptionTier,
      status: workspace.status,
    };
  }
}

export const workspaceService = new WorkspaceService();
