import { callOpenAI, SYSTEM_PROMPTS } from '../utils/openai';
import { aiCache } from '../utils/cache';
import { getTemplate, PLATFORM_LIMITS } from './templates';
import { generateBilingualHashtags, suggestEmojis } from '../utils/arabic-text';

// ==================== Type Definitions ====================

export interface ContentGenerationParams {
  type: 'post' | 'article' | 'ad' | 'description' | 'story' | 'reel_script';
  platform: 'facebook' | 'instagram' | 'tiktok' | 'snapchat' | 'x' | 'linkedin';
  keywords: string[];
  tone: 'formal' | 'casual' | 'enthusiastic' | 'humorous' | 'professional' | 'luxury';
  length: 'short' | 'medium' | 'long';
  targetAudience?: string;
  productDescription?: string;
  callToAction?: string;
  language: 'ar' | 'en';
  referenceContent?: string;
}

export interface ContentGenerationResult {
  headline: string;
  body: string;
  hashtags: string[];
  cta: string;
  suggestions: string[];
  emojis: string[];
}

// ==================== Content Generation ====================

export async function generateContent(
  params: ContentGenerationParams
): Promise<ContentGenerationResult> {
  const cacheKey = aiCache.generateKey('generateContent', params);
  const cached = aiCache.get<ContentGenerationResult>(cacheKey);
  if (cached) return cached;

  const limits = PLATFORM_LIMITS[params.platform] || { maxChars: 1000, optimalChars: 300, hashtagLimit: 5 };
  const template = getTemplate(params.platform, params.type);

  const lengthGuide = {
    short: `${params.platform === 'tiktok' ? '50-100' : params.platform === 'snapchat' ? '30-50' : '100-200'} حرف`,
    medium: `200-${limits.optimalChars} حرف`,
    long: `${limits.optimalChars}-${Math.min(limits.maxChars, 2000)} حرف`,
  };

  const toneDescriptions: Record<string, string> = {
    formal: 'لغة رسمية ومهنية، مناسبة للشركات والمؤسسات الكبيرة',
    casual: 'لغة ودودة وعفوية، تناسب التفاعل اليومي مع الجمهور',
    enthusiastic: 'لغة حماسية ومشجعة، تناسب إطلاق المنتجات والعروض',
    humorous: 'لغة فكاهية مرحة، تناسب بناء علاقة ودودة مع الجمهور',
    professional: 'لغة مهنية محترفة، تناسب الخدمات B2B والاستشارات',
    luxury: 'لغة فاخرة وأنيقة، تناسب المنتجات الفاخرة والخدمات الراقية',
  };

  const userMessage = JSON.stringify({
    المهمة: `توليد محتوى ${params.type} لمنصة ${params.platform}`,
    النوع: params.type,
    المنصة: params.platform,
    الكلمات_المفتاحية: params.keywords,
    النبرة: toneDescriptions[params.tone] || params.tone,
    الطول: lengthGuide[params.length] || lengthGuide.medium,
    الجمهور_المستهدف: params.targetAudience || 'عام',
    وصف_المنتج: params.productDescription || 'غير محدد',
    دعوة_للاتفاعل: params.callToAction || 'غير محدد',
    اللغة: params.language === 'ar' ? 'العربية' : 'الإنجليزية',
    القالب_المتوقع: template,
    ملاحظات: 'يجب أن يكون الرد بصيغة JSON مع الحقول: headline, body, hashtags, cta, suggestions, emojis',
    تعليمات_إضافية: `الحد الأقصى للهاشتاغات: ${limits.hashtagLimit}. الطول الأمثل للمحتوى: ${limits.optimalChars} حرف.`,
  });

  const response = await callOpenAI(
    SYSTEM_PROMPTS.contentGenerator,
    JSON.stringify(userMessage),
    {
      temperature: 0.8,
      maxTokens: 2000,
      responseFormat: 'json_object',
    }
  );

  let result: ContentGenerationResult;
  try {
    const parsed = JSON.parse(response);

    // Ensure fields exist with defaults
    result = {
      headline: parsed.headline || '',
      body: parsed.body || '',
      hashtags: parsed.hashtags?.slice(0, limits.hashtagLimit) || generateBilingualHashtags(
        parsed.body || params.keywords.join(' '),
        params.keywords,
        limits.hashtagLimit
      ),
      cta: parsed.cta || params.callToAction || 'تواصل معنا الآن',
      suggestions: parsed.suggestions || [],
      emojis: parsed.emojis || suggestEmojis(params.type, 3),
    };
  } catch {
    // Fallback if JSON parsing fails
    result = {
      headline: `محتوى ${params.type} لـ ${params.platform}`,
      body: response.slice(0, limits.optimalChars),
      hashtags: generateBilingualHashtags(response, params.keywords, limits.hashtagLimit),
      cta: params.callToAction || 'تواصل معنا الآن',
      suggestions: ['أضف صوراً عالية الجودة', 'استخدم رابط في التعليق الأول', 'تفاعل مع المتابعين'],
      emojis: suggestEmojis(params.type, 3),
    };
  }

  // Cache result
  aiCache.set(cacheKey, result, 1800); // 30 minutes TTL
  return result;
}

// ==================== Content Improvement ====================

export async function improveContent(params: {
  content: string;
  platform: string;
  type: string;
  targetAudience?: string;
  improvements: string[];
}): Promise<ContentGenerationResult> {
  const cacheKey = aiCache.generateKey('improveContent', params);
  const cached = aiCache.get<ContentGenerationResult>(cacheKey);
  if (cached) return cached;

  const improvementAreas = params.improvements.join('، ');
  const limits = PLATFORM_LIMITS[params.platform] || { maxChars: 1000, optimalChars: 300, hashtagLimit: 5 };

  const userMessage = JSON.stringify({
    المهمة: 'تحسين محتوى تسويقي موجود',
    المحتوى_الحالي: params.content,
    المنصة: params.platform,
    نوع_المحتوى: params.type,
    الجمهور_المستهدف: params.targetAudience || 'عام',
    مجالات_التحسين: improvementAreas,
    تعليمات: `حسن المحتوى مع الحفاظ على الرسالة الأساسية. الطول المثالي: ${limits.optimalChars} حرف.`,
    ملاحظات: 'يجب أن يكون الرد بصيغة JSON مع الحقول: headline, body, hashtags, cta, suggestions, emojis',
  });

  const response = await callOpenAI(
    SYSTEM_PROMPTS.contentGenerator,
    JSON.stringify(userMessage),
    {
      temperature: 0.7,
      maxTokens: 2000,
      responseFormat: 'json_object',
    }
  );

  let result: ContentGenerationResult;
  try {
    const parsed = JSON.parse(response);
    result = {
      headline: parsed.headline || '',
      body: parsed.body || params.content,
      hashtags: parsed.hashtags?.slice(0, limits.hashtagLimit) || [],
      cta: parsed.cta || 'تواصل معنا الآن',
      suggestions: parsed.suggestions || [],
      emojis: parsed.emojis || suggestEmojis(params.type, 3),
    };
  } catch {
    result = {
      headline: 'محتوى محسّن',
      body: response.slice(0, limits.optimalChars),
      hashtags: [],
      cta: 'تواصل معنا الآن',
      suggestions: params.improvements,
      emojis: suggestEmojis(params.type, 3),
    };
  }

  aiCache.set(cacheKey, result, 3600);
  return result;
}

export default { generateContent, improveContent };
