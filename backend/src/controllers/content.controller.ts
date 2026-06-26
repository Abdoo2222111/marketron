import { Request, Response, NextFunction } from 'express';
import { contentService } from '../services/content.service';
import { successResponse, paginationMeta } from '../utils/apiResponse';

export class ContentController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as string;
      const search = req.query.search as string;

      const { contents, total } = await contentService.list({
        userId: req.user!.userId,
        page, limit, type, search,
      });

      res.json(successResponse(contents, undefined, paginationMeta(page, limit, total)));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await contentService.getById(req.user!.userId, req.params.id);
      res.json(successResponse(content));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const fileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
      const content = await contentService.create(req.user!.userId, {
        ...req.body,
        fileUrl,
        fileSize: req.file?.size,
      });
      res.status(201).json(successResponse(content, 'تم رفع المحتوى بنجاح'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await contentService.delete(req.user!.userId, req.params.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await contentService.generateAiContent(req.user!.userId, req.body);
      res.json(successResponse(result, 'تم توليد المحتوى بالذكاء الاصطناعي'));
    } catch (error) {
      next(error);
    }
  }
}

export const contentController = new ContentController();
