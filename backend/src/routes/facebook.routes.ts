import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { facebookRateLimiter } from '../middleware/rateLimiter';
import * as fb from '../services/facebookMarketing.service';

const router = Router();
router.use(authenticate);
router.use(facebookRateLimiter);

// ── Ad Accounts ───────────────────────────────────────
router.get('/adaccounts', async (req: Request, res: Response) => {
  try {
    const data = await fb.getAdAccounts(req.user!.userId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message || 'Failed to fetch ad accounts' });
  }
});

router.get('/adaccounts/:accountId', async (req: Request, res: Response) => {
  try {
    const data = await fb.getAdAccount(req.user!.userId, req.params.accountId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

// ── Campaigns ─────────────────────────────────────────
router.get('/adaccounts/:accountId/campaigns', async (req: Request, res: Response) => {
  try {
    const status = req.query.status ? (req.query.status as string).split(',') : undefined;
    const data = await fb.getCampaigns(req.user!.userId, req.params.accountId, status);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

router.post('/adaccounts/:accountId/campaigns', async (req: Request, res: Response) => {
  try {
    const data = await fb.createCampaign(req.user!.userId, req.params.accountId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

router.get('/campaigns/:campaignId', async (req: Request, res: Response) => {
  try {
    const data = await fb.getCampaign(req.user!.userId, req.params.campaignId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

router.patch('/campaigns/:campaignId', async (req: Request, res: Response) => {
  try {
    const data = await fb.updateCampaign(req.user!.userId, req.params.campaignId, req.body);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

router.delete('/campaigns/:campaignId', async (req: Request, res: Response) => {
  try {
    const data = await fb.deleteCampaign(req.user!.userId, req.params.campaignId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

// ── Ad Sets ───────────────────────────────────────────
router.post('/adaccounts/:accountId/adsets', async (req: Request, res: Response) => {
  try {
    const data = await fb.createAdSet(req.user!.userId, req.params.accountId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

router.get('/adaccounts/:accountId/adsets', async (req: Request, res: Response) => {
  try {
    const campaignId = req.query.campaignId as string | undefined;
    const data = await fb.getAdSets(req.user!.userId, req.params.accountId, campaignId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

router.patch('/adsets/:adSetId', async (req: Request, res: Response) => {
  try {
    const data = await fb.updateAdSet(req.user!.userId, req.params.adSetId, req.body);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

// ── Ads ───────────────────────────────────────────────
router.post('/adaccounts/:accountId/ads', async (req: Request, res: Response) => {
  try {
    const data = await fb.createAd(req.user!.userId, req.params.accountId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

router.get('/adaccounts/:accountId/ads', async (req: Request, res: Response) => {
  try {
    const adSetId = req.query.adSetId as string | undefined;
    const data = await fb.getAds(req.user!.userId, req.params.accountId, adSetId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

router.patch('/ads/:adId', async (req: Request, res: Response) => {
  try {
    const data = await fb.updateAd(req.user!.userId, req.params.adId, req.body);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

router.delete('/ads/:adId', async (req: Request, res: Response) => {
  try {
    const data = await fb.deleteAd(req.user!.userId, req.params.adId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

// ── Insights ──────────────────────────────────────────
router.get('/campaigns/:campaignId/insights', async (req: Request, res: Response) => {
  try {
    const data = await fb.getCampaignInsights(req.user!.userId, req.params.campaignId, req.query as any);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

router.get('/adaccounts/:accountId/insights', async (req: Request, res: Response) => {
  try {
    const data = await fb.getAccountInsights(req.user!.userId, req.params.accountId, req.query as any);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

// ── Creatives ─────────────────────────────────────────
router.get('/adaccounts/:accountId/creatives', async (req: Request, res: Response) => {
  try {
    const data = await fb.getAdCreatives(req.user!.userId, req.params.accountId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

router.post('/adaccounts/:accountId/upload-image', async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) { res.status(400).json({ success: false, error: 'imageUrl is required' }); return; }
    const data = await fb.uploadImage(req.user!.userId, req.params.accountId, imageUrl);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

router.post('/adaccounts/:accountId/upload-video', async (req: Request, res: Response) => {
  try {
    const { videoUrl, title } = req.body;
    if (!videoUrl) { res.status(400).json({ success: false, error: 'videoUrl is required' }); return; }
    const data = await fb.uploadVideo(req.user!.userId, req.params.accountId, videoUrl, title);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

// ── Pages ─────────────────────────────────────────────
router.get('/pages', async (req: Request, res: Response) => {
  try {
    const data = await fb.getPages(req.user!.userId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

router.get('/pages/:pageId/insights', async (req: Request, res: Response) => {
  try {
    const metrics = (req.query.metrics as string || 'page_impressions,page_engaged_users').split(',');
    const period = (req.query.period as string) || 'day';
    const data = await fb.getPageInsights(req.user!.userId, req.params.pageId, metrics, period);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

router.post('/pages/:pageId/publish', async (req: Request, res: Response) => {
  try {
    const data = await fb.publishPost(req.user!.userId, req.params.pageId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

export default router;
