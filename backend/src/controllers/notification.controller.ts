import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { successResponse, paginationMeta } from '../utils/apiResponse';

export class NotificationController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { notifications, total, unreadCount } = await notificationService.list(req.user!.userId, page, limit);
      res.json(successResponse({ notifications, unreadCount }, undefined, paginationMeta(page, limit, total)));
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(req.user!.userId, req.params.id);
      res.json(successResponse(null, 'تم تحديد الإشعار كمقروء'));
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      res.json(successResponse(null, 'تم تحديد جميع الإشعارات كمقروءة'));
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
