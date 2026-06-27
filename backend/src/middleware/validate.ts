import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          error: 'بيانات غير صالحة',
          errors,
        });
        return;
      }
      next(error);
    }
  };
};

export const passwordSchema = (min = 8) => ({
  min,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])/,
  message: `كلمة المرور يجب أن تحتوي على الأقل ${min} أحرف، حرف كبير، حرف صغير، رقم، ورمز خاص`,
});
