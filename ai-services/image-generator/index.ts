import { callOpenAI, IMAGE_SYSTEM_PROMPT } from '../utils/openai';
import { generateImageWithAI } from '../utils/openai';
import { aiCache } from '../utils/cache';
import { getImagePromptTemplate, STYLE_MAPPINGS } from './prompts';

// ==================== Type Definitions ====================

export interface ImageGenerationParams {
  prompt: string; // Arabic description of the image
  style: 'professional' | 'creative' | 'minimal' | 'luxury' | 'fun' | 'modern' | 'traditional';
  platform: string;
  aspectRatio: '1:1' | '4:5' | '9:16' | '16:9';
  brandColors?: string[];
  includeText?: string;
  referenceImages?: string[];
}

export interface ImageGenerationResult {
  imageUrl: string;
  variations: string[];
  suggestedText?: string;
  revisedPrompt?: string;
}

// ==================== Image Generation ====================

export async function generateImage(
  params: ImageGenerationParams
): Promise<ImageGenerationResult> {
  const cacheKey = aiCache.generateKey('generateImage', {
    style: params.style,
    platform: params.platform,
    aspectRatio: params.aspectRatio,
    brandColors: params.brandColors,
    prompt: params.prompt.substring(0, 100),
  });
  const cached = aiCache.get<ImageGenerationResult>(cacheKey);
  if (cached) return cached;

  // First, convert Arabic prompt to English using AI
  const styleEnglish = STYLE_MAPPINGS[params.style] || STYLE_MAPPINGS.modern;

  const aspectRatioDescriptions: Record<string, string> = {
    '1:1': 'square format 1:1, ideal for Instagram feed',
    '4:5': 'portrait format 4:5, ideal for Instagram feed and Facebook',
    '9:16': 'vertical format 9:16, ideal for stories, reels, TikTok, and Snapchat',
    '16:9': 'landscape format 16:9, ideal for YouTube thumbnails and Facebook cover',
  };

  const userMessage = JSON.stringify({
    المهمة: 'تحويل وصف عربي لصورة إلى prompt إنجليزي محترف',
    الوصف_العربي: params.prompt,
    النمط: params.style,
    وصف_النمط_بالإنجليزي: styleEnglish,
    الألوان: params.brandColors?.join(', ') || 'غير محددة',
    النص_المطلوب_ظهوره: params.includeText || 'لا يوجد',
    حجم_الصورة: aspectRatioDescriptions[params.aspectRatio] || 'square format 1:1',
    المنصة: params.platform,
    reference_style: params.referenceImages ? 'use similar style to reference images' : 'no reference',
    ملاحظات: 'يجب أن يكون الرد بصيغة JSON مع حقل "prompt" فقط باللغة الإنجليزية.',
  });

  const promptResponse = await callOpenAI(
    IMAGE_SYSTEM_PROMPT,
    JSON.stringify(userMessage),
    {
      temperature: 0.8,
      maxTokens: 500,
      responseFormat: 'json_object',
    }
  );

  let englishPrompt: string;
  try {
    const parsed = JSON.parse(promptResponse);
    englishPrompt = parsed.prompt || params.prompt;
  } catch {
    englishPrompt = params.prompt;
  }

  // Add brand colors and platform-specific instructions
  if (params.brandColors && params.brandColors.length > 0) {
    englishPrompt += `, brand color palette: ${params.brandColors.join(', ')}`;
  }

  if (params.includeText) {
    englishPrompt += `, with Arabic text "${params.includeText}" elegantly incorporated`;
  }

  // Map aspect ratio to DALL-E sizes
  const sizeMap: Record<string, '1024x1024' | '1792x1024' | '1024x1792'> = {
    '1:1': '1024x1024',
    '4:5': '1024x1792',
    '9:16': '1024x1792',
    '16:9': '1792x1024',
  };

  try {
    const imageResult = await generateImageWithAI(englishPrompt, {
      size: sizeMap[params.aspectRatio] || '1024x1024',
      quality: 'hd',
    });

    // Generate variations by slightly modifying the prompt
    const variations: string[] = [];
    const variationPrompts = [
      `${englishPrompt}, alternative composition, different angle`,
      `${englishPrompt}, different color scheme, alternative style`,
    ];

    // Try to generate one variation
    try {
      const varResult = await generateImageWithAI(variationPrompts[0], {
        size: sizeMap[params.aspectRatio] || '1024x1024',
        quality: 'standard',
      });
      if (varResult.url) variations.push(varResult.url);
    } catch {
      // Variation is optional, continue without it
    }

    const result: ImageGenerationResult = {
      imageUrl: imageResult.url,
      variations,
      suggestedText: params.includeText,
      revisedPrompt: imageResult.revisedPrompt,
    };

    aiCache.set(cacheKey, result, 3600);
    return result;

  } catch (error: any) {
    throw new Error(`فشل في توليد الصورة: ${error.message}`);
  }
}

export default { generateImage };
