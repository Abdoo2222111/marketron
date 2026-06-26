import { callOpenAI, SYSTEM_PROMPTS } from '../utils/openai';
import { aiCache } from '../utils/cache';
import { REGION_DATA, PLATFORM_MARKET_DATA, getBestTimes } from './region-data';

// ==================== Type Definitions ====================

export interface MarketResearchParams {
  product: string;
  industry: string;
  market: string;
  targetAudience?: string;
  competitors?: string[];
  budget?: number;
}

export interface MarketResearchResult {
  marketOverview: {
    marketSize: string;
    growthRate: string;
    maturity: 'emerging' | 'growing' | 'mature' | 'declining';
    keyTrends: string[];
    seasonality: string;
    regulatoryEnvironment: string;
  };
  audienceAnalysis: {
    demographics: {
      ageGroups: Array<{ range: string; percentage: number }>;
      gender: { male: number; female: number };
      income: string;
      education: string;
    };
    psychographics: {
      values: string[];
      interests: string[];
      painPoints: string[];
      aspirations: string[];
    };
    buyingBehavior: {
      averageBasketSize: string;
      purchaseFrequency: string;
      preferredChannels: string[];
      decisionFactors: string[];
      brandLoyalty: string;
    };
    digitalBehavior: {
      platformsUsed: Array<{ name: string; percentage: number }>;
      averageTimeSpent: string;
      contentPreferences: string[];
      influencerInfluence: string;
    };
  };
  competitiveLandscape: {
    mainCompetitors: Array<{
      name: string;
      marketShare: string;
      uniqueSellingPoints: string[];
      pricing: string;
      strengths: string[];
      weaknesses: string[];
    }>;
    marketConcentration: 'fragmented' | 'moderately-concentrated' | 'highly-concentrated';
    barriersToEntry: string[];
  };
  pricingAnalysis: {
    priceRange: { min: number; max: number; average: number };
    pricingStrategies: Array<{ strategy: string; examples: string[] }>;
    priceElasticity: string;
    recommendedPrice: { price: number; reasoning: string };
  };
  opportunities: Array<{
    opportunity: string;
    marketPotential: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedRevenue: string;
    actionPlan: string[];
  }>;
  recommendations: Array<{
    category: string;
    recommendation: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    timeline: string;
    expectedOutcome: string;
  }>;
}

// ==================== Market Research ====================

export async function researchMarket(
  params: MarketResearchParams
): Promise<MarketResearchResult> {
  const cacheKey = aiCache.generateKey('researchMarket', params);
  const cached = aiCache.get<MarketResearchResult>(cacheKey);
  if (cached) return cached;

  // Get regional context
  const regionData = REGION_DATA[params.market.toLowerCase()] || null;
  const platformData = PLATFORM_MARKET_DATA;

  const userMessage = JSON.stringify({
    المهمة: 'بحث سوق شامل لمنتج/خدمة في السوق العربي',
    المنتج: params.product,
    الصناعة: params.industry,
    السوق: params.market,
    الجمهور_المستهدف: params.targetAudience || 'عام',
    المنافسون_المعروفون: params.competitors?.join('، ') || 'غير محدد',
    الميزانية_المقترحة: params.budget ? `${params.budget} USD` : 'غير محدد',
    السياق_الإقليمي: regionData ? {
      عدد_السكان: regionData.population,
      مستخدمو_الإنترنت: regionData.internetUsers,
      مستخدمو_التواصل_الاجتماعي: regionData.socialMediaUsers,
      متوسط_الإنفاق_السنوي: `$${regionData.avgSpendOnline}`,
      أعلى_المنصات: regionData.topPlatforms.join('، '),
      العملة: regionData.currency,
      نمو_التجارة_الإلكترونية: `${(regionData.ecommerceGrowth * 100).toFixed(0)}%`,
    } : 'غير متوفرة',
    تعليمات: 'قدم بحث سوق شامل مع تحليل ديموغرافي ونفسي وسلوكي وتحليل تنافسي وفرص',
    ملاحظات: 'يجب أن يكون الرد بصيغة JSON مع الحقول: marketOverview, audienceAnalysis, competitiveLandscape, pricingAnalysis, opportunities, recommendations. استخدم البيانات العربية.',
  });

  const response = await callOpenAI(
    SYSTEM_PROMPTS.marketResearch,
    JSON.stringify(userMessage),
    {
      temperature: 0.7,
      maxTokens: 5000,
      responseFormat: 'json_object',
    }
  );

  let result: MarketResearchResult;
  try {
    const parsed = JSON.parse(response);
    result = {
      marketOverview: parsed.marketOverview || generateDefaultMarketOverview(params, regionData),
      audienceAnalysis: parsed.audienceAnalysis || generateDefaultAudienceAnalysis(params, regionData),
      competitiveLandscape: parsed.competitiveLandscape || {
        mainCompetitors: (params.competitors || []).map(c => ({
          name: c,
          marketShare: 'غير محدد',
          uniqueSellingPoints: [],
          pricing: 'غير محدد',
          strengths: [],
          weaknesses: [],
        })),
        marketConcentration: 'fragmented',
        barriersToEntry: ['متطلبات رأس المال', 'الامتثال التنظيمي'],
      },
      pricingAnalysis: parsed.pricingAnalysis || {
        priceRange: { min: 0, max: 1000, average: 100 },
        pricingStrategies: [{ strategy: 'تسعير تنافسي', examples: ['مثال'] }],
        priceElasticity: 'متوسطة',
        recommendedPrice: { price: 100, reasoning: 'حسب تحليل السوق' },
      },
      opportunities: parsed.opportunities || [],
      recommendations: parsed.recommendations || [],
    };
  } catch {
    result = {
      marketOverview: generateDefaultMarketOverview(params, regionData),
      audienceAnalysis: generateDefaultAudienceAnalysis(params, regionData),
      competitiveLandscape: {
        mainCompetitors: (params.competitors || []).map(c => ({
          name: c,
          marketShare: 'غير محدد',
          uniqueSellingPoints: [],
          pricing: 'غير محدد',
          strengths: [],
          weaknesses: [],
        })),
        marketConcentration: 'fragmented',
        barriersToEntry: ['متطلبات رأس المال', 'الامتثال التنظيمي', 'المنافسة الشديدة'],
      },
      pricingAnalysis: {
        priceRange: { min: 0, max: 1000, average: 100 },
        pricingStrategies: [
          { strategy: 'تسعير الاختراق', examples: ['منتجات جديدة تدخل السوق'] },
          { strategy: 'تسعير القيمة', examples: ['منتجات متميزة'] },
        ],
        priceElasticity: 'متوسطة - مرتفعة في السوق العربي',
        recommendedPrice: { price: 100, reasoning: 'حسب تحليل السوق الأولي' },
      },
      opportunities: [
        { opportunity: 'النمو في التجارة الإلكترونية', marketPotential: 'high', difficulty: 'medium', estimatedRevenue: 'قدرة نمو 30-45%', actionPlan: ['تطوير متجر إلكتروني', 'استهداف الشريحة الشابة'] },
        { opportunity: 'التسويق عبر المؤثرين', marketPotential: 'high', difficulty: 'easy', estimatedRevenue: 'زيادة الوعي بالعلامة التجارية', actionPlan: ['تحديد المؤثرين المناسبين', 'بناء شراكات طويلة المدى'] },
      ],
      recommendations: [
        { category: 'استراتيجية الدخول', recommendation: 'ابدأ بحملة توعية رقمية', priority: 'high', timeline: 'شهر 1', expectedOutcome: 'بناء الوعي بالعلامة' },
        { category: 'التسويق', recommendation: 'استهدف الجمهور الشاب عبر تيك توك وسناب شات', priority: 'high', timeline: 'شهر 1-2', expectedOutcome: 'زيادة المتابعين والتفاعل' },
        { category: 'المبيعات', recommendation: 'قدم عروض حصرية للمستخدمين الجدد', priority: 'medium', timeline: 'شهر 2', expectedOutcome: 'تحفيز أول عملية شراء' },
      ],
    };
  }

  aiCache.set(cacheKey, result, 7200); // 2 hours TTL for market research
  return result;
}

// ==================== Market Trends ====================

export async function getMarketTrends(params: {
  industry: string;
  market: string;
  timeframe?: 'weekly' | 'monthly' | 'quarterly';
}): Promise<{
  trends: Array<{
    trend: string;
    impact: 'high' | 'medium' | 'low';
    description: string;
    relatedKeywords: string[];
    actionableInsight: string;
  }>;
  emergingPlatforms: Array<{ platform: string; growth: string; relevance: string }>;
  seasonalOpportunities: Array<{ season: string; opportunity: string; actionItems: string[] }>;
  predictions: string[];
}> {
  const cacheKey = aiCache.generateKey('getMarketTrends', params);
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const userMessage = JSON.stringify({
    المهمة: 'تحليل اتجاهات السوق',
    الصناعة: params.industry,
    السوق: params.market,
    الإطار_الزمني: params.timeframe || 'شهري',
    تعليمات: 'قدم تحليلاً لأحدث اتجاهات السوق في المنطقة العربية',
    ملاحظات: 'يجب أن يكون الرد بصيغة JSON مع الحقول: trends, emergingPlatforms, seasonalOpportunities, predictions',
  });

  const response = await callOpenAI(
    SYSTEM_PROMPTS.marketResearch,
    JSON.stringify(userMessage),
    { temperature: 0.8, maxTokens: 3000, responseFormat: 'json_object' }
  );

  try {
    const result = JSON.parse(response);
    aiCache.set(cacheKey, result, 3600);
    return result;
  } catch {
    return {
      trends: [
        { trend: 'ازدياد استخدام الذكاء الاصطناعي في التسويق', impact: 'high', description: 'استخدام AI لتحليل البيانات وتخصيص المحتوى', relatedKeywords: ['AI Marketing', 'Personalization'], actionableInsight: 'استثمر في أدوات AI للتسويق' },
        { trend: 'نمو التسويق عبر المؤثرين الصغار', impact: 'high', description: 'Micro-influencers يحققون تفاعل أعلى', relatedKeywords: ['مؤثرين', 'Micro-influencers'], actionableInsight: 'ابنِ شراكات مع مؤثرين محليين' },
      ],
      emergingPlatforms: [
        { platform: 'Threads', growth: 'متنامي', relevance: 'متوسط' },
        { platform: 'Lemon8', growth: 'ناشئ', relevance: 'منخفض' },
      ],
      seasonalOpportunities: [
        { season: 'رمضان', opportunity: 'زيادة الإنفاق الاستهلاكي 40%', actionItems: ['حملات موسمية', 'عروض خاصة'] },
        { season: 'العودة للمدارس', opportunity: 'موسم شراء قوي', actionItems: ['إعلانات موجهة للأهالي', 'عروض حزم'] },
      ],
      predictions: ['من المتوقع نمو سوق التجارة الإلكترونية بنسبة 35% في المنطقة'],
    };
  }
}

// ==================== Audience Analysis ====================

export async function analyzeAudience(params: {
  product: string;
  industry: string;
  market: string;
  currentAudience?: Array<{ age: string; location: string; interests: string[] }>;
  budget?: number;
}): Promise<{
  primaryAudience: {
    description: string;
    demographics: Record<string, string>;
    psychographics: Record<string, string[]>;
    platforms: Array<{ name: string; priority: number; reasoning: string }>;
  };
  segments: Array<{
    name: string;
    percentage: number;
    description: string;
    targetingStrategy: string;
    estimatedReach: string;
  }>;
  targetingRecommendations: Array<{
    platform: string;
    audienceSize: string;
    interests: string[];
    ageRange: string;
    budget: string;
  }>;
  messagingStrategy: Record<string, string>;
}> {
  const cacheKey = aiCache.generateKey('analyzeAudience', params);
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const userMessage = JSON.stringify({
    المهمة: 'تحليل الجمهور المستهدف',
    المنتج: params.product,
    الصناعة: params.industry,
    السوق: params.market,
    الجمهور_الحالي: params.currentAudience || 'غير محدد',
    الميزانية: params.budget ? `${params.budget} USD` : 'غير محدد',
    تعليمات: 'قدم تحليلاً شاملاً للجمهور المستهدف مع تقسيم دقيق',
    ملاحظات: 'يجب أن يكون الرد بصيغة JSON مع الحقول: primaryAudience, segments, targetingRecommendations, messagingStrategy',
  });

  const response = await callOpenAI(
    SYSTEM_PROMPTS.marketResearch,
    JSON.stringify(userMessage),
    { temperature: 0.7, maxTokens: 3000, responseFormat: 'json_object' }
  );

  try {
    const result = JSON.parse(response);
    aiCache.set(cacheKey, result, 7200);
    return result;
  } catch {
    return {
      primaryAudience: {
        description: `الجمهور المستهدف الرئيسي لـ ${params.product} في سوق ${params.market}`,
        demographics: { age: '25-40', gender: '50/50', income: 'متوسط - مرتفع', location: `الحضر في ${params.market}` },
        psychographics: { values: ['الجودة', 'الثقة', 'الابتكار'], interests: ['التكنولوجيا', 'التسوق عبر الإنترنت'], painPoints: ['ضيق الوقت', 'الحاجة للتجربة المميزة'] },
        platforms: [
          { name: 'instagram', priority: 1, reasoning: 'نسبة انتشار عالية وتفاعل قوي' },
          { name: 'snapchat', priority: 2, reasoning: 'شعبية كبيرة في الخليج' },
          { name: 'tiktok', priority: 3, reasoning: 'نمو سريع ووصول للشباب' },
        ],
      },
      segments: [
        { name: 'الشباب المواكب', percentage: 35, description: 'شباب 18-30 يبحثون عن التجديد', targetingStrategy: 'محتوى عصري وسريع', estimatedReach: 'كبير' },
        { name: 'المحترفون', percentage: 30, description: 'محترفون 30-45 مع دخل مرتفع', targetingStrategy: 'محتوى قيم واحترافي', estimatedReach: 'متوسط' },
      ],
      targetingRecommendations: [
        { platform: 'instagram', audienceSize: 'كبير', interests: [params.product, 'تسوق', 'جودة'], ageRange: '25-40', budget: '40%' },
        { platform: 'snapchat', audienceSize: 'متوسط', interests: [params.product, 'عروض', 'جديد'], ageRange: '18-30', budget: '35%' },
      ],
      messagingStrategy: {
        key_message: 'الجودة والتميز في خدمتك',
        brand_voice: 'احترافية ودودة',
        content_focus: 'قيمة مضافة وتجارب حقيقية',
      },
    };
  }
}

// ==================== Pricing Analysis ====================

export async function analyzePricing(params: {
  product: string;
  industry: string;
  market: string;
  targetAudience?: string;
  competitors?: Array<{ name: string; price: number }>;
  costPrice?: number;
  desiredMargin?: number;
}): Promise<{
  marketPriceRange: { min: number; max: number; average: number };
  competitorPrices: Array<{ name: string; price: number; position: string }>;
  recommendedPrice: { price: number; reasoning: string; expectedMargin: number };
  pricingStrategies: Array<{ strategy: string; description: string; pros: string[]; cons: string[] }>;
  psychologicalPricing: string[];
  promotionalStrategy: Array<{ type: string; timing: string; discount: string; expectedImpact: string }>;
}> {
  const cacheKey = aiCache.generateKey('analyzePricing', params);
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const userMessage = JSON.stringify({
    المهمة: 'تحليل تسعير للمنتج/الخدمة',
    المنتج: params.product,
    الصناعة: params.industry,
    السوق: params.market,
    الجمهور_المستهدف: params.targetAudience || 'عام',
    أسعار_المنافسين: params.competitors ? params.competitors.map(c => `${c.name}: $${c.price}`).join('، ') : 'غير محدد',
    التكلفة: params.costPrice ? `$${params.costPrice}` : 'غير محدد',
    الهامش_المطلوب: params.desiredMargin ? `${params.desiredMargin}%` : 'غير محدد',
    تعليمات: 'قدم تحليل تسعير شامل مع استراتيجيات تسعير مناسبة للسوق العربي',
    ملاحظات: 'يجب أن يكون الرد بصيغة JSON مع الحقول: marketPriceRange, competitorPrices, recommendedPrice, pricingStrategies, psychologicalPricing, promotionalStrategy',
  });

  const response = await callOpenAI(
    SYSTEM_PROMPTS.marketResearch,
    JSON.stringify(userMessage),
    { temperature: 0.6, maxTokens: 3000, responseFormat: 'json_object' }
  );

  try {
    const result = JSON.parse(response);
    aiCache.set(cacheKey, result, 14400); // 4 hours
    return result;
  } catch {
    return {
      marketPriceRange: { min: 50, max: 500, average: 150 },
      competitorPrices: (params.competitors || []).map(c => ({
        name: c.name,
        price: c.price,
        position: c.price > 150 ? 'مرتفع' : c.price > 80 ? 'متوسط' : 'منخفض',
      })),
      recommendedPrice: { price: 100, reasoning: 'تسعير تنافسي مع هامش ربح مناسب', expectedMargin: 30 },
      pricingStrategies: [
        { strategy: 'تسعير الاختراق', description: 'دخول السوق بسعر منخفض', pros: ['جذب سريع للعملاء', 'بناء حصة سوقية'], cons: ['هامش ربح منخفض', 'صعوبة رفع السعر لاحقاً'] },
        { strategy: 'تسعير القيمة', description: 'تسعير بناءً على القيمة المدركة', pros: ['هامش ربح مرتفع', 'وضع العلامة'], cons: ['يتطلب تميز واضح', 'صعوبة في الإقناع'] },
      ],
      psychologicalPricing: ['تسعير 99 بدلاً من 100', 'تسعير 199 بدلاً من 200', 'عرض 3+1 مجاناً'],
      promotionalStrategy: [
        { type: 'خصم الترحيب', timing: 'الإطلاق', discount: '20%', expectedImpact: 'جذب أولي للعملاء' },
        { type: 'عرض الموسم', timing: 'رمضان/العيد', discount: '25%', expectedImpact: 'زيادة مبيعات موسمية' },
      ],
    };
  }
}

// ==================== Default Generators ====================

function generateDefaultMarketOverview(params: MarketResearchParams, regionData: any): MarketResearchResult['marketOverview'] {
  return {
    marketSize: regionData ? `سوق ${params.industry} في ${params.market} يقدر بـ ${(regionData.population * regionData.avgSpendOnline / 1000000000).toFixed(1)} مليار دولار سنوياً` : 'حجم السوق قيد التقييم',
    growthRate: regionData ? `${(regionData.ecommerceGrowth * 100).toFixed(0)}% نمو سنوي` : 'غير محدد',
    maturity: 'growing',
    keyTrends: ['التحول الرقمي المتسارع', 'زيادة الاعتماد على التجارة الإلكترونية', 'نمو التسويق عبر المؤثرين', 'تطور سلوك المستهلك العربي'],
    seasonality: `ذروة الموسم في ${params.market}: رمضان، العيد، العودة للمدارس، الجمعة البيضاء`,
    regulatoryEnvironment: 'بيئة تنظيمية متطورة، مع قوانين حماية بيانات جديدة في السعودية والإمارات',
  };
}

function generateDefaultAudienceAnalysis(params: MarketResearchParams, regionData: any): MarketResearchResult['audienceAnalysis'] {
  return {
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: regionData?.medianAge < 28 ? 35 : 25 },
        { range: '25-34', percentage: 35 },
        { range: '35-44', percentage: 20 },
        { range: '45+', percentage: 10 },
      ],
      gender: { male: 52, female: 48 },
      income: 'متوسط - مرتفع حسب السوق',
      education: 'جامعي فأكثر',
    },
    psychographics: {
      values: ['العائلة', 'الجودة', 'المكانة الاجتماعية', 'التقاليد مع الحداثة', 'الثقة'],
      interests: ['التسوق الإلكتروني', 'السفر', 'الطعام', 'الموضة', 'التكنولوجيا'],
      painPoints: ['قلة الثقة في المتاجر الإلكترونية', 'تجربة مستخدم سيئة', 'تأخر الشحن', 'دعم عملاء ضعيف'],
      aspirations: ['تحقيق التوازن بين العمل والحياة', 'التطور المهني', 'تحسين نمط الحياة', 'الادخار والاستثمار'],
    },
    buyingBehavior: {
      averageBasketSize: regionData ? `$${regionData.avgSpendOnline}` : '$500-1500 سنوياً',
      purchaseFrequency: 'شهرياً للمنتجات الاستهلاكية، موسمياً للمنتجات الكبيرة',
      preferredChannels: ['المواقع الإلكترونية', 'التطبيقات', 'وسائل التواصل الاجتماعي', 'المتاجر الفعلية'],
      decisionFactors: ['السعر', 'الجودة', 'التوصيات', 'العلامة التجارية', 'التقييمات'],
      brandLoyalty: 'متوسطة - يميل المستهلك العربي للولاء للعلامات التي تثق به',
    },
    digitalBehavior: {
      platformsUsed: [
        { name: 'instagram', percentage: 80 },
        { name: 'tiktok', percentage: 70 },
        { name: 'snapchat', percentage: 65 },
        { name: 'facebook', percentage: 55 },
        { name: 'x', percentage: 40 },
      ],
      averageTimeSpent: '3-5 ساعات يومياً على وسائل التواصل الاجتماعي',
      contentPreferences: ['فيديوهات قصيرة', 'قصص', 'صور عالية الجودة', 'محتوى تعليمي', 'محتوى ترفيهي'],
      influencerInfluence: 'عالية - 70% من المستهلكين العرب يتأثرون بتوصيات المؤثرين',
    },
  };
}

export default { researchMarket, getMarketTrends, analyzeAudience, analyzePricing };
