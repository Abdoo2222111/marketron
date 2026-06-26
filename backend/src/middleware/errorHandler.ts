import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import logger from '../utils/logger';

// Legacy compatibility alias for old services
export const AppError = ApiError;

/**
 * Global error handler middleware
 * Handles all errors and returns a consistent response format
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  if (err instanceof ApiError) {
    logger.warn(`API Error: ${err.statusCode} - ${err.message}`);
  } else {
    logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
  }

  // Handle known API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  // Handle Prisma errors
  if (err.constructor?.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    let message = 'خطأ في قاعدة البيانات';

    if (prismaErr.code === 'P2002') {
      const target = (prismaErr.meta?.target as string[])?.join(', ') || '';
      message = `هذه القيمة موجودة مسبقاً${target ? ` (${target})` : ''}`;
    } else if (prismaErr.code === 'P2025') {
      message = 'المورد المطلوب غير موجود';
    } else if (prismaErr.code === 'P2003') {
      message = 'خطأ في العلاقة بين البيانات';
    }

    res.status(409).json({
      success: false,
      error: message,
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'رمز المصادقة غير صالح',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'انتهت صلاحية رمز المصادقة',
    });
    return;
  }

  // Handle multer errors (file upload)
  if (err.constructor?.name === 'MulterError') {
    const multerErr = err as any;
    let message = 'خطأ في رفع الملف';
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      message = 'حجم الملف كبير جداً';
    } else if (multerErr.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'عدد الملفات غير مسموح به';
    }

    res.status(400).json({
      success: false,
      error: message,
    });
    return;
  }

  // Default 500 error
  res.status(500).json({
    success: false,
    error: 'خطأ داخلي في الخادم',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler for unknown routes
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'المسار المطلوب غير موجود',
  });
};
