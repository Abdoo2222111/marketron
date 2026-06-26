import { Request, Response, NextFunction } from 'express';
import { settingsService } from '../services/settings.service';
import { successResponse, paginationMeta } from '../utils/apiResponse';

export class SettingsController {
  async getBilling(req: Request, res: Response, next: NextFunction) {
    try {
      const billing = await settingsService.getBilling(req.user!.userId);
      res.json(successResponse(billing));
    } catch (error) {
      next(error);
    }
  }

  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { invoices, total } = await settingsService.getInvoices(req.user!.userId, page, limit);
      res.json(successResponse(invoices, undefined, paginationMeta(page, limit, total)));
    } catch (error) {
      next(error);
    }
  }

  async getTeamSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await settingsService.getTeamSettings(req.user!.userId);
      res.json(successResponse(team));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await settingsService.updateProfile(req.user!.userId, req.body);
      res.json(successResponse(user, 'تم تحديث الإعدادات'));
    } catch (error) {
      next(error);
    }
  }
}

export const settingsController = new SettingsController();
