import { callOpenAI, SYSTEM_PROMPTS } from '../utils/openai';
import { aiCache } from '../utils/cache';
import { compareWithBenchmarks } from './benchmarks';

// ==================== Type Definitions ====================

export interface CampaignData {
  platform: string;
  industry?: string;
  duration: { start: string; end: string };
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  conversionRate: number;
  costPerConversion: number;
  revenue: number;
  roas: number;
  audience: {
    age: string[];
    gender: string;
    locations: string[];
    interests: string[];
  };
  ads: Array<{
    id: string;
    headline: string;
    body: string;
    media: string;
    performance: Record<string, number>;
  }>;
}

export interface CampaignAnalysisResult {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendations: Array<{
    action: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'easy' | 'medium' | 'hard';
    description: string;
    expectedImprovement: string;
  }>;
  optimizationSuggestions: {
    budget: { suggestion: string; reasoning: string };
    audience: { suggestion: string; reasoning: string };
    creative: { suggestion: string; reasoning: string };
    timing: { suggestion: string; reasoning: string };
  };
  benchmarkComparison: {
    industry: { ctr: number; cpc: number; conversionRate: number; cpm: number };
    yourPerformance: { ctr: number; cpc: number; conversionRate: number; cpm: number };
    percentile: number;
  };
}

// ==================== Campaign Analysis ====================

export async function analyzeCampaign(
  campaignData: CampaignData
): Promise<CampaignAnalysisResult> {
  const cacheKey = aiCache.generateKey('analyzeCampaign', {
    platform: campaignData.platform,
    budget: campaignData.budget,
    spent: campaignData.spent,
    roas: campaignData.roas,
    ctr: campaignData.ctr,
    conversions: campaignData.conversions,
    industry: campaignData.industry,
  });
  const cached = aiCache.get<CampaignAnalysisResult>(cacheKey);
  if (cached) return cached;

  // Calculate basic metrics
  const metrics = {
    ctr: campaignData.ctr,
    cpc: campaignData.cpc,
    conversionRate: campaignData.conversionRate,
    cpm: campaignData.spent > 0 ? (campaignData.spent / campaignData.impressions) * 1000 : 0,
    roas: campaignData.roas,
  };

  // Get benchmark comparison
  const industryBench = compareWithBenchmarks(
    campaignData.industry || 'other',
    campaignData.platform,
    metrics
  );

  // Prepare data for AI analysis
  const userMessage = JSON.stringify({
    المهمة: 'تحليل حملة إعلانية شاملة',
    بيانات_الحملة: {
      المنصة: campaignData.platform,
      المدة: `${campaignData.duration.start} إلى ${campaignData.duration.end}`,
      الميزانية: `${campaignData.budget} USD`,
      المنصرف: `${campaignData.spent} USD`,
      مرات_الظهور: campaignData.impressions,
      النقرات: campaignData.clicks,
      نسبة_النقر: `${campaignData.ctr}%`,
      تكلفة_النقرة: `${campaignData.cpc} USD`,
      التحويلات: campaignData.conversions,
      نسبة_التحويل: `${campaignData.conversionRate}%`,
      تكلفة_التحويل: `${campaignData.costPerConversion} USD`,
      الإيرادات: `${campaignData.revenue} USD`,
      العائد_على_الإنفاق: campaignData.roas,
      الجمهور: campaignData.audience,
    },
    مقارنة_المعايير: {
      تقييم_عام: industryBench.overallScore,
      مقارنات: Object.entries(industryBench.comparisons).map(([key, val]) => ({
        المقياس: key,
        قيمتك: val.yourValue,
        معيار_الصناعة: val.benchmarkValue,
        الفرق: `${val.percentageBetter.toFixed(1)}%`,
        الحالة: val.status === 'above' ? 'أفضل' : val.status === 'below' ? 'أقل' : 'مطابق'
      })),
    },
    تعليمات: 'قدم تحليلاً شاملاً للحملة مع نقاط القوة والضعف والفرص والتهديدات والتوصيات',
    ملاحظات: 'يجب أن يكون الرد بصيغة JSON مع الحقول: overallScore, strengths, weaknesses, opportunities, threats, recommendations, optimizationSuggestions',
  });

  const response = await callOpenAI(
    SYSTEM_PROMPTS.campaignAnalyzer,
    JSON.stringify(userMessage),
    {
      temperature: 0.7,
      maxTokens: 4000,
      responseFormat: 'json_object',
    }
  );

  let result: CampaignAnalysisResult;
  try {
    const parsed = JSON.parse(response);
    result = {
      overallScore: parsed.overallScore ?? industryBench.overallScore,
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      opportunities: parsed.opportunities || [],
      threats: parsed.threats || [],
      recommendations: parsed.recommendations?.slice(0, 10) || [],
      optimizationSuggestions: parsed.optimizationSuggestions || {
        budget: { suggestion: '', reasoning: '' },
        audience: { suggestion: '', reasoning: '' },
        creative: { suggestion: '', reasoning: '' },
        timing: { suggestion: '', reasoning: '' },
      },
      benchmarkComparison: {
        industry: {
          ctr: industryBench.benchmark?.avgCTR || 0,
          cpc: industryBench.benchmark?.avgCPC || 0,
          conversionRate: industryBench.benchmark?.avgConversionRate || 0,
          cpm: industryBench.benchmark?.avgCPM || 0,
        },
        yourPerformance: {
          ctr: campaignData.ctr,
          cpc: campaignData.cpc,
          conversionRate: campaignData.conversionRate,
          cpm: metrics.cpm,
        },
        percentile: industryBench.overallScore,
      },
    };
  } catch {
    // Fallback analysis based on metrics
    result = generateFallbackAnalysis(campaignData, industryBench);
  }

  aiCache.set(cacheKey, result, 1800);
  return result;
}

// ==================== Campaign Optimization ====================

export async function optimizeCampaign(params: {
  platform: string;
  budget: number;
  targetCpa: number;
  targetRoas: number;
  historicalData?: Array<{
    spent: number;
    conversions: number;
    revenue: number;
    impressions: number;
    clicks: number;
  }>;
  audienceSuggestions?: string[];
}): Promise<{
  recommendedBudget: number;
  budgetAllocation: Array<{ channel: string; percentage: number; reasoning: string }>;
  bidStrategy: string;
  audienceRecommendations: string[];
  adSchedule: Array<{ day: string; hours: string; allocation: number }>;
  expectedImprovements: Record<string, string>;
}> {
  const cacheKey = aiCache.generateKey('optimizeCampaign', params);
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const userMessage = JSON.stringify({
    المهمة: 'تحسين الحملة الإعلانية',
    بيانات_التحسين: {
      المنصة: params.platform,
      الميزانية: `${params.budget} USD`,
      التكلفة_المستهدفة_للتحويل: `${params.targetCpa} USD`,
      العائد_المستهدف: params.targetRoas,
      ...(params.historicalData ? { بيانات_تاريخية: params.historicalData } : {}),
      ...(params.audienceSuggestions ? { اقتراحات_الجمهور: params.audienceSuggestions } : {}),
    },
    تعليمات: 'قدم خطة تحسين شاملة للحملة الإعلانية',
    ملاحظات: 'يجب أن يكون الرد بصيغة JSON مع الحقول: recommendedBudget, budgetAllocation, bidStrategy, audienceRecommendations, adSchedule, expectedImprovements',
  });

  const response = await callOpenAI(
    SYSTEM_PROMPTS.campaignAnalyzer,
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
      recommendedBudget: params.budget,
      budgetAllocation: [{ channel: params.platform, percentage: 100, reasoning: 'الميزانية الحالية' }],
      bidStrategy: 'auto',
      audienceRecommendations: params.audienceSuggestions || ['الجمهور الحالي'],
      adSchedule: [
        { day: 'الأحد - الخميس', hours: '10:00-14:00 و 20:00-23:00', allocation: 70 },
        { day: 'الجمعة - السبت', hours: '15:00-23:00', allocation: 30 },
      ],
      expectedImprovements: { تحسين_العائد: 'متوقع تحسين بنسبة 15-25%' },
    };
  }

  aiCache.set(cacheKey, result, 3600);
  return result;
}

// ==================== Fallback Analysis ====================

function generateFallbackAnalysis(campaignData: CampaignData, benchmarks: any): CampaignAnalysisResult {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: CampaignAnalysisResult['recommendations'] = [];

  // Analyze CTR
  if (campaignData.ctr > (benchmarks.benchmark?.avgCTR || 2)) {
    strengths.push(`نسبة النقر إلى الظهور (${campaignData.ctr}%) ممتازة وتفوق متوسط الصناعة`);
  } else if (campaignData.ctr < (benchmarks.benchmark?.avgCTR || 2) * 0.7) {
    weaknesses.push(`نسبة النقر إلى الظهور (${campaignData.ctr}%) أقل من متوسط الصناعة`);
    recommendations.push({
      action: 'تحسين العناوين والنصوص الإعلانية',
      impact: 'high',
      effort: 'medium',
      description: 'استخدم عناوين أكثر جذباً مع عرض قيمة واضح لزيادة نسبة النقر',
      expectedImprovement: `زيادة CTR بنسبة 20-40%`,
    });
  }

  // Analyze Conversion Rate
  if (campaignData.conversionRate > (benchmarks.benchmark?.avgConversionRate || 3)) {
    strengths.push(`نسبة التحويل (${campaignData.conversionRate}%) ممتازة وتفوق متوسط الصناعة`);
  } else if (campaignData.conversionRate < (benchmarks.benchmark?.avgConversionRate || 3) * 0.6) {
    weaknesses.push(`نسبة التحويل (${campaignData.conversionRate}%) تحتاج إلى تحسين`);
    recommendations.push({
      action: 'تحسين تجربة الصفحة المقصودة',
      impact: 'high',
      effort: 'medium',
      description: 'حسن الصفحات المقصودة لتتناسب مع الإعلانات وتسريع أوقات التحميل',
      expectedImprovement: `زيادة نسبة التحويل بنسبة 15-30%`,
    });
  }

  // Analyze ROAS
  if (campaignData.roas >= 3) {
    strengths.push(`العائد على الإنفاق الإعلاني (${campaignData.roas}x) ممتاز`);
  } else if (campaignData.roas < 1.5) {
    weaknesses.push(`العائد على الإنفاق الإعلاني (${campaignData.roas}x) منخفض`);
    recommendations.push({
      action: 'إعادة تخصيص الميزانية للقنوات الأعلى أداءً',
      impact: 'high',
      effort: 'easy',
      description: 'ركز الميزانية على الجماهير والإعلانات التي تحقق أعلى عائد',
      expectedImprovement: `تحسين ROAS بنسبة 30-50%`,
    });
  }

  // Analyze CPC
  if (campaignData.cpc < (benchmarks.benchmark?.avgCPC || 1)) {
    strengths.push(`تكلفة النقرة ($${campaignData.cpc.toFixed(2)}) أقل من متوسط الصناعة`);
  } else {
    recommendations.push({
      action: 'تحسين نقاط الجودة وجودة الإعلان',
      impact: 'medium',
      effort: 'medium',
      description: 'استخدم كلمات مفتاحية أكثر تحديداً وحسن صلة الإعلان بها',
      expectedImprovement: `خفض CPC بنسبة 10-20%`,
    });
  }

  // Budget utilization
  const budgetUtilization = (campaignData.spent / campaignData.budget) * 100;
  if (budgetUtilization < 70) {
    weaknesses.push(`استخدام الميزانية (${budgetUtilization.toFixed(0)}%) منخفض`);
    recommendations.push({
      action: 'زيادة استهلاك الميزانية اليومية',
      impact: 'high',
      effort: 'easy',
      description: 'زد عروض الأسعار أو وسع نطاق الاستهداف لاستهلاك الميزانية المخصصة',
      expectedImprovement: `تحقيق أقصى استفادة من الميزانية`,
    });
  }

  if (strengths.length === 0) strengths.push('الحملة تعمل بمستوى متوسط - هناك فرص للتحسين');
  if (weaknesses.length === 0) weaknesses.push('لا توجد نقاط ضعف واضحة - استمر في التحسين المستمر');

  return {
    overallScore: benchmarks.overallScore,
    strengths,
    weaknesses,
    opportunities: ['استخدام إعلانات إعادة الاستهداف', 'تجربة أشكال إعلانية جديدة', 'التوسع في الجماهير المشابهة'],
    threats: ['زيادة تكاليف الإعلان الموسمية', 'المنافسة على نفس الجمهور', 'تغير خوارزميات المنصة'],
    recommendations,
    optimizationSuggestions: {
      budget: {
        suggestion: 'خصص 70% من الميزانية للإعلانات الأعلى أداءً و 30% لاختبار إعلانات جديدة',
        reasoning: 'أظهرت البيانات أن التركيز على الإعلانات المثبتة يزيد العائد الإجمالي',
      },
      audience: {
        suggestion: 'أنشئ جماهير مشابهة (Lookalike) بناءً على أفضل 5% من المحولين',
        reasoning: 'الجماهير المشابهة تحقق عادةً تكلفة تحويل أقل بنسبة 20-30%',
      },
      creative: {
        suggestion: 'اختبر 3-5 أشكال إعلانية مختلفة أسبوعياً',
        reasoning: 'التجديد المستمر في الإعلانات يمنع إرهاق الجمهور ويحافظ على الأداء',
      },
      timing: {
        suggestion: 'زد الميزانية في أوقات الذروة (10 صباحاً - 2 ظهراً و 8-11 مساءً)',
        reasoning: 'هذه الأوقات تسجل أعلى معدلات تحويل في السوق العربي',
      },
    },
    benchmarkComparison: {
      industry: benchmarks.benchmark || { ctr: 0, cpc: 0, conversionRate: 0, cpm: 0 },
      yourPerformance: {
        ctr: campaignData.ctr,
        cpc: campaignData.cpc,
        conversionRate: campaignData.conversionRate,
        cpm: campaignData.spent > 0 ? (campaignData.spent / campaignData.impressions) * 1000 : 0,
      },
      percentile: benchmarks.overallScore,
    },
  };
}

export default { analyzeCampaign, optimizeCampaign };
