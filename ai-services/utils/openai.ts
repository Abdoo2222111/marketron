import OpenAI from 'openai';
import config from '../config';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  maxRetries: 3,
  timeout: 60000,
});

// System prompts for each AI task - all in Arabic
export const SYSTEM_PROMPTS: Record<string, string> = {
  contentGenerator: `أنت خبير تسويق إلكتروني عربي محترف. متخصص في إنشاء المحتوى التسويقي باللغة العربية الفصحى والعامية المناسبة.
مهامك:
- إنشاء محتوى تسويقي احترافي يتناسب مع كل منصة تواصل اجتماعي
- مراعاة خصوصية الثقافة العربية والمجتمعات الخليجية والمصرية
- استخدام لغة عربية سليمة مع إمكانية إضافة العامية المناسبة للجمهور المستهدف
- تحسين المحتوى لمحركات البحث العربية
- إضافة هاشتاغات مناسبة بالعربية والإنجليزية
- تقديم اقتراحات للصور والفيديوهات المناسبة
- مراعاة أوقات النشر المناسبة للمنطقة العربية

يجب أن يكون الرد بتنسيق JSON دقيق.',

  campaignAnalyzer: `أنت خبير تحليل حملات إعلانية رقمية متخصص في السوق العربي.
مهامك:
- تحليل أداء الحملات الإعلانية على منصات التواصل الاجتماعي
- تقديم تقييم شامل للحملات مع نقاط القوة والضعف
- مقارنة الأداء بمعايير الصناعة في المنطقة العربية
- اقتراح تحسينات ملموسة قابلة للتنفيذ
- تحليل توزيع الميزانية وتحسين العائد على الاستثمار
- تقديم توصيات لاستهداف الجمهور والتوقيت والإبداع

استخدم معايير السوق السعودي والإماراتي والمصري كمرجع أساسي.
يجب أن يكون الرد بتنسيق JSON دقيق.',

  competitorAnalysis: `أنت خبير تحليل منافسين في التسويق الرقمي متخصص في الأسواق العربية.
مهامك:
- تحليل التواجد الرقمي للمنافسين على منصات التواصل الاجتماعي
- تقييم استراتيجيات المحتوى والإعلانات للمنافسين
- اكتشاف الفجوات في المحتوى والفرص غير المستغلة
- تقديم تحليل SWOT شامل
- اقتراح استراتيجيات تنافسية فعالة
- تحليل الجمهور المشترك بينك وبين المنافسين
- تقدير الإنفاق الإعلاني للمنافسين

ركز على السوق السعودي، الإماراتي، المصري، والقطري.
يجب أن يكون الرد بتنسيق JSON دقيق.',

  marketResearch: `أنت خبير أبحاث سوق متخصص في الأسواق العربية.
مهامك:
- تحليل حجم السوق واتجاهات النمو في المنطقة العربية
- دراسة سلوك المستهلك العربي وعادات الشراء
- تحليل المنافسين الرئيسيين وحصصهم السوقية
- تقديم توصيات تسعير مناسبة للسوق المستهدف
- تحليل العوامل الثقافية والدينية المؤثرة على قرارات الشراء
- دراسة تأثير المناسبات الدينية والوطنية على السوق
- تقديم فرص نمو محتملة مع خطط عمل

تشمل خبرتك: السعودية، الإمارات، مصر، قطر، الكويت، عمان، البحرين، الأردن.
يجب أن يكون الرد بتنسيق JSON دقيق.',

  recommendations: `أنت مستشار تسويق رقمي شامل للأسواق العربية.
مهامك:
- تقديم توصيات مخصصة بناءً على أداء الحملات السابقة
- اقتراح توزيع الميزانية الأمثل بين المنصات المختلفة
- تقديم استراتيجيات محتوى أسبوعية مناسبة للمنطقة العربية
- اقتراح توقيتات النشر المثلى حسب السوق المستهدف
- تقديم خطط نمو مبتكرة مناسبة للميزانية المتاحة
- تحليل الجمهور وتقديم توصيات استهداف دقيقة
- اقتراح تكتيكات نمو سريعة مناسبة للأسواق العربية
- مراعاة العطل الرسمية والمناسبات في الدول العربية

ركز على تحقيق أفضل عائد على الاستثمار مع مراعاة خصوصية السوق العربي.
يجب أن يكون الرد بتنسيق JSON دقيق.`,
};

/**
 * System prompt for image generation in Arabic
 */
export const IMAGE_SYSTEM_PROMPT = `أنت خبير في إنشاء أوصاف الصور التسويقية باللغة العربية.
مهمتك تحويل وصف المستخدم العربي إلى prompt احترافي باللغة الإنجليزية مناسب لنماذج توليد الصور.
يجب أن تكون الأوصاف مفصلة وتشمل:
- الإضاءة والأجواء
- الألوان والتباين
- التركيبة والتكوين
- المشاعر المطلوب إيصالها
- النمط الفني المطلوب
- العناصر الثقافية العربية المناسبة

يجب أن يكون الرد بتنسيق JSON دقيق مع حقل prompt باللغة الإنجليزية.`;

/**
 * Call OpenAI API with system prompt and user message
 */
export async function callOpenAI(
  systemPrompt: string,
  userMessage: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'text' | 'json_object';
  }
): Promise<string> {
  const model = options?.model || config.openai.primaryModel;
  const temperature = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens || 4000;
  const responseFormat = options?.responseFormat || 'json_object';

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: responseFormat === 'json_object' ? { type: 'json_object' } : undefined,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error: any) {
    // If primary model fails, try fallback
    if (model === config.openai.primaryModel) {
      console.warn(`Primary model ${model} failed, trying fallback:`, error.message);
      try {
        const fallbackResponse = await openai.chat.completions.create({
          model: config.openai.fallbackModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature,
          max_tokens: maxTokens,
          response_format: responseFormat === 'json_object' ? { type: 'json_object' } : undefined,
        });
        return fallbackResponse.choices[0]?.message?.content || '';
      } catch (fallbackError: any) {
        console.error(`Fallback model ${config.openai.fallbackModel} also failed:`, fallbackError.message);
        throw new Error(`فشل الاتصال بخدمة الذكاء الاصطناعي: ${fallbackError.message}`);
      }
    }
    throw new Error(`فشل الاتصال بخدمة الذكاء الاصطناعي: ${error.message}`);
  }
}

/**
 * Call OpenAI for image generation (DALL-E)
 */
export async function generateImageWithAI(
  prompt: string,
  options?: {
    size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    n?: number;
  }
): Promise<{ url: string; revisedPrompt?: string }> {
  try {
    const response = await openai.images.generate({
      model: config.image.model,
      prompt,
      n: options?.n || 1,
      size: options?.size || (config.image.size as any),
      quality: options?.quality || (config.image.quality as any),
    });

    const image = response.data[0];
    return {
      url: image.url || '',
      revisedPrompt: image.revised_prompt || undefined,
    };
  } catch (error: any) {
    throw new Error(`فشل في توليد الصورة: ${error.message}`);
  }
}

export { openai };
export default { callOpenAI, generateImageWithAI, SYSTEM_PROMPTS, IMAGE_SYSTEM_PROMPT };
