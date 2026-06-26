// ============================================================
// Social Integrations - Express API Server
// ============================================================
// Main entry point that registers all platform integration
// routes: Facebook, Instagram, TikTok, Snapchat, Google.
// Provides OAuth flows, campaign management, analytics,
// and content publishing endpoints.
// ============================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ============================================================
// Import platform services
// ============================================================
import { FacebookService } from './facebook/index';
import {
  getFacebookAuthUrl,
  handleFacebookCallback,
  refreshFacebookToken,
  debugFacebookToken,
  revokeFacebookToken,
} from './facebook/auth';

import { TikTokService } from './tiktok/index';
import {
  getTikTokAuthUrl,
  handleTikTokCallback,
  refreshTikTokToken,
  verifyTikTokToken,
} from './tiktok/auth';

import { SnapchatService } from './snapchat/index';
import {
  getSnapchatAuthUrl,
  handleSnapchatCallback,
  refreshSnapchatToken,
  getSnapchatOrganizations,
} from './snapchat/auth';

import { InstagramService } from './instagram/index';
import {
  getInstagramAuthUrl,
  handleInstagramCallback,
  refreshInstagramToken,
  getInstagramBusinessAccount,
  debugInstagramToken,
  revokeInstagramToken,
  getInstagramLoginStatus,
} from './instagram/auth';
import { InstagramInsightsManager } from './instagram/insights';
import { InstagramContentManager } from './instagram/content';
import { InstagramStoriesManager } from './instagram/stories';

import { FacebookAudienceManager } from './facebook/audience';
import { FacebookPagesManager } from './facebook/pages';

import { TikTokCreativesManager } from './tiktok/creatives';

import { GoogleService } from './google/index';
import { tokenManager } from './utils/tokenManager';
import { rateLimiter } from './utils/rateLimiter';
import { normalizeError } from './utils/apiClient';

// ============================================================
// Module Exports (Library-Usage)
// ============================================================
export { FacebookService } from './facebook/index';
export {
  getFacebookAuthUrl,
  handleFacebookCallback,
  refreshFacebookToken,
  debugFacebookToken,
  revokeFacebookToken,
} from './facebook/auth';
export { FacebookAudienceManager } from './facebook/audience';
export { FacebookPagesManager } from './facebook/pages';

export { InstagramService } from './instagram/index';
export {
  getInstagramAuthUrl,
  handleInstagramCallback,
  refreshInstagramToken,
  getInstagramBusinessAccount,
  debugInstagramToken,
  revokeInstagramToken,
  getInstagramLoginStatus,
} from './instagram/auth';
export { InstagramInsightsManager } from './instagram/insights';
export { InstagramContentManager } from './instagram/content';
export { InstagramStoriesManager } from './instagram/stories';

export { TikTokService } from './tiktok/index';
export {
  getTikTokAuthUrl,
  handleTikTokCallback,
  refreshTikTokToken,
  verifyTikTokToken,
} from './tiktok/auth';
export { TikTokCreativesManager } from './tiktok/creatives';

export { SnapchatService } from './snapchat/index';
export {
  getSnapchatAuthUrl,
  handleSnapchatCallback,
  refreshSnapchatToken,
  getSnapchatOrganizations,
} from './snapchat/auth';

export { GoogleService } from './google/index';

export { tokenManager } from './utils/tokenManager';
export { rateLimiter } from './utils/rateLimiter';
export { normalizeError } from './utils/apiClient';
export {
  normalizeCampaigns,
  facebookCampaignToUnified,
  tiktokCampaignToUnified,
  snapchatCampaignToUnified,
  googleCampaignToUnified,
  facebookInsightsToUnified,
  tiktokInsightsToUnified,
  snapchatInsightsToUnified,
  normalizeBudget,
  normalizeStatus,
  UnifiedCampaign,
  UnifiedAd,
  UnifiedAnalytics,
  UnifiedPage,
} from './utils/dataTransformer';

export { oauthStateStore, storePlatformTokens, isTokenExpired, buildOAuthCallbackUrl } from './common/oauth';
export { handleIntegrationError, createIntegrationError, createRateLimitError } from './common/errorHandler';
export type {
  PlatformName, PlatformTokens, Campaign, CreateCampaignInput, UpdateCampaignInput,
  CampaignStatus, BudgetType, CampaignBudget, CampaignInsights, AccountInsights,
  AudienceInsights, CompetitiveInsights, Ad, CreateAdInput, UpdateAdInput,
  Creative, CreateCreativeInput, AdCreative, PlatformPage, AdAccount,
  CustomAudience, LookalikeAudience, InsightsGranularity, IntegrationError,
  PlatformIntegration,
} from './common/types';

// ============================================================
// Initialize Express App
// ============================================================
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================
// Error Handler Middleware
// ============================================================
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error('[Error]', status, message, err.stack);

  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
});

// ============================================================
// Health Check
// ============================================================
app.get('/api/integrations/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      platforms: ['facebook', 'instagram', 'tiktok', 'snapchat', 'google'],
      rateLimits: rateLimiter.getAllStats(),
    },
  });
});

// ============================================================
// Facebook Routes
// ============================================================
const facebookRouter = express.Router();

// Auth
facebookRouter.get('/auth/url', (_req: Request, res: Response) => {
  const url = FacebookService.getAuthUrl();
  res.json({ success: true, data: { url } });
});

facebookRouter.get('/auth/callback', async (req: Request, res: Response, next) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, error: { message: 'Missing code parameter' } });
    }
    const tokens = await FacebookService.handleCallback(code);
    res.json({ success: true, data: tokens });
  } catch (error) {
    next(error);
  }
});

// Campaigns
facebookRouter.post('/campaigns', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, accountId, ...campaignData } = req.body;
    if (!accessToken || !accountId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and accountId required' } });
    }
    const fb = new FacebookService(accessToken);
    const result = await fb.createCampaign(accountId, campaignData);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

facebookRouter.get('/campaigns', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, accountId, status } = req.query;
    if (!accessToken || !accountId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and accountId required' } });
    }
    const fb = new FacebookService(accessToken as string);
    const statusFilter = status ? (status as string).split(',') : undefined;
    const result = await fb.getCampaigns(accountId as string, statusFilter);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

facebookRouter.get('/campaigns/:id', async (req: Request, res: Response, next) => {
  try {
    const { accessToken } = req.query;
    if (!accessToken) {
      return res.status(400).json({ success: false, error: { message: 'accessToken required' } });
    }
    const fb = new FacebookService(accessToken as string);
    const result = await fb.getCampaign(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

facebookRouter.post('/ads', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, accountId, ...adData } = req.body;
    if (!accessToken || !accountId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and accountId required' } });
    }
    const fb = new FacebookService(accessToken);
    const result = await fb.createAd(accountId, adData);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

facebookRouter.get('/analytics', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, accountId, datePreset } = req.query;
    if (!accessToken || !accountId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and accountId required' } });
    }
    const fb = new FacebookService(accessToken as string);
    const result = await fb.getAdAccountAnalytics(accountId as string);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

facebookRouter.get('/pages', async (req: Request, res: Response, next) => {
  try {
    const { accessToken } = req.query;
    if (!accessToken) {
      return res.status(400).json({ success: false, error: { message: 'accessToken required' } });
    }
    const fb = new FacebookService(accessToken as string);
    const pages = await fb.getPages();
    res.json({ success: true, data: pages });
  } catch (error) {
    next(error);
  }
});

facebookRouter.post('/content', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, pageId, ...postData } = req.body;
    if (!accessToken || !pageId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and pageId required' } });
    }
    const fb = new FacebookService(accessToken);
    const result = await fb.publishPost(pageId, postData);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

app.use('/api/integrations/facebook', facebookRouter);

// ============================================================
// Instagram Routes
// ============================================================
const instagramRouter = express.Router();

instagramRouter.post('/campaigns', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, igUserId, ...campaignData } = req.body;
    if (!accessToken || !igUserId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and igUserId required' } });
    }
    const fb = new FacebookService(accessToken);
    const result = await fb.createCampaign(igUserId, campaignData);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

instagramRouter.get('/analytics', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, igUserId, metrics, period } = req.query;
    if (!accessToken || !igUserId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and igUserId required' } });
    }
    const ig = new InstagramService(accessToken as string, igUserId as string);
    const metricsList = metrics ? (metrics as string).split(',') : ['impressions', 'reach', 'profile_views'];
    const result = await ig.getAccountInsights(metricsList, (period as any) || 'day');
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

instagramRouter.post('/content', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, igUserId, ...mediaData } = req.body;
    if (!accessToken || !igUserId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and igUserId required' } });
    }
    const ig = new InstagramService(accessToken, igUserId);
    const result = await ig.createMediaPost(mediaData);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

instagramRouter.post('/reels', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, igUserId, ...reelData } = req.body;
    if (!accessToken || !igUserId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and igUserId required' } });
    }
    const ig = new InstagramService(accessToken, igUserId);
    const result = await ig.createReel(reelData);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

app.use('/api/integrations/instagram', instagramRouter);

// ============================================================
// TikTok Routes
// ============================================================
const tiktokRouter = express.Router();

// Auth
tiktokRouter.get('/auth/url', (_req: Request, res: Response) => {
  const url = TikTokService.getAuthUrl();
  res.json({ success: true, data: { url } });
});

tiktokRouter.get('/auth/callback', async (req: Request, res: Response, next) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, error: { message: 'Missing code parameter' } });
    }
    const tokens = await TikTokService.handleCallback(code);
    res.json({ success: true, data: tokens });
  } catch (error) {
    next(error);
  }
});

// Campaigns
tiktokRouter.post('/campaigns', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, advertiserId, ...campaignData } = req.body;
    if (!accessToken || !advertiserId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and advertiserId required' } });
    }
    const tk = new TikTokService(accessToken, advertiserId);
    const result = await tk.createCampaign(campaignData);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

tiktokRouter.get('/analytics', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, advertiserId, startDate, endDate, campaignIds } = req.query;
    if (!accessToken || !advertiserId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and advertiserId required' } });
    }
    const tk = new TikTokService(accessToken as string, advertiserId as string);
    const ids = campaignIds ? (campaignIds as string).split(',') : [];
    const result = await tk.getAnalytics(
      { start: startDate as string, end: endDate as string },
      'CAMPAIGN',
      ids
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

tiktokRouter.get('/advertisers', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, advertiserId } = req.query;
    if (!accessToken) {
      return res.status(400).json({ success: false, error: { message: 'accessToken required' } });
    }
    const tk = new TikTokService(accessToken as string, (advertiserId as string) || '');
    const result = await tk.getAdvertisers();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

tiktokRouter.post('/ads', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, advertiserId, ...adData } = req.body;
    if (!accessToken || !advertiserId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and advertiserId required' } });
    }
    const tk = new TikTokService(accessToken, advertiserId);
    const result = await tk.createAd(adData);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

app.use('/api/integrations/tiktok', tiktokRouter);

// ============================================================
// Snapchat Routes
// ============================================================
const snapchatRouter = express.Router();

// Auth
snapchatRouter.get('/auth/url', (_req: Request, res: Response) => {
  const url = SnapchatService.getAuthUrl();
  res.json({ success: true, data: { url } });
});

snapchatRouter.get('/auth/callback', async (req: Request, res: Response, next) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, error: { message: 'Missing code parameter' } });
    }
    const tokens = await SnapchatService.handleCallback(code);
    res.json({ success: true, data: tokens });
  } catch (error) {
    next(error);
  }
});

// Campaigns
snapchatRouter.post('/campaigns', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, organizationId, advertiserId, ...campaignData } = req.body;
    if (!accessToken || !organizationId || !advertiserId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken, organizationId, and advertiserId required' } });
    }
    const sc = new SnapchatService(accessToken, organizationId, advertiserId);
    const result = await sc.createCampaign(campaignData);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

snapchatRouter.get('/analytics', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, organizationId, advertiserId, campaignIds, startDate, endDate } = req.query;
    if (!accessToken || !advertiserId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and advertiserId required' } });
    }
    const sc = new SnapchatService(accessToken as string, (organizationId as string) || '', advertiserId as string);
    const ids = campaignIds ? (campaignIds as string).split(',') : [];
    const result = await sc.getAnalytics(
      { start: startDate as string, end: endDate as string },
      'CAMPAIGN',
      ids
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

snapchatRouter.get('/advertisers', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, organizationId } = req.query;
    if (!accessToken || !organizationId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and organizationId required' } });
    }
    const sc = new SnapchatService(accessToken as string, organizationId as string, '');
    const result = await sc.getAdvertisers();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

snapchatRouter.post('/ads', async (req: Request, res: Response, next) => {
  try {
    const { accessToken, organizationId, advertiserId, ...adData } = req.body;
    if (!accessToken || !advertiserId) {
      return res.status(400).json({ success: false, error: { message: 'accessToken and advertiserId required' } });
    }
    const sc = new SnapchatService(accessToken, organizationId || '', advertiserId);
    const result = await sc.createAd(adData);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

app.use('/api/integrations/snapchat', snapchatRouter);

// ============================================================
// Token Management Routes
// ============================================================
const authRouter = express.Router();

// Get stored tokens for a platform
authRouter.get('/tokens/:platform', (req: Request, res: Response) => {
  const { platform } = req.params;
  const accounts = tokenManager.getAccounts(platform);
  res.json({
    success: true,
    data: accounts.map((a) => ({
      accountId: a.accountId,
      platformUserId: a.tokens.platformUserId,
      platformUserName: a.tokens.platformUserName,
      expiresAt: a.tokens.expiresAt,
      valid: tokenManager.isValid(platform, a.accountId),
    })),
  });
});

// Remove stored tokens (disconnect)
authRouter.delete('/tokens/:platform/:accountId', async (req: Request, res: Response) => {
  const { platform, accountId } = req.params;
  await tokenManager.removeTokens(platform, accountId);
  res.json({ success: true, data: { message: `Disconnected ${platform}:${accountId}` } });
});

app.use('/api/integrations/auth', authRouter);

// ============================================================
// 404 Handler
// ============================================================
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// ============================================================
// Start Server
// ============================================================
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          Social Media Integrations API Server                ║
╠═══════════════════════════════════════════════════════════════╣
║  Status:  Running                                            ║
║  Port:    ${String(PORT).padEnd(48)}║
║  Env:     ${(process.env.NODE_ENV || 'development').padEnd(48)}║
║                                                               ║
║  Endpoints:                                                   ║
║  • Health:  GET  /api/integrations/health                     ║
║  • Facebook:    /api/integrations/facebook/*                  ║
║  • Instagram:   /api/integrations/instagram/*                 ║
║  • TikTok:      /api/integrations/tiktok/*                    ║
║  • Snapchat:    /api/integrations/snapchat/*                  ║
║  • Auth:        /api/integrations/auth/*                      ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  });
}

export default app;
