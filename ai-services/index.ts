import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './config';

// Import services
import { generateContent, improveContent } from './content-generator/index';
import { analyzeCampaign, optimizeCampaign } from './campaign-analyzer/index';
import { analyzeCompetitor, compareCompetitors } from './competitor-analysis/index';
import { researchMarket, getMarketTrends, analyzeAudience, analyzePricing } from './market-research/index';
import { generateImage } from './image-generator/index';
import { getRecommendations } from './recommendations/index';
import { aiCache } from './utils/cache';

dotenv.config();

const app = express();
const PORT = config.port;
const HOST = config.host;

// ==================== Middleware ====================

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Simple rate limiting middleware
const requestCounts = new Map<string, { count: number; resetTime: number }>();
app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + config.rateLimit.windowMs });
    next();
    return;
  }

  if (entry.count >= config.rateLimit.maxRequests) {
    res.status(429).json({
      success: false,
      error: 'تم تجاوز حد الطلبات المسموح به. الرجاء المحاولة بعد قليل.',
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    });
    return;
  }

  entry.count++;
  next();
});

// ==================== Health Check ====================

app.get('/api/ai/health', (req, res) => {
  res.json({
    success: true,
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      contentGenerator: 'active',
      campaignAnalyzer: 'active',
      competitorAnalysis: 'active',
      marketResearch: 'active',
      imageGenerator: 'active',
      recommendations: 'active',
    },
    cache: {
      size: aiCache.getStats().size,
      hitRate: `${(aiCache.getHitRate() * 100).toFixed(1)}%`,
    },
    config: {
      nodeEnv: config.nodeEnv,
      primaryModel: config.openai.primaryModel,
      fallbackModel: config.openai.fallbackModel,
    },
  });
});

// ==================== Content Generation Routes ====================

app.post('/api/ai/content/generate', async (req, res) => {
  try {
    const { type, platform, keywords, tone, length, targetAudience, productDescription, callToAction, language } = req.body;

    if (!type || !platform || !keywords || !tone || !length || !language) {
      return res.status(400).json({
        success: false,
        error: 'جميع الحقول المطلوبة: type, platform, keywords, tone, length, language',
        requiredFields: ['type', 'platform', 'keywords', 'tone', 'length', 'language'],
        optionalFields: ['targetAudience', 'productDescription', 'callToAction'],
      });
    }

    const result = await generateContent({
      type,
      platform,
      keywords,
      tone,
      length,
      targetAudience,
      productDescription,
      callToAction,
      language,
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Content generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في توليد المحتوى',
    });
  }
});

app.post('/api/ai/content/improve', async (req, res) => {
  try {
    const { content, platform, type, targetAudience, improvements } = req.body;

    if (!content || !platform || !type || !improvements) {
      return res.status(400).json({
        success: false,
        error: 'جميع الحقول المطلوبة: content, platform, type, improvements',
      });
    }

    const result = await improveContent({ content, platform, type, targetAudience, improvements });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Content improvement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في تحسين المحتوى',
    });
  }
});

// ==================== Campaign Analysis Routes ====================

app.post('/api/ai/campaign/analyze', async (req, res) => {
  try {
    const { platform, duration, budget, spent, impressions, clicks, ctr, cpc, conversions, conversionRate, costPerConversion, revenue, roas, audience, ads, industry } = req.body;

    if (!platform || !duration || budget === undefined || spent === undefined || impressions === undefined || clicks === undefined) {
      return res.status(400).json({
        success: false,
        error: 'البيانات الأساسية للحملة مطلوبة',
        requiredFields: ['platform', 'duration', 'budget', 'spent', 'impressions', 'clicks'],
      });
    }

    const result = await analyzeCampaign({
      platform,
      industry: industry || 'other',
      duration,
      budget,
      spent,
      impressions,
      clicks,
      ctr: ctr || (clicks > 0 ? (clicks / impressions) * 100 : 0),
      cpc: cpc || (clicks > 0 ? spent / clicks : 0),
      conversions: conversions || 0,
      conversionRate: conversionRate || (impressions > 0 ? ((conversions || 0) / impressions) * 100 : 0),
      costPerConversion: costPerConversion || (conversions > 0 ? spent / conversions : 0),
      revenue: revenue || 0,
      roas: roas || (spent > 0 ? (revenue || 0) / spent : 0),
      audience: audience || { age: [], gender: '', locations: [], interests: [] },
      ads: ads || [],
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Campaign analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في تحليل الحملة',
    });
  }
});

app.post('/api/ai/campaign/optimize', async (req, res) => {
  try {
    const { platform, budget, targetCpa, targetRoas, historicalData, audienceSuggestions } = req.body;

    if (!platform || budget === undefined || targetCpa === undefined || targetRoas === undefined) {
      return res.status(400).json({
        success: false,
        error: 'الحقول المطلوبة: platform, budget, targetCpa, targetRoas',
      });
    }

    const result = await optimizeCampaign({ platform, budget, targetCpa, targetRoas, historicalData, audienceSuggestions });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Campaign optimization error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في تحسين الحملة',
    });
  }
});

// ==================== Competitor Analysis Routes ====================

app.post('/api/ai/competitor/analyze', async (req, res) => {
  try {
    const { businessName, industry, market, competitors, yourMetrics } = req.body;

    if (!businessName || !industry || !market || !competitors) {
      return res.status(400).json({
        success: false,
        error: 'الحقول المطلوبة: businessName, industry, market, competitors',
      });
    }

    const result = await analyzeCompetitor({ businessName, industry, market, competitors, yourMetrics });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Competitor analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في تحليل المنافسين',
    });
  }
});

app.post('/api/ai/competitor/compare', async (req, res) => {
  try {
    const { businessName, industry, competitors } = req.body;

    if (!businessName || !industry || !competitors) {
      return res.status(400).json({
        success: false,
        error: 'الحقول المطلوبة: businessName, industry, competitors',
      });
    }

    const result = await compareCompetitors({ businessName, industry, competitors });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Competitor comparison error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في مقارنة المنافسين',
    });
  }
});

// ==================== Market Research Routes ====================

app.post('/api/ai/market/research', async (req, res) => {
  try {
    const { product, industry, market, targetAudience, competitors, budget } = req.body;

    if (!product || !industry || !market) {
      return res.status(400).json({
        success: false,
        error: 'الحقول المطلوبة: product, industry, market',
      });
    }

    const result = await researchMarket({ product, industry, market, targetAudience, competitors, budget });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Market research error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في بحث السوق',
    });
  }
});

app.post('/api/ai/market/trends', async (req, res) => {
  try {
    const { industry, market, timeframe } = req.body;

    if (!industry || !market) {
      return res.status(400).json({
        success: false,
        error: 'الحقول المطلوبة: industry, market',
      });
    }

    const result = await getMarketTrends({ industry, market, timeframe });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Market trends error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في تحليل اتجاهات السوق',
    });
  }
});

app.post('/api/ai/market/audience', async (req, res) => {
  try {
    const { product, industry, market, currentAudience, budget } = req.body;

    if (!product || !industry || !market) {
      return res.status(400).json({
        success: false,
        error: 'الحقول المطلوبة: product, industry, market',
      });
    }

    const result = await analyzeAudience({ product, industry, market, currentAudience, budget });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Audience analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في تحليل الجمهور',
    });
  }
});

app.post('/api/ai/market/pricing', async (req, res) => {
  try {
    const { product, industry, market, targetAudience, competitors, costPrice, desiredMargin } = req.body;

    if (!product || !industry || !market) {
      return res.status(400).json({
        success: false,
        error: 'الحقول المطلوبة: product, industry, market',
      });
    }

    const result = await analyzePricing({
      product, industry, market, targetAudience,
      competitors: competitors || [],
      costPrice,
      desiredMargin,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Pricing analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في تحليل التسعير',
    });
  }
});

// ==================== Recommendations Route ====================

app.post('/api/ai/recommendations', async (req, res) => {
  try {
    const { userId, activePlatforms, recentCampaigns, budget, industry, targetMarket, goals } = req.body;

    if (!userId || !activePlatforms || !budget || !industry || !targetMarket || !goals) {
      return res.status(400).json({
        success: false,
        error: 'الحقول المطلوبة: userId, activePlatforms, budget, industry, targetMarket, goals',
      });
    }

    const result = await getRecommendations({
      userId,
      activePlatforms,
      recentCampaigns: recentCampaigns || [],
      budget,
      industry,
      targetMarket,
      goals,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في توليد التوصيات',
    });
  }
});

// ==================== Image Generation Route ====================

app.post('/api/ai/image/generate', async (req, res) => {
  try {
    const { prompt, style, platform, aspectRatio, brandColors, includeText } = req.body;

    if (!prompt || !style || !platform || !aspectRatio) {
      return res.status(400).json({
        success: false,
        error: 'الحقول المطلوبة: prompt, style, platform, aspectRatio',
      });
    }

    const result = await generateImage({ prompt, style, platform, aspectRatio, brandColors, includeText });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في توليد الصورة',
    });
  }
});

// ==================== 404 Handler ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `المسار ${req.path} غير موجود`,
    availableEndpoints: [
      'GET  /api/ai/health',
      'POST /api/ai/content/generate',
      'POST /api/ai/content/improve',
      'POST /api/ai/campaign/analyze',
      'POST /api/ai/campaign/optimize',
      'POST /api/ai/competitor/analyze',
      'POST /api/ai/competitor/compare',
      'POST /api/ai/market/research',
      'POST /api/ai/market/trends',
      'POST /api/ai/market/audience',
      'POST /api/ai/market/pricing',
      'POST /api/ai/recommendations',
      'POST /api/ai/image/generate',
    ],
  });
});

// ==================== Global Error Handler ====================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'حدث خطأ داخلي في الخادم',
    ...(config.nodeEnv === 'development' ? { details: err.message } : {}),
  });
});

// ==================== Start Server ====================

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 AI Services Server running at http://${HOST}:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/ai/health`);
  console.log(`🔧 Environment: ${config.nodeEnv}`);
  console.log(`🤖 Primary AI Model: ${config.openai.primaryModel}`);
  console.log(`📦 Cache: ${aiCache.getStats().size} items, ${(aiCache.getHitRate() * 100).toFixed(1)}% hit rate`);
  console.log(`\n📡 Available Endpoints:`);
  console.log(`   GET  /api/ai/health`);
  console.log(`   POST /api/ai/content/generate`);
  console.log(`   POST /api/ai/content/improve`);
  console.log(`   POST /api/ai/campaign/analyze`);
  console.log(`   POST /api/ai/campaign/optimize`);
  console.log(`   POST /api/ai/competitor/analyze`);
  console.log(`   POST /api/ai/competitor/compare`);
  console.log(`   POST /api/ai/market/research`);
  console.log(`   POST /api/ai/market/trends`);
  console.log(`   POST /api/ai/market/audience`);
  console.log(`   POST /api/ai/market/pricing`);
  console.log(`   POST /api/ai/recommendations`);
  console.log(`   POST /api/ai/image/generate\n`);
});

export default app;
