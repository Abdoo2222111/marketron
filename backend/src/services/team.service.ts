import prisma from '../config/database';
import { ApiError } from '../utils/apiError';

export class TeamService {
  async getTeam(userId: string) {
    let team = await prisma.team.findFirst({
      where: { ownerId: userId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
          },
        },
      },
    });

    if (!team) {
      team = await prisma.team.create({
        data: { name: 'فريق', ownerId: userId },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
            },
          },
        },
      });
    }

    return team;
  }

  async invite(userId: string, data: { email: string; role?: string }) {
    let team = await prisma.team.findFirst({ where: { ownerId: userId } });
    if (!team) {
      team = await prisma.team.create({ data: { name: 'فريق', ownerId: userId } });
    }

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw ApiError.notFound('المستخدم غير موجود');

    const existing = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: team.id, userId: user.id } },
    });
    if (existing) throw ApiError.conflict('المستخدم موجود مسبقاً في الفريق');

    const member = await prisma.teamMember.create({
      data: { teamId: team.id, userId: user.id, role: data.role || 'member' },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } },
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

    await prisma.teamMember.delete({ where: { id: memberId } });
    return { message: 'تم حذف العضو بنجاح' };
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
      data: { role },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } },
    });
  }
}

export const teamService = new TeamService();
