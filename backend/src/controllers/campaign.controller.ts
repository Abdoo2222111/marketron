import { Request, Response, NextFunction } from 'express';
import { campaignService } from '../services/campaign.service';
import { successResponse, paginationMeta } from '../utils/apiResponse';

// BigInt serialization fix for JSON
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

export class CampaignController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const platform = req.query.platform as string;
      const sortBy = req.query.sortBy as string;
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const { campaigns, total } = await campaignService.list({
        userId: req.user!.userId,
        page,
        limit,
        search,
        status,
        platform,
        sortBy,
        sortOrder,
      });

      res.json(successResponse(campaigns, undefined, paginationMeta(page, limit, total)));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignService.getById(req.user!.userId, req.params.id);
      res.json(successResponse(campaign));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignService.create(req.user!.userId, req.body);
      res.status(201).json(successResponse(campaign, 'تم إنشاء الحملة بنجاح'));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignService.update(req.user!.userId, req.params.id, req.body);
      res.json(successResponse(campaign, 'تم تحديث الحملة بنجاح'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await campaignService.delete(req.user!.userId, req.params.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignService.duplicate(req.user!.userId, req.params.id);
      res.status(201).json(successResponse(campaign, 'تم نسخ الحملة بنجاح'));
    } catch (error) {
      next(error);
    }
  }

  async pause(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignService.pause(req.user!.userId, req.params.id);
      res.json(successResponse(campaign, 'تم إيقاف الحملة مؤقتاً'));
    } catch (error) {
      next(error);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignService.activate(req.user!.userId, req.params.id);
      res.json(successResponse(campaign, 'تم تفعيل الحملة'));
    } catch (error) {
      next(error);
    }
  }

  async getInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const insights = await campaignService.getInsights(req.user!.userId, req.params.id);
      res.json(successResponse(insights));
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await campaignService.getStats(req.user!.userId);
      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  }
}

export const campaignController = new CampaignController();
