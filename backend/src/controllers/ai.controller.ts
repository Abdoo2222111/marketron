import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { successResponse } from '../utils/apiResponse';

export class AiController {
  async generateText(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aiService.generateText(req.user!.userId, req.body);
      res.json(successResponse(result, 'تم توليد النص الإعلاني'));
    } catch (error) {
      next(error);
    }
  }

  async generateImage(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aiService.generateImage(req.user!.userId, req.body);
      res.json(successResponse(result, 'تم توليد الصورة الإعلانية'));
    } catch (error) {
      next(error);
    }
  }

  async analyzeCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aiService.analyzeCampaign(req.user!.userId, req.body.campaignId);
      res.json(successResponse(result, 'تم تحليل الحملة'));
    } catch (error) {
      next(error);
    }
  }

  async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aiService.getRecommendations(req.user!.userId, req.body);
      res.json(successResponse(result, 'تم إنشاء التوصيات'));
    } catch (error) {
      next(error);
    }
  }

  async whyNotSelling(req: Request, res: Response, next: NextFunction) {
    try {
      const { product, country, campaignId } = req.body;
      if (!product || !country) {
        res.status(400).json({ success: false, error: 'المنتج والدولة مطلوبان' });
        return;
      }
      const result = await aiService.whyNotSelling(req.user!.userId, { product, country, campaignId });
      res.json(successResponse(result, 'تم تحليل الأداء'));
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AiController();
