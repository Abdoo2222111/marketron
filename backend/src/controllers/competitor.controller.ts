import { Request, Response, NextFunction } from 'express';
import { competitorService } from '../services/competitor.service';
import { successResponse, paginationMeta } from '../utils/apiResponse';

export class CompetitorController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { competitors, total } = await competitorService.list(req.user!.userId, page, limit);
      res.json(successResponse(competitors, undefined, paginationMeta(page, limit, total)));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const competitor = await competitorService.getById(req.user!.userId, req.params.id);
      res.json(successResponse(competitor));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const competitor = await competitorService.create(req.user!.userId, req.body);
      res.status(201).json(successResponse(competitor, 'تم إضافة المنافس بنجاح'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await competitorService.delete(req.user!.userId, req.params.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getAds(req: Request, res: Response, next: NextFunction) {
    try {
      const ads = await competitorService.getAds(req.user!.userId, req.params.id);
      res.json(successResponse(ads));
    } catch (error) {
      next(error);
    }
  }

  async compare(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length < 2) {
        res.status(400).json({ success: false, error: 'يجب توفير معرفين على الأقل للمقارنة' });
        return;
      }
      const result = await competitorService.compare(req.user!.userId, ids);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}

export const competitorController = new CompetitorController();
