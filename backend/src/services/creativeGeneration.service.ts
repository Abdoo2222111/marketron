import { aiService } from '../integrations/aiService';
import prisma from '../config/database';

const AD_SYSTEM_PROMPT = `أنت خبير إعلانات رقمية في منصة MARKETRON. مهمتك توليد إعلانات احترافية جاهزة للنشر على فيسبوك وإنستغرام.
أعد JSON فقط بالتنسيق التالي:
{
  "primaryText": "النص الرئيسي (جملة إلى جملتين، مقنع ومباشر)",
  "headline": "العنوان الرئيسي (أقل من 40 حرفاً، قوي وجاذب للانتباه)",
  "description": "الوصف (optional, 1-2 جمل توضيحية)",
  "cta": "عبارة الحث على اتخاذ إجراء (مثل: اشتر الآن، سجل، احجز)",
  "imagePrompt": "وصف دقيق بالإنكليزية للصورة المطلوب توليدها للإعلان (50-100 كلمة، مناسبة لـ Midjourney/DALL-E)",
  "keyBenefits": ["فائدة رئيسية 1", "فائدة رئيسية 2", "فائدة رئيسية 3"]
}`;

const VARIANTS_SYSTEM_PROMPT = `أنت خبير تسويق إعلاني وخبير في اختبار A/B. مهمتك توليد 3-5 نسخ مختلفة من الإعلان لاختبارها.
أعد JSON فقط بالتنسيق:
{
  "variants": [
    {
      "name": "اسم النسخة (مثلاً: نسخة عاطفية)",
      "primaryText": "النص الرئيسي",
      "headline": "العنوان",
      "description": "الوصف",
      "cta": "عبارة الحث",
      "strategy": "الاستراتيجية المستخدمة في هذه النسخة (مثلاً: التركيز على السعر، العاطفة، الإلحاح)",
      "imagePrompt": "وصف الصورة المناسبة لهذه النسخة"
    }
  ],
  "recommendedAudience": "وصف الجمهور المستهدف المقترح",
  "bestPlatform": "أفضل منصة لهذه الإعلانات"
}`;

const VISUAL_SYSTEM_PROMPT = `أنت خبير في توليد أوصاف الصور الإعلانية. حول وصف المنتج/الخدمة إلى برومبت دقيق لتوليد صورة إعلانية احترافية.
أعد JSON فقط بالتنسيق:
{
  "prompts": {
    "midjourney": "برومبت مناسب لـ Midjourney (وصف دقيق + نسب أبعاد + ستايل)",
    "dalle": "برومبت مناسب لـ DALL-E 3 (وصف مفصل + إضاءة + جو)",
    "stableDiffusion": "برومبت مناسب لـ Stable Diffusion (وصف + negative prompt + ستايل)",
    "pollinations": "برومبت مبسط لـ Pollinations"
  },
  "bestFormat": "أفضل صيغة للصورة (square 1:1, landscape 1.91:1, story 9:16)",
  "colorPalette": ["لون رئيسي", "لون ثانوي", "لون خلفية"],
  "mood": "الجو العام للصورة (مثل: احترافي، حيوي، فاخر، بسيط)"
}`;

async function saveGeneration(userId: string, type: string, input: any, output: any, model: string) {
  try {
    await prisma.aiGeneration.create({
      data: { userId, type, prompt: JSON.stringify(input), resultText: JSON.stringify(output), model, tokensUsed: 0 },
    });
  } catch { /* non-critical */ }
}

export async function generateAdCreative(userId: string, data: {
  productDescription: string;
  platform?: string;
  language?: string;
  tone?: string;
  targetAudience?: string;
  objective?: string;
  provider?: string;
}) {
  const prompt = `قم بتوليد إعلان احترافي للمنتج/الخدمة التالية:

المنتج/الخدمة: ${data.productDescription}
المنصة: ${data.platform || 'فيسبوك وإنستغرام'}
اللغة: ${data.language || 'العربية'}
النغمة: ${data.tone || 'احترافية'}
الجمهور المستهدف: ${data.targetAudience || 'عام'}
هدف الإعلان: ${data.objective || 'زيادة المبيعات'}

قم بتوليد إعلان متكامل جاهز للنشر.`;

  try {
    const systemPrompt = `${AD_SYSTEM_PROMPT}\nاللغة: ${data.language || 'العربية'}. النغمة: ${data.tone || 'احترافية'}.`;
    const result = await aiService.generateStructuredJson<any>(prompt, {
      systemPrompt,
      provider: (data.provider as any) || 'pollinations',
      temperature: 0.8,
    });
    await saveGeneration(data.provider || '', 'ad_creative', data, result, 'openai');
    return result;
  } catch {
    const fallback = {
      primaryText: `اكتشف ${data.productDescription} المذهل! صمم خصيصاً ليلبي احتياجاتك بأعلى جودة. اطلب الآن واستفد من عروضنا الحصرية!`,
      headline: data.productDescription.length > 35 ? data.productDescription.substring(0, 35) + '...' : data.productDescription,
      description: `${data.tone || 'احترافي'} • ${data.platform || 'جميع المنصات'} • جودة عالية`,
      cta: 'اشتر الآن',
      imagePrompt: `Professional product photography of ${data.productDescription}, clean background, soft lighting, high quality, commercial style`,
      keyBenefits: ['جودة عالية', 'سعر منافس', 'توصيل سريع'],
    };
    await saveGeneration(data.provider || '', 'ad_creative', data, fallback, 'fallback');
    return fallback;
  }
}

export async function generateAdVariants(userId: string, data: {
  productDescription: string;
  platform?: string;
  language?: string;
  count?: number;
  provider?: string;
}) {
  const prompt = `قم بتوليد ${data.count || 3} نسخ إعلانية مختلفة لاختبار A/B للمنتج/الخدمة:

المنتج/الخدمة: ${data.productDescription}
المنصة: ${data.platform || 'فيسبوك وإنستغرام'}
اللغة: ${data.language || 'العربية'}

كل نسخة يجب أن تستخدم استراتيجية تسويقية مختلفة.`;

  try {
    const systemPrompt = `${VARIANTS_SYSTEM_PROMPT}\nعدد النسخ: ${data.count || 3}. اللغة: ${data.language || 'العربية'}.`;
    const result = await aiService.generateStructuredJson<any>(prompt, {
      systemPrompt,
      provider: (data.provider as any) || 'pollinations',
      temperature: 0.9,
    });
    await saveGeneration(data.provider || '', 'ad_variants', data, result, 'openai');
    return result;
  } catch {
    const fallback = {
      variants: Array.from({ length: data.count || 3 }, (_, i) => ({
        name: `نسخة ${i + 1}`,
        primaryText: `اعرض مميزات ${data.productDescription} بشكل احترافي. جودة عالية وسعر مميز. اطلب الآن!`,
        headline: `${data.productDescription} - عرض خاص`,
        description: `نسخة ${i + 1}: احترافية • جودة • سرعة`,
        cta: 'اطلب الآن',
        strategy: ['التركيز على الجودة', 'التركيز على السعر', 'التركيز على السرعة'][i] || 'عامة',
        imagePrompt: `Marketing image for ${data.productDescription}, variant ${i + 1}`,
      })),
      recommendedAudience: 'الجمهور المستهدف العام المهتم بهذا المجال',
      bestPlatform: data.platform || 'Facebook',
    };
    await saveGeneration(data.provider || '', 'ad_variants', data, fallback, 'fallback');
    return fallback;
  }
}

export async function generateVisualPrompt(userId: string, data: {
  productDescription: string;
  style?: string;
  platform?: string;
  provider?: string;
}) {
  const prompt = `قم بتوليد أوصاف دقيقة لتوليد صورة إعلانية احترافية للمنتج/الخدمة:

المنتج/الخدمة: ${data.productDescription}
الستايل: ${data.style || 'احترافي'}
المنصة: ${data.platform || 'فيسبوك'}

قم بتوليد برومبتس دقيقة لمحركات توليد الصور المختلفة.`;

  try {
    const systemPrompt = VISUAL_SYSTEM_PROMPT;
    const result = await aiService.generateStructuredJson<any>(prompt, {
      systemPrompt,
      provider: (data.provider as any) || 'pollinations',
      temperature: 0.7,
    });
    await saveGeneration(data.provider || '', 'visual_prompt', data, result, 'openai');
    return result;
  } catch {
    const fallback = {
      prompts: {
        midjourney: `Product photography of ${data.productDescription}, premium quality, soft studio lighting, minimalist composition, commercial advertising --ar 1:1 --v 6`,
        dalle: `A professional product photo of ${data.productDescription} with soft lighting, clean white background, elegant composition, high detail, photorealistic style`,
        stableDiffusion: `Professional product photo of ${data.productDescription}, soft studio lighting, clean background, high detail, photorealistic, 8k`,
        pollinations: `${data.productDescription}, professional product photo, clean background`,
      },
      bestFormat: '1:1 square',
      colorPalette: ['#FFFFFF', '#2D2D2D', '#E0E0E0'],
      mood: data.style || 'professional',
    };
    await saveGeneration(data.provider || '', 'visual_prompt', data, fallback, 'fallback');
    return fallback;
  }
}
