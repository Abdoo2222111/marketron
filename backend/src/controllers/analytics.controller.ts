import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { successResponse } from '../utils/apiResponse';

export class AnalyticsController {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await analyticsService.getOverview(req.user!.userId);
      res.json(successResponse(overview));
    } catch (error) {
      next(error);
    }
  }

  async getAudience(req: Request, res: Response, next: NextFunction) {
    try {
      const audience = await analyticsService.getAudience(req.user!.userId);
      res.json(successResponse(audience));
    } catch (error) {
      next(error);
    }
  }

  async getTiming(req: Request, res: Response, next: NextFunction) {
    try {
      const timing = await analyticsService.getTiming(req.user!.userId);
      res.json(successResponse(timing));
    } catch (error) {
      next(error);
    }
  }

  async getCost(req: Request, res: Response, next: NextFunction) {
    try {
      const cost = await analyticsService.getCost(req.user!.userId);
      res.json(successResponse(cost));
    } catch (error) {
      next(error);
    }
  }

  async getCustom(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getCustom(req.user!.userId, req.query);
      res.json(successResponse(data));
    } catch (error) {
      next(error);
    }
  }

  async saveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await analyticsService.saveReport(req.user!.userId, req.body);
      res.status(201).json(successResponse(report, 'تم حفظ التقرير'));
    } catch (error) {
      next(error);
    }
  }

  async deleteReport(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.deleteReport(req.user!.userId, req.params.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async exportReport(req: Request, res: Response, next: NextFunction) {
    try {
      const format = (req.query.format as string) || 'csv';
      const result = await analyticsService.exportReport(req.user!.userId, req.params.id, format);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
