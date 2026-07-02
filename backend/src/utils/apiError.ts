export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: any[];

  constructor(
    statusCode: number,
    message: string,
    errors?: any[],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: any[]): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'غير مصرح. يرجى تسجيل الدخول'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'ليس لديك صلاحية للوصول'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'المورد غير موجود'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static tooManyRequests(message = 'طلبات كثيرة جداً. حاول لاحقاً'): ApiError {
    return new ApiError(429, message);
  }

  static internal(message = 'خطأ داخلي في الخادم'): ApiError {
    return new ApiError(500, message);
  }

  static notImplemented(message = 'هذه الميزة قيد التطوير'): ApiError {
    return new ApiError(501, message);
  }
}
