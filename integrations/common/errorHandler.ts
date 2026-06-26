// ============================================================
// Unified Error Handler - Arabic Error Messages
// ============================================================
// Provides standardized error handling across all platforms with
// Arabic error messages. Handles rate limiting, auth failures,
// validation errors, and network issues.
// ============================================================

import { PlatformName, IntegrationError } from './types';
import { OAUTH_ERROR_MESSAGES } from './oauth';

// ============================================================
// Platform-Specific Error Mappers
// ============================================================
const ERROR_MESSAGES_AR: Record<string, Record<string, string>> = {
  facebook: {
    // أخطاء Facebook API
    '1': 'حدث خطأ داخلي في Facebook',
    '2': 'انتهت صلاحية رمز الوصول',
    '3': 'تم تجاوز حد الطلبات المسموح به',
    '4': 'تم تجاوز حد الطلبات للتطبيق',
    '10': 'ليس لديك صلاحية للوصول إلى هذه البيانات',
    '100': 'معامل غير صالح',
    '101': 'معرّف المستخدم غير صالح',
    '200': 'صلاحية الإعلان منتهية',
    '269': 'تم تجاوز حد الإنفاق اليومي',
    '300': 'رصيد غير كافٍ',
    '368': 'الحملة في حالة غير صالحة لهذا الإجراء',
    '80004': 'تم تجاوز حد الطلبات - يرجى المحاولة لاحقاً',
    'ADC-101': 'فشل تحميل الصورة',
    'ADC-102': 'نوع ملف غير مدعوم',
    'ADC-103': 'أبعاد الصورة غير صالحة',
  },
  instagram: {
    '1': 'حدث خطأ داخلي في Instagram',
    '2': 'انتهت صلاحية رمز الوصول',
    '3': 'تم تجاوز حد الطلبات',
    '4': 'المحتوى مخالف لسياسات Instagram',
    '10': 'ليس لديك صلاحية للوصول',
    '100': 'معامل غير صالح',
    '2207001': 'لا يمكن نشر هذا المحتوى في الوقت الحالي',
    '2207002': 'تم تجاوز حد النشر اليومي',
  },
  tiktok: {
    '40001': 'معامل غير صالح',
    '40002': 'انتهت صلاحية رمز الوصول',
    '40003': 'رمز الوصول غير صالح',
    '40004': 'تم تجاوز حد الطلبات المسموح به (100 طلب/دقيقة)',
    '40005': 'المعلن غير موجود',
    '40006': 'الحملة غير موجودة',
    '40007': 'رصيد غير كافٍ للإعلان',
    '40008': 'المحتوى الإبداعي مخالف للسياسات',
    '40009': 'تم تجاوز حد الإنفاق اليومي',
    '50000': 'خطأ داخلي في TikTok',
    '50001': 'الخدمة غير متاحة حالياً',
  },
  snapchat: {
    'E100': 'معامل غير صالح',
    'E200': 'انتهت صلاحية رمز الوصول',
    'E201': 'رمز التحديث غير صالح',
    'E202': 'تم تجاوز حد الطلبات المسموح به',
    'E203': 'تم تجاوز حد الإنفاق',
    'E300': 'المورد غير موجود',
    'E301': 'الحملة غير موجودة',
    'E302': 'الإعلان غير موجود',
    'E400': 'رصيد غير كافٍ',
    'E401': 'المحتوى مخالف للسياسات',
    'E500': 'خطأ داخلي في Snapchat',
  },
  google: {
    '400': 'طلب غير صالح',
    '401': 'انتهت صلاحية رمز الوصول',
    '403': 'ليس لديك صلاحية للوصول',
    '429': 'تم تجاوز حد الطلبات',
    '500': 'خطأ داخلي في Google',
    '503': 'الخدمة غير متاحة حالياً',
  },
};

// ============================================================
// Default Arabic Messages
// ============================================================
const DEFAULT_ERROR_MESSAGES: Record<PlatformName, string> = {
  facebook: 'حدث خطأ غير متوقع في Facebook',
  instagram: 'حدث خطأ غير متوقع في Instagram',
  tiktok: 'حدث خطأ غير متوقع في TikTok',
  snapchat: 'حدث خطأ غير متوقع في Snapchat',
  google: 'حدث خطأ غير متوقع في Google',
};

// ============================================================
// Main Error Handler
// ============================================================
export function handleIntegrationError(
  error: any,
  platform: PlatformName
): IntegrationError {
  // Extract status and code
  const status = error?.response?.status || error?.status || null;
  const platformCode = extractPlatformCode(error, platform);

  // Determine if retryable
  const retryable = isRetryable(status, platformCode);

  // Get Arabic message
  const messageAr = getArabicMessage(platform, platformCode);

  // Get English message
  const message = getEnglishMessage(error, platform);

  return {
    platform,
    status,
    code: platformCode,
    message,
    messageAr,
    details: error?.response?.data || error?.details || error,
    retryable,
  };
}

function extractPlatformCode(error: any, platform: PlatformName): string {
  const data = error?.response?.data || error?.data || {};

  switch (platform) {
    case 'facebook':
    case 'instagram':
      return data?.error?.code?.toString()
        || data?.error?.error_subcode?.toString()
        || 'UNKNOWN';

    case 'tiktok':
      return data?.code?.toString()
        || 'UNKNOWN';

    case 'snapchat':
      return data?.sub_code
        || data?.error_response?.code
        || data?.error?.code
        || 'UNKNOWN';

    case 'google':
      return data?.error?.code?.toString()
        || 'UNKNOWN';

    default:
      return 'UNKNOWN';
  }
}

function isRetryable(status: number | null, code: string): boolean {
  // Retry on rate limits (429), server errors (5xx), and timeouts
  if (status === 429) return true;
  if (status && status >= 500 && status < 600) return true;

  // Platform-specific retryable codes
  const retryableCodes = ['4', '80004', '50000', '50001', 'E202', 'E500'];
  return retryableCodes.includes(code);
}

function getArabicMessage(platform: PlatformName, code: string): string {
  const platformMessages = ERROR_MESSAGES_AR[platform];
  if (platformMessages && platformMessages[code]) {
    return platformMessages[code];
  }

  // Check OAuth error messages
  const oauthMessage = OAUTH_ERROR_MESSAGES[platform]?.[code];
  if (oauthMessage) return oauthMessage;

  return DEFAULT_ERROR_MESSAGES[platform] || 'حدث خطأ غير متوقع';
}

function getEnglishMessage(error: any, platform: PlatformName): string {
  const data = error?.response?.data || error?.data || {};
  const message =
    data?.error?.message
    || data?.error?.error_user_msg
    || data?.message
    || data?.error_response?.message
    || error?.message
    || `Unknown ${platform} API error`;

  return message;
}

// ============================================================
// Error Creation Helpers
// ============================================================
export function createIntegrationError(
  platform: PlatformName,
  status: number,
  code: string,
  message: string,
  details?: any
): IntegrationError {
  return {
    platform,
    status,
    code,
    message,
    messageAr: getArabicMessage(platform, code),
    details,
    retryable: isRetryable(status, code),
  };
}

export function createRateLimitError(
  platform: PlatformName,
  retryAfterMs: number
): IntegrationError {
  return {
    platform,
    status: 429,
    code: 'RATE_LIMIT',
    message: `Rate limit exceeded for ${platform}`,
    messageAr: `تم تجاوز حد الطلبات المسموح به لـ ${
      platform === 'facebook' ? 'Facebook' :
      platform === 'instagram' ? 'Instagram' :
      platform === 'tiktok' ? 'TikTok' : 'Snapchat'
    }. يرجى المحاولة بعد ${Math.ceil(retryAfterMs / 1000)} ثانية`,
    details: { retryAfterMs, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) },
    retryable: true,
  };
}

export function createAuthError(
  platform: PlatformName,
  message: string
): IntegrationError {
  return {
    platform,
    status: 401,
    code: 'AUTH_ERROR',
    message,
    messageAr: `فشل المصادقة مع ${
      platform === 'facebook' ? 'Facebook' :
      platform === 'instagram' ? 'Instagram' :
      platform === 'tiktok' ? 'TikTok' : 'Snapchat'
    }: ${message}`,
    details: null,
    retryable: false,
  };
}

// ============================================================
// HTTP Error Status to IntegrationError
// ============================================================
export function httpStatusToIntegrationError(
  platform: PlatformName,
  status: number
): IntegrationError | null {
  const errorMap: Record<number, { code: string; message: string }> = {
    400: { code: 'BAD_REQUEST', message: 'Bad request' },
    401: { code: 'UNAUTHORIZED', message: 'Unauthorized - token may be expired' },
    403: { code: 'FORBIDDEN', message: 'Forbidden - insufficient permissions' },
    404: { code: 'NOT_FOUND', message: 'Resource not found' },
    429: { code: 'RATE_LIMITED', message: 'Rate limit exceeded' },
    500: { code: 'SERVER_ERROR', message: 'Platform server error' },
    502: { code: 'BAD_GATEWAY', message: 'Bad gateway' },
    503: { code: 'SERVICE_UNAVAILABLE', message: 'Service temporarily unavailable' },
  };

  const error = errorMap[status];
  if (!error) return null;

  return createIntegrationError(platform, status, error.code, error.message);
}
