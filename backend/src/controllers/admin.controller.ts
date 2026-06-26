import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/apiResponse';
import prisma from '../config/database';

export class AdminController {
  async getDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const [userCount, campaignCount, contentCount, activeConnections] = await Promise.all([
        prisma.user.count(),
        prisma.campaign.count(),
        prisma.content.count(),
        prisma.platformConnection.count({ where: { status: 'active' } }),
      ]);

      res.json(successResponse({
        users: userCount,
        campaigns: campaignCount,
        contents: contentCount,
        activeConnections,
      }));
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        }),
        prisma.user.count(),
      ]);

      res.json(successResponse({
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }));
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          company: true,
          isActive: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ success: false, error: 'المستخدم غير موجود' });
        return;
      }

      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!user) {
        res.status(404).json({ success: false, error: 'المستخدم غير موجود' });
        return;
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { isActive: !user.isActive },
      });

      res.json(successResponse(
        { id: updated.id, isActive: updated.isActive },
        `تم ${updated.isActive ? 'تفعيل' : 'تعطيل'} المستخدم`
      ));
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
