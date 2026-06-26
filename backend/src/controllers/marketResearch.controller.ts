import { Request, Response, NextFunction } from 'express';
import { marketResearchService } from '../services/marketResearch.service';
import { successResponse, paginationMeta } from '../utils/apiResponse';

export class MarketResearchController {
  async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const { product, country, category } = req.body;
      if (!product || !country) {
        res.status(400).json({ success: false, error: 'المنتج والدولة مطلوبان' });
        return;
      }
      const report = await marketResearchService.analyze(req.user!.userId, { product, country, category });
      res.status(201).json(successResponse(report, 'تم تحليل السوق بنجاح'));
    } catch (error) {
      next(error);
    }
  }

  async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { reports, total } = await marketResearchService.getReports(req.user!.userId, page, limit);
      res.json(successResponse(reports, undefined, paginationMeta(page, limit, total)));
    } catch (error) {
      next(error);
    }
  }

  async getReportById(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await marketResearchService.getReportById(req.user!.userId, req.params.id);
      res.json(successResponse(report));
    } catch (error) {
      next(error);
    }
  }

  async deleteReport(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await marketResearchService.deleteReport(req.user!.userId, req.params.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}

export const marketResearchController = new MarketResearchController();
