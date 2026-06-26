import { callOpenAI, SYSTEM_PROMPTS } from '../utils/openai';
import { aiCache } from '../utils/cache';
import { scrapeWebPage, scrapeMultipleUrls } from '../utils/web-scraper';

// ==================== Type Definitions ====================

export interface CompetitorAnalysisParams {
  businessName: string;
  industry: string;
  market: string;
  competitors: Array<{
    name: string;
    platform: string;
    pageUrl: string;
    followers?: number;
  }>;
  yourMetrics?: {
    followers: number;
    engagement: number;
    postingFrequency: number;
  };
}

export interface CompetitorAnalysisResult {
  marketPosition: {
    yourRank: number;
    totalCompetitors: number;
    marketShare: string;
    segment: 'leader' | 'challenger' | 'niche' | 'emerging';
  };
  competitorBreakdown: Array<{
    name: string;
    platform: string;
    followers: number;
    growth: string;
    engagement: string;
    strengths: string[];
    weaknesses: string[];
    topContent: string[];
    postingStrategy: { frequency: string; bestTimes: string[]; contentMix: string };
    estimatedAdSpend: string;
    recommendedActions: string[];
  }>;
  contentGap: {
    topicsYourMissing: string[];
    formatsYourMissing: string[];
    opportunities: string[];
  };
  strategicRecommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
    timeframe: string;
  }>;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

// ==================== Competitor Analysis ====================

export async function analyzeCompetitor(
  params: CompetitorAnalysisParams
): Promise<CompetitorAnalysisResult> {
  const cacheKey = aiCache.generateKey('analyzeCompetitor', {
    businessName: params.businessName,
    industry: params.industry,
    market: params.market,
    competitorCount: params.competitors.length,
  });
  const cached = aiCache.get<CompetitorAnalysisResult>(cacheKey);
  if (cached) return cached;

  // Try to scrape competitor pages for additional data
  const scrapedData: Record<string, any> = {};
  try {
    const urls = params.competitors.map(c => c.pageUrl).filter(Boolean);
    if (urls.length > 0) {
      const results = await scrapeMultipleUrls(urls, { timeout: 5000 }, 2);
      results.forEach((result, url) => {
        const competitor = params.competitors.find(c => c.pageUrl === url);
        if (competitor) {
          scrapedData[competitor.name] = {
            title: result.title,
            description: result.metaTags?.description,
            followerCount: result.text?.match(/(\d+[KMB]?)\s*(متابع|follower)/i)?.[1] || competitor.followers,
          };
        }
      });
    }
  } catch (error) {
    console.warn('Web scraping failed for some competitors, proceeding with available data');
  }

  // Prepare data for AI analysis
  const userMessage = JSON.stringify({
    المهمة: 'تحليل المنافسين في السوق الرقمي',
    اسم_النشاط_التجاري: params.businessName,
    الصناعة: params.industry,
    السوق: params.market,
    المنافسون: params.competitors.map(c => ({
      الاسم: c.name,
      المنصة: c.platform,
      الرابط: c.pageUrl,
      المتابعين: c.followers || scrapedData[c.name]?.followerCount || 'غير معروف',
      وصف_الصفحة: scrapedData[c.name]?.description || '',
    })),
    بياناتك: params.yourMetrics ? {
      المتابعين: params.yourMetrics.followers,
      نسبة_التفاعل: `${params.yourMetrics.engagement}%`,
      تكرار_النشر: `${params.yourMetrics.postingFrequency} منشور/أسبوع`,
    } : 'غير متوفرة',
    السوق: this.getMarketContext(params.market),
    تعليمات: 'قدم تحليلاً تنافسياً شاملاً مع تحليل SWOT والفجوات في المحتوى والتوصيات الاستراتيجية',
    ملاحظات: 'يجب أن يكون الرد بصيغة JSON مع الحقول: marketPosition, competitorBreakdown, contentGap, strategicRecommendations, swotAnalysis',
  });

  const response = await callOpenAI(
    SYSTEM_PROMPTS.competitorAnalysis,
    JSON.stringify(userMessage),
    {
      temperature: 0.7,
      maxTokens: 4000,
      responseFormat: 'json_object',
    }
  );

  let result: CompetitorAnalysisResult;
  try {
    const parsed = JSON.parse(response);
    result = {
      marketPosition: parsed.marketPosition || {
        yourRank: 2,
        totalCompetitors: params.competitors.length + 1,
        marketShare: 'غير محدد',
        segment: 'emerging',
      },
      competitorBreakdown: parsed.competitorBreakdown || params.competitors.map(c => ({
        name: c.name,
        platform: c.platform,
        followers: c.followers || 0,
        growth: 'غير معروف',
        engagement: 'غير معروف',
        strengths: [],
        weaknesses: [],
        topContent: [],
        postingStrategy: { frequency: 'غير معروف', bestTimes: [], contentMix: 'غير معروف' },
        estimatedAdSpend: 'غير معروف',
        recommendedActions: [],
      })),
      contentGap: parsed.contentGap || { topicsYourMissing: [], formatsYourMissing: [], opportunities: [] },
      strategicRecommendations: parsed.strategicRecommendations || [],
      swotAnalysis: parsed.swotAnalysis || { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    };
  } catch {
    result = generateFallbackCompetitorAnalysis(params);
  }

  aiCache.set(cacheKey, result, 3600);
  return result;
}

// ==================== Competitor Comparison ====================

export async function compareCompetitors(params: {
  businessName: string;
  industry: string;
  competitors: Array<{
    name: string;
    platform: string;
    followers: number;
    engagementRate: number;
    postingFrequency: number;
    avgLikes: number;
    avgComments: number;
  }>;
}): Promise<{
  rankings: Array<{ name: string; rank: number; score: number; metrics: Record<string, number> }>;
  comparisonMatrix: Record<string, Array<{ name: string; value: string; status: 'better' | 'worse' | 'same' }>>;
  insights: string[];
}> {
  const cacheKey = aiCache.generateKey('compareCompetitors', params);
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const userMessage = JSON.stringify({
    المهمة: 'مقارنة تنافسية بين العلامات التجارية',
    الصناعة: params.industry,
    العلامات: params.competitors.map(c => ({
      الاسم: c.name,
      المنصة: c.platform,
      المتابعين: c.followers,
      نسبة_التفاعل: `${c.engagementRate}%`,
      تكرار_النشر: `${c.postingFrequency} في الأسبوع`,
      متوسط_الإعجابات: c.avgLikes,
      متوسط_التعليقات: c.avgComments,
    })),
    تعليمات: 'قدم مقارنة تنافسية مفصلة مع ترتيب وتصنيف',
    ملاحظات: 'يجب أن يكون الرد بصيغة JSON مع الحقول: rankings, comparisonMatrix, insights',
  });

  const response = await callOpenAI(
    SYSTEM_PROMPTS.competitorAnalysis,
    JSON.stringify(userMessage),
    {
      temperature: 0.7,
      maxTokens: 3000,
      responseFormat: 'json_object',
    }
  );

  let result: any;
  try {
    result = JSON.parse(response);
  } catch {
    result = {
      rankings: params.competitors.map((c, i) => ({
        name: c.name,
        rank: i + 1,
        score: Math.round(c.followers * 0.3 + c.engagementRate * 10 * 0.4 + c.avgLikes * 0.3),
        metrics: { followers: c.followers, engagement: c.engagementRate, likes: c.avgLikes },
      })).sort((a, b) => b.score - a.score)
        .map((item, idx) => ({ ...item, rank: idx + 1 })),
      comparisonMatrix: {},
      insights: ['تحليل مقارن يعتمد على البيانات المتوفرة'],
    };
  }

  aiCache.set(cacheKey, result, 3600);
  return result;
}

// ==================== Helpers ====================

function getMarketContext(market: string): string {
  const marketInfo: Record<string, string> = {
    'saudi-arabia': 'السعودية - أكبر سوق في المنطقة العربية، كثافة عالية في استخدام سناب شات وتيك توك، جمهور شاب',
    'uae': 'الإمارات - سوق متنوع، إنستغرام وفيسبوك مسيطران، إنفاق إعلاني مرتفع',
    'egypt': 'مصر - أكبر سكان عربي، فيسبوك مسيطر، تكلفة إعلان منخفضة نسبياً',
    'qatar': 'قطر - سوق صغير لكن إنفاق مرتفع، إنستغرام وسناب شات الأكثر استخداماً',
    'kuwait': 'الكويت - إنستغرام وإنستغرام مسيطران، إنفاق إعلاني مرتفع للفرد',
    'oman': 'عمان - سوق ناشئ، واتساب وفيسبوك الأكثر استخداماً',
    'bahrain': 'البحرين - سوق صغير، إنستغرام مسيطر',
    'all-gcc': 'دول الخليج مجتمعة - أسواق ذات إنفاق مرتفع، تيك توك في نمو سريع',
  };
  return marketInfo[market] || `سوق ${market} - سوق عربي ناشئ`;
}

function generateFallbackCompetitorAnalysis(params: CompetitorAnalysisParams): CompetitorAnalysisResult {
  const now = new Date().toLocaleDateString('ar-SA');
  return {
    marketPosition: {
      yourRank: 2,
      totalCompetitors: params.competitors.length + 1,
      marketShare: 'غير محدد',
      segment: 'emerging',
    },
    competitorBreakdown: params.competitors.map(c => ({
      name: c.name,
      platform: c.platform,
      followers: c.followers || 0,
      growth: 'غير متاح',
      engagement: 'غير متاح',
      strengths: ['حضور رقمي نشط', `منافس في ${params.industry}`],
      weaknesses: ['ضعف في تحليل البيانات', 'محتوى تقليدي'],
      topContent: [],
      postingStrategy: {
        frequency: 'غير معروف',
        bestTimes: ['10:00 صباحاً', '8:00 مساءً'],
        contentMix: 'غير معروف',
      },
      estimatedAdSpend: 'غير معروف',
      recommendedActions: ['مراقبة أنشطة المنافس', 'تحليل محتواه المتميز'],
    })),
    contentGap: {
      topicsYourMissing: ['تحليل متعمق للسوق', 'محتوى فيديو تفاعلي', 'دراسات حالة'],
      formatsYourMissing: ['ريلز', 'بث مباشر', 'قصص تفاعلية'],
      opportunities: [
        'استهداف كلمات مفتاحية غير مشبعة',
        'محتوى حصري للمناسبات العربية',
        'شراكات مع مؤثرين محليين',
      ],
    },
    strategicRecommendations: [
      {
        priority: 'high',
        action: 'تطوير استراتيجية محتوى فيديو',
        expectedImpact: 'زيادة التفاعل بنسبة 40%',
        timeframe: 'شهر',
      },
      {
        priority: 'medium',
        action: 'تحليل جمهور المنافسين واستهدافه',
        expectedImpact: 'زيادة المتابعين بنسبة 20%',
        timeframe: 'شهرين',
      },
      {
        priority: 'medium',
        action: 'إنشاء محتوى موسمي للمناسبات العربية',
        expectedImpact: 'تحسين الظهور في أوقات الذروة',
        timeframe: 'أسبوعين',
      },
    ],
    swotAnalysis: {
      strengths: ['فريق عمل مبتكر', 'فهم عميق للسوق المستهدف'],
      weaknesses: ['موارد محدودة مقارنة بالمنافسين الكبار', 'قلة الخبرة في بعض المنصات'],
      opportunities: ['نمو سريع لسوق التيك توك في المنطقة', 'زيادة الإنفاق الإعلاني الرقمي'],
      threats: ['المنافسة الشديدة من العلامات التجارية الكبيرة', 'تغير خوارزميات المنصات'],
    },
  };
}

export default { analyzeCompetitor, compareCompetitors };
