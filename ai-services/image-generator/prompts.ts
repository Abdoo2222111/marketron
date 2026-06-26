/**
 * Arabic prompt templates for image generation
 * Convert Arabic descriptions to English prompts for AI image models
 */

export const IMAGE_PROMPT_TEMPLATES: Record<string, string> = {
  'social-media': `قم بإنشاء وصف باللغة الإنجليزية لصورة تسويقية لمنصات التواصل الاجتماعي.
المطلوب: وصف مفصل باللغة الإنجليزية مناسب لـ DALL-E 3 أو Midjourney.
يجب أن يكون الوصف احترافياً وجذاباً مع تفاصيل عن:
- المشهد والأجواء العامة
- الألوان والإضاءة
- العناصر المراد ظهورها
- النمط الفني المطلوب
- المشاعر المراد إيصالها

أعد الوصف فقط في حقل "prompt" ضمن JSON.`,

  'product-showcase': `قم بإنشاء وصف باللغة الإنجليزية لصورة عرض منتج احترافية.
المطلوب: وصف مفصل باللغة الإنجليزية لصورة تعرض منتجاً بشكل جذاب.
يجب أن يشمل الوصف:
- طريقة عرض المنتج (على طاولة، في الاستخدام، على عارضة أزياء)
- خلفية مناسبة للمنتج
- إضاءة احترافية (إضاءة طبيعية، إضاءة ستوديو)
- ألوان متناسقة
- تفاصيل تعزز جاذبية المنتج
- زاوية التصوير (من الأمام، من الأعلى، 45 درجة)

أعد الوصف فقط في حقل "prompt" ضمن JSON.`,

  'brand-story': `قم بإنشاء وصف باللغة الإنجليزية لصورة تعبر عن قصة العلامة التجارية.
المطلوب: وصف مفصل باللغة الإنجليزية يعكس هوية العلامة التجارية ورسالتها.
يجب أن يشمل الوصف:
- المشهد العام الذي يعبر عن رؤية العلامة
- عناصر بصرية ترمز لقيم العلامة
- جو عاطفي يلامس الجمهور المستهدف
- تفاصيل ثقافية عربية مناسبة
- تدرج ألوان يعبر عن شخصية العلامة (دافئ، بارد، حيادي)

أعد الوصف فقط في حقل "prompt" ضمن JSON.`,

  'offer-promotion': `قم بإنشاء وصف باللغة الإنجليزية لصورة عرض ترويجي أو خصم.
المطلوب: وصف مفصل باللغة الإنجليزية لصورة إعلان ترويجي جذاب.
يجب أن يشمل الوصف:
- تصميم مشرق وملفت للانتباه
- ألوان زاهية ومبهجة
- تركيز على العرض أو الخصم
- عناصر تعبر عن التوفير والقيمة
- خلفية احتفالية أو حماسية
- مساحة للنص الإعلاني إذا لزم الأمر

أعد الوصف فقط في حقل "prompt" ضمن JSON.`,

  'event-announcement': `قم بإنشاء وصف باللغة الإنجليزية لصورة إعلان عن حدث أو مناسبة.
المطلوب: وصف مفصل باللغة الإنجليزية لصورة إعلان حدث.
يجب أن يشمل الوصف:
- جو احتفالي ومناسب للمناسبة
- عناصر تعبر عن نوع الحدث (مؤتمر، إطلاق، حفل)
- تفاصيل تعزز شعور الترقب والحماس
- تاريخ وموقع (ممثل بشكل إبداعي)
- هوية الحدث البصرية

أعد الوصف فقط في حقل "prompt" ضمن JSON.`,

  'luxury-brand': `قم بإنشاء وصف باللغة الإنجليزية لصورة تعبر عن الفخامة والرفاهية.
المطلوب: وصف مفصل باللغة الإنجليزية يعكس الأناقة والتميز.
يجب أن يشمل الوصف:
- تصميم أنيق وبسيط
- ألوان كلاسيكية فاخرة (ذهبي، أسود، أبيض، نبيذي)
- إضاءة درامية احترافية
- خامات غنية (حرير، رخام، ذهب، كريستال)
- جو من الرقي والتميز
- تفاصيل دقيقة تعبر عن الجودة العالية

أعد الوصف فقط في حقل "prompt" ضمن JSON.`,
};

/**
 * Get a prompt template for a specific context
 */
export function getImagePromptTemplate(context: string): string {
  return IMAGE_PROMPT_TEMPLATES[context] || IMAGE_PROMPT_TEMPLATES['social-media'];
}

/**
 * Common Arabic-to-English prompt translation mappings for cultural elements
 */
export const CULTURAL_ELEMENTS: Record<string, string> = {
  'رمضان': 'Ramadan, crescent moon, lanterns (fanoos), dates, traditional Arabic coffee, spiritual atmosphere, evening sky with stars, warm golden lighting, Islamic geometric patterns',
  'العيد': 'Eid al-Fitr/Eid al-Adha, festive atmosphere, new clothes, family gathering, traditional sweets, henna decorations, bright colors, celebration, gifts',
  'السعودي': 'Saudi culture, traditional architecture, Arabian desert landscape, mountains, modern cityscape of Riyadh or Jeddah, traditional attire (thobe, abaya), warm earthy tones with modern accents',
  'الإماراتي': 'UAE culture, desert dunes, modern skyscrapers of Dubai/Abu Dhabi, Arabian Gulf, traditional dhow boats, falconry, luxury lifestyle, gold and sand color palette',
  'الخليج': 'Arabian Gulf region, pearl diving heritage, traditional souq, modern Gulf architecture, palm trees, coastline, warm sandy colors, blue waters',
  'المصري': 'Egyptian culture, Nile river, pyramids and ancient Egyptian heritage, vibrant street life, traditional crafts, bright colors, café culture, mix of ancient and modern',
  'عربي': 'Arabic culture, Arabic calligraphy, geometric patterns, warm desert tones, hospitality (Arabic coffee and dates), traditional architecture with arches and domes, modern interpretation of heritage',
};

/**
 * Map Arabic style to English style descriptions for image generation
 */
export const STYLE_MAPPINGS: Record<string, string> = {
  professional: 'professional, clean, corporate style, well-lit, minimalist, high-end photography, sharp focus, commercial quality',
  creative: 'creative, artistic, conceptual, unique composition, abstract elements, vibrant colors, innovative design, editorial style',
  minimal: 'minimalist, clean lines, plenty of negative space, simple composition, monochromatic or limited color palette, modern aesthetic',
  luxury: 'luxury, elegant, premium feel, rich textures, gold accents, dramatic lighting, sophisticated atmosphere, high-end photography',
  fun: 'fun, playful, energetic, bright colors, dynamic composition, youthful vibe, casual atmosphere, engaging and lively',
  modern: 'modern, contemporary, sleek design, clean aesthetic, current trends, digital age feel, cutting-edge style',
  traditional: 'traditional, heritage-inspired, warm colors, cultural elements, classic composition, timeless appeal, authentic atmosphere',
};

export default { IMAGE_PROMPT_TEMPLATES, getImagePromptTemplate, CULTURAL_ELEMENTS, STYLE_MAPPINGS };
