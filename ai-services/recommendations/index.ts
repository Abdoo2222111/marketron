import { callOpenAI, SYSTEM_PROMPTS } from '../utils/openai';
import { aiCache } from '../utils/cache';

// ==================== Type Definitions ====================

export interface RecommendationsParams {
  userId: string;
  activePlatforms: string[];
  recentCampaigns: Array<{
    platform: string;
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roas: number;
  }>;
  budget: { total: number; perPlatform: Record<string, number> };
  industry: string;
  targetMarket: string;
  goals: string[];
}

export interface RecommendationsResult {
  budgetAllocation: Array<{ platform: string; percentage: number; reasoning: string }>;
  platformSpecific: Array<{
    platform: string;
    recommendations: Array<{
      type: 'ad-format' | 'audience' | 'creative' | 'timing' | 'budget' | 'objective';
      action: string;
      expectedImpact: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  }>;
  contentStrategy: {
    recommendedContentMix: Array<{ type: string; percentage: number; examples: string[] }>;
    publishingSchedule: Array<{ day: string; bestTime: string; content: string }>;
    hashtagStrategy: string[];
  };
  growthHacks: Array<{
    tactic: string;
    difficulty: string;
    expectedResult: string;
    implementation: string;
  }>;
  weeklyPlan: Array<{
    day: string;
    tasks: Array<{ platform: string; action: string; priority: string }>;
  }>;
}

// ==================== Recommendations ====================

export async function getRecommendations(
  params: RecommendationsParams
): Promise<RecommendationsResult> {
  const cacheKey = aiCache.generateKey('getRecommendations', {
    userId: params.userId,
    activePlatforms: params.activePlatforms,
    industry: params.industry,
    targetMarket: params.targetMarket,
    budget: params.budget.total,
    goals: params.goals,
  });
  const cached = aiCache.get<RecommendationsResult>(cacheKey);
  if (cached) return cached;

  // Analyze past campaign performance
  const campaignSummary = analyzeCampaignHistory(params.recentCampaigns);

  const userMessage = JSON.stringify({
    المهمة: 'تقديم توصيات تسويقية شاملة ومخصصة',
    المنصات_النشطة: params.activePlatforms,
    ملخص_الحملات: campaignSummary,
    الميزانية_الإجمالية: `${params.budget.total} USD`,
    توزيع_الميزانية_الحالي: Object.entries(params.budget.perPlatform).map(([p, b]) => `${p}: ${b} USD`),
    الصناعة: params.industry,
    السوق_المستهدف: params.targetMarket,
    الأهداف: params.goals.join('، '),
    تعليمات: 'قدم توصيات تسويقية شاملة بناءً على أداء الحملات السابقة وأفضل ممارسات السوق العربي',
    ملاحظات: 'يجب أن يكون الرد بصيغة JSON مع الحقول: budgetAllocation, platformSpecific, contentStrategy, growthHacks, weeklyPlan',
  });

  const response = await callOpenAI(
    SYSTEM_PROMPTS.recommendations,
    JSON.stringify(userMessage),
    {
      temperature: 0.7,
      maxTokens: 5000,
      responseFormat: 'json_object',
    }
  );

  let result: RecommendationsResult;
  try {
    const parsed = JSON.parse(response);
    result = {
      budgetAllocation: parsed.budgetAllocation?.slice(0, 10) || generateBudgetAllocation(params),
      platformSpecific: parsed.platformSpecific?.slice(0, params.activePlatforms.length) || generatePlatformRecommendations(params),
      contentStrategy: parsed.contentStrategy || generateContentStrategy(params),
      growthHacks: parsed.growthHacks?.slice(0, 5) || generateGrowthHacks(params),
      weeklyPlan: parsed.weeklyPlan || generateWeeklyPlan(params),
    };
  } catch {
    result = {
      budgetAllocation: generateBudgetAllocation(params),
      platformSpecific: generatePlatformRecommendations(params),
      contentStrategy: generateContentStrategy(params),
      growthHacks: generateGrowthHacks(params),
      weeklyPlan: generateWeeklyPlan(params),
    };
  }

  aiCache.set(cacheKey, result, 3600);
  return result;
}

// ==================== Analysis Helpers ====================

function analyzeCampaignHistory(campaigns: RecommendationsParams['recentCampaigns']): any {
  if (!campaigns || campaigns.length === 0) {
    return { ملخص: 'لا توجد حملات سابقة', أداء_عام: 'جديد' };
  }

  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const overallROAS = totalSpent > 0 ? (totalRevenue / totalSpent) : 0;

  return {
    عدد_الحملات: campaigns.length,
    إجمالي_المنصرف: `$${totalSpent.toFixed(0)}`,
    إجمالي_الإيرادات: `$${totalRevenue.toFixed(0)}`,
    إجمالي_التحويلات: totalConversions,
    متوسط_العائد: `${overallROAS.toFixed(1)}x`,
    تحليل_كل_منصة: campaigns.reduce((acc: any, c) => {
      if (!acc[c.platform]) {
        acc[c.platform] = { عدد: 0, منصرف: 0, إيرادات: 0, تحويلات: 0 };
      }
      acc[c.platform].عدد++;
      acc[c.platform].منصرف += c.spent;
      acc[c.platform].إيرادات += c.revenue;
      acc[c.platform].تحويلات += c.conversions;
      return acc;
    }, {}),
  };
}

// ==================== Fallback Generators ====================

function generateBudgetAllocation(params: RecommendationsParams): RecommendationsResult['budgetAllocation'] {
  const platforms = params.activePlatforms;
  if (platforms.length === 0) {
    return [{ platform: 'instagram', percentage: 40, reasoning: 'المنصة الأكثر انتشاراً في السوق العربي' }];
  }

  // Analyze performance to allocate budget
  const platformPerformance: Record<string, { total: number; roas: number }> = {};
  for (const c of params.recentCampaigns) {
    if (!platformPerformance[c.platform]) {
      platformPerformance[c.platform] = { total: 0, roas: 0 };
    }
    platformPerformance[c.platform].total += c.revenue;
    platformPerformance[c.platform].roas += c.roas;
  }

  // Average ROAS per platform
  for (const [platform, data] of Object.entries(platformPerformance)) {
    const count = params.recentCampaigns.filter(c => c.platform === platform).length;
    if (count > 0) data.roas /= count;
  }

  // Default allocation if no performance data
  const defaultAllocation: Record<string, number> = {
    instagram: 35,
    snapchat: 25,
    tiktok: 25,
    facebook: 10,
    x: 3,
    linkedin: 2,
  };

  // Adjust based on performance
  if (Object.keys(platformPerformance).length > 0) {
    const totalScore = platforms.reduce((sum, p) => {
      return sum + (platformPerformance[p]?.roas || defaultAllocation[p] || 1);
    }, 0);

    return platforms
      .map(p => ({
        platform: p,
        percentage: Math.round(((platformPerformance[p]?.roas || defaultAllocation[p] || 1) / totalScore) * 100),
        reasoning: platformPerformance[p]
          ? `ROAS ${platformPerformance[p].roas.toFixed(1)}x - أداء مثبت`
          : `${defaultAllocation[p]}% - توصية افتراضية للمنصة`,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }

  // Default by region
  return platforms.map(p => ({
    platform: p,
    percentage: defaultAllocation[p] || Math.round(100 / platforms.length),
    reasoning: `توصية قياسية لمنصة ${p} في السوق ${params.targetMarket}`,
  })).sort((a, b) => b.percentage - a.percentage);
}

function generatePlatformRecommendations(params: RecommendationsParams): RecommendationsResult['platformSpecific'] {
  const platformRecs: Record<string, any[]> = {
    instagram: [
      { type: 'ad-format', action: 'استخدم إعلانات الريلز للوصول لجمهور أوسع', expectedImpact: 'زيادة الوصول بنسبة 30%', priority: 'high' },
      { type: 'creative', action: 'أنشئ محتوى تفاعلي (استطلاعات، أسئلة) لزيادة التفاعل', expectedImpact: 'زيادة التفاعل بنسبة 25%', priority: 'high' },
      { type: 'audience', action: 'استهدف الجماهير المشابهة بناءً على المحولين', expectedImpact: 'خفض تكلفة التحويل بنسبة 20%', priority: 'medium' },
    ],
    snapchat: [
      { type: 'ad-format', action: 'استخدم العدسات المخصصة (Sponsored Lenses) للمناسبات', expectedImpact: 'زيادة الوعي بالعلامة بنسبة 40%', priority: 'high' },
      { type: 'timing', action: 'انشر في أوقات الذروة: 10 صباحاً و 9 مساءً', expectedImpact: 'زيادة المشاهدة بنسبة 35%', priority: 'medium' },
      { type: 'creative', action: 'أنشئ محتوى حصري للقصص اليومية', expectedImpact: 'بناء ولاء للمتابعين', priority: 'medium' },
    ],
    tiktok: [
      { type: 'ad-format', action: 'استخدم إعلانات Spark Ads للإعلان من خلال المحتوى', expectedImpact: 'زيادة الثقة والمصداقية', priority: 'high' },
      { type: 'creative', action: 'شارك في التحديات الرائجة وهاشتاغات الموسم', expectedImpact: 'زيادة الوصول العضوي', priority: 'high' },
      { type: 'audience', action: 'استهدف الجمهور بناءً على الاهتمامات وليس الديموغرافيا فقط', expectedImpact: 'تحسين استهداف بنسبة 30%', priority: 'medium' },
    ],
    facebook: [
      { type: 'budget', action: 'خصص ميزانية لإعادة الاستهداف (Retargeting)', expectedImpact: 'زيادة التحويلات بنسبة 25%', priority: 'high' },
      { type: 'objective', action: 'استخدم هدف التحويل بدلاً من هدف الوصول', expectedImpact: 'تحسين عائد الإنفاق', priority: 'high' },
    ],
  };

  return params.activePlatforms.map(p => ({
    platform: p,
    recommendations: platformRecs[p.toLowerCase()]?.slice(0, 5) || [
      { type: 'creative', action: `طور محتوى مخصص لمنصة ${p}`, expectedImpact: 'تحسين الأداء العام', priority: 'medium' },
    ],
  }));
}

function generateContentStrategy(params: RecommendationsParams): RecommendationsResult['contentStrategy'] {
  const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return {
    recommendedContentMix: [
      { type: 'محتوى توعوي/تعليمي', percentage: 30, examples: ['نصائح', 'إرشادات', 'معلومات قيمة'] },
      { type: 'محتوى ترفيهي', percentage: 25, examples: ['ريلز مضحك', 'قصص', 'تحديات'] },
      { type: 'محتوى ترويجي', percentage: 20, examples: ['عروض', 'خصومات', 'منتجات جديدة'] },
      { type: 'محتوى تفاعلي', percentage: 15, examples: ['استطلاعات', 'أسئلة', 'مسابقات'] },
      { type: 'محتوى من وراء الكواليس', percentage: 10, examples: ['فريق العمل', 'عملية الإنتاج', 'قصة العلامة'] },
    ],
    publishingSchedule: daysOfWeek.map((day, i) => ({
      day,
      bestTime: i < 4 ? '10:00 صباحاً' : i === 4 ? '8:00 مساءً' : '11:00 صباحاً',
      content: i % 2 === 0 ? 'محتوى قيم وتوعوي' : 'محتوى ترفيهي وتفاعلي',
    })),
    hashtagStrategy: [
      '#الهاشتاغ_الرئيسي_للعلامة',
      '#هاشتاغ_خاص_بالحملة',
      '#هاشتاغ_موسمي_أو_مناسبة',
      '#هاشتاغ_صناعة',
      '#هاشتاغ_موقع_أو_مدينة',
    ],
  };
}

function generateGrowthHacks(params: RecommendationsParams): RecommendationsResult['growthHacks'] {
  return [
    {
      tactic: 'التعاون مع المؤثرين الصغار (Micro-influencers)',
      difficulty: 'سهل',
      expectedResult: 'زيادة المتابعين بنسبة 15-25% شهرياً',
      implementation: 'ابحث عن مؤثرين في مجالك مع 5K-50K متابع، قدم لهم منتجاً مجاناً مقابل محتوى',
    },
    {
      tactic: 'استخدام المحتوى المُنشأ من المستخدمين (UGC)',
      difficulty: 'متوسط',
      expectedResult: 'زيادة الثقة والتفاعل بنسبة 30%',
      implementation: 'أنشئ هاشتاغ للعلامة وحفز المتابعين على نشر محتوى باستخدامه، أعد نشر أفضل المحتوى',
    },
    {
      tactic: 'إطلاق مسابقات وجوائز أسبوعية',
      difficulty: 'سهل',
      expectedResult: 'زيادة المتابعين والتفاعل بنسبة 40% خلال أسبوعين',
      implementation: 'اطلب من المتابعين متابعة الحساب وإشارة 3 أصدقاء للمشاركة في السحب على جائزة أسبوعية',
    },
    {
      tactic: 'استخدام البث المباشر للتفاعل المباشر',
      difficulty: 'متوسط',
      expectedResult: 'بناء مجتمع مخلص حول العلامة',
      implementation: 'جدول بثاً مباشراً أسبوعياً للإجابة على أسئلة المتابعين أو عرض منتجات جديدة',
    },
    {
      tactic: 'تحسين محتوى الريلز باستخدام الأغاني الرائجة',
      difficulty: 'سهل',
      expectedResult: 'زيادة الوصول العضوي بنسبة 50%',
      implementation: 'تابع الأغاني الرائجة في منطقتك وأنشئ محتوى مبتكراً باستخدامها',
    },
  ];
}

function generateWeeklyPlan(params: RecommendationsParams): RecommendationsResult['weeklyPlan'] {
  const platforms = params.activePlatforms;
  const priorities = ['عالية', 'متوسطة', 'منخفضة'];

  const dayContent: Record<string, string> = {
    'الأحد': 'محتوى تحفيزي واستراتيجي لبداية الأسبوع',
    'الإثنين': 'محتوى تعليمي أو نصائح متخصصة',
    'الثلاثاء': 'عرض منتج أو خدمة مع قصة نجاح',
    'الأربعاء': 'محتوى تفاعلي (استطلاع، سؤال)',
    'الخميس': 'محتوى ترفيهي أو خفيف لنهاية الأسبوع',
    'الجمعة': 'محتوى عائلي أو ديني مناسب ليوم الجمعة',
    'السبت': 'معايدة أو محتوى خاص بعطلة نهاية الأسبوع',
  };

  return Object.entries(dayContent).map(([day, content]) => ({
    day,
    tasks: platforms.slice(0, 2).map((p, i) => ({
      platform: p,
      action: `انشر ${content} على ${p}`,
      priority: i === 0 ? priorities[0] : priorities[1],
    })),
  }));
}

export default { getRecommendations };
