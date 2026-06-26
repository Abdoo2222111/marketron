import prisma from '../config/database';
import { ApiError } from '../utils/apiError';

export class TeamService {
  async getTeam(userId: string) {
    // Find team where user is owner or member
    let team = await prisma.team.findFirst({
      where: { ownerId: userId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
          },
        },
      },
    });

    if (!team) {
      const membership = await prisma.teamMember.findFirst({
        where: { userId },
        include: {
          team: {
            include: {
              members: {
                include: {
                  user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
                },
              },
            },
          },
        },
      });
      team = membership?.team || null;
    }

    if (!team) {
      throw ApiError.notFound('الفريق غير موجود');
    }

    return team;
  }

  async invite(userId: string, data: { email: string; role?: string }) {
    let team = await prisma.team.findFirst({ where: { ownerId: userId } });

    // Create team if not exists
    if (!team) {
      team = await prisma.team.create({
        data: {
          name: `${(await prisma.user.findUnique({ where: { id: userId } }))?.name || 'فريق'} - فريق`,
          ownerId: userId,
        },
      });

      // Make owner a member
      await prisma.teamMember.create({
        data: { teamId: team.id, userId, role: 'owner', status: 'active' },
      });
    }

    // Check if already invited
    const existing = await prisma.teamMember.findFirst({
      where: { teamId: team.id, invitedEmail: data.email },
    });

    if (existing) {
      throw ApiError.conflict('هذا البريد مدعو مسبقاً');
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        invitedEmail: data.email,
        role: (data.role as any) || 'editor',
        status: 'invited',
      },
    });

    return member;
  }

  async removeMember(userId: string, memberId: string) {
    const team = await prisma.team.findFirst({ where: { ownerId: userId } });
    if (!team) throw ApiError.notFound('الفريق غير موجود');

    const member = await prisma.teamMember.findFirst({
      where: { id: memberId, teamId: team.id },
    });
    if (!member) throw ApiError.notFound('العضو غير موجود');

    if (member.role === 'owner') {
      throw ApiError.badRequest('لا يمكن إزالة مالك الفريق');
    }

    await prisma.teamMember.delete({ where: { id: memberId } });
    return { message: 'تم إزالة العضو بنجاح' };
  }

  async updateMemberRole(userId: string, memberId: string, role: string) {
    const team = await prisma.team.findFirst({ where: { ownerId: userId } });
    if (!team) throw ApiError.notFound('الفريق غير موجود');

    const member = await prisma.teamMember.findFirst({
      where: { id: memberId, teamId: team.id },
    });
    if (!member) throw ApiError.notFound('العضو غير موجود');

    return prisma.teamMember.update({
      where: { id: memberId },
      data: { role: role as any },
    });
  }
}

export const teamService = new TeamService();
