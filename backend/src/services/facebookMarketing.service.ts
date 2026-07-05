import axios from 'axios';
import prisma from '../config/database';
import { config } from '../config';
import { ApiError } from '../utils/apiError';
import logger from '../utils/logger';

const API_VERSION = config.meta.apiVersion;
const GRAPH_URL = `https://graph.facebook.com/${API_VERSION}`;

function getToken(userId: string) {
  return prisma.platformToken.findFirst({
    where: { userId, platform: 'facebook', status: 'active' },
  });
}

function fbErr(msg: string, err?: any): never {
  const detail = err?.response?.data?.error?.message || err?.message || '';
  throw ApiError.badRequest(detail ? `${msg}: ${detail}` : msg);
}

async function call<T = any>(token: string, url: string, params: Record<string, any> = {}): Promise<T> {
  const res = await axios.get(`${GRAPH_URL}${url}`, {
    params: { ...params, access_token: token },
    timeout: 30000,
  });
  return res.data;
}

async function post<T = any>(token: string, url: string, params: Record<string, any> = {}): Promise<T> {
  const res = await axios.post(`${GRAPH_URL}${url}`, null, {
    params: { ...params, access_token: token },
    timeout: 60000,
  });
  return res.data;
}

async function del<T = any>(token: string, url: string): Promise<T> {
  const res = await axios.delete(`${GRAPH_URL}${url}`, {
    params: { access_token: token },
    timeout: 15000,
  });
  return res.data;
}

// ── Ad Accounts ───────────────────────────────────────

export async function getAdAccounts(userId: string) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found. Connect Facebook first.');
  const data = await call(tok.accessToken, '/me/adaccounts', {
    fields: 'id,name,currency,balance,account_status,daily_spend_limit,amount_spent,timezone_name,business_name',
    limit: 100,
  });
  return (data.data || []).map((a: any) => ({
    id: a.id.replace('act_', ''),
    name: a.name,
    currency: a.currency || 'USD',
    balance: parseFloat(a.balance || '0') / 100,
    status: a.account_status?.toString() || 'unknown',
    dailySpendLimit: parseFloat(a.daily_spend_limit || '0') / 100,
    amountSpent: parseFloat(a.amount_spent || '0') / 100,
    timezoneName: a.timezone_name || '',
  }));
}

export async function getAdAccount(userId: string, accountId: string) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');
  const data = await call(tok.accessToken, `/act_${accountId}`, {
    fields: 'id,name,currency,balance,account_status,daily_spend_limit,amount_spent,timezone_name',
  });
  return {
    id: data.id.replace('act_', ''),
    name: data.name,
    currency: data.currency || 'USD',
    balance: parseFloat(data.balance || '0') / 100,
    status: data.account_status?.toString() || 'unknown',
    dailySpendLimit: parseFloat(data.daily_spend_limit || '0') / 100,
    amountSpent: parseFloat(data.amount_spent || '0') / 100,
    timezoneName: data.timezone_name || '',
  };
}

// ── Campaigns ─────────────────────────────────────────

export async function createCampaign(userId: string, accountId: string, data: {
  name: string; objective: string; status: string;
  dailyBudget?: number; lifetimeBudget?: number;
  startTime?: string; endTime?: string;
  bidStrategy?: string; buyingType?: string; specialAdCategories?: string[];
}) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  const params: Record<string, any> = {
    name: data.name,
    objective: data.objective,
    status: data.status,
    special_ad_categories: data.specialAdCategories?.join(',') || 'NONE',
  };
  if (data.dailyBudget) params.daily_budget = data.dailyBudget;
  if (data.lifetimeBudget) params.lifetime_budget = data.lifetimeBudget;
  if (data.startTime) params.start_time = data.startTime;
  if (data.endTime) params.end_time = data.endTime;
  if (data.bidStrategy) params.bid_strategy = data.bidStrategy;
  if (data.buyingType) params.buying_type = data.buyingType;

  try {
    return await post(tok.accessToken, `/act_${accountId}/campaigns`, params);
  } catch (e: any) {
    fbErr('Failed to create campaign', e);
  }
}

export async function getCampaigns(userId: string, accountId: string, status?: string[]) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  const params: Record<string, any> = {
    fields: 'id,name,objective,status,daily_budget,lifetime_budget,start_time,end_time,created_time,updated_time,account_id,buying_type,bid_strategy,effective_status',
    limit: 100,
  };
  if (status?.length) {
    params.filtering = JSON.stringify(status.map(s => ({ field: 'effective_status', operator: 'IN', value: [s] })));
  }
  try {
    return await call(tok.accessToken, `/act_${accountId}/campaigns`, params);
  } catch (e: any) {
    fbErr('Failed to fetch campaigns', e);
  }
}

export async function getCampaign(userId: string, campaignId: string) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');
  try {
    return await call(tok.accessToken, `/${campaignId}`, {
      fields: 'id,name,objective,status,daily_budget,lifetime_budget,start_time,end_time,created_time,updated_time,account_id,buying_type,bid_strategy,effective_status',
    });
  } catch (e: any) {
    fbErr('Failed to fetch campaign', e);
  }
}

export async function updateCampaign(userId: string, campaignId: string, data: Record<string, any>) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  const params: Record<string, any> = {};
  if (data.name) params.name = data.name;
  if (data.status) params.status = data.status;
  if (data.dailyBudget != null) params.daily_budget = data.dailyBudget;
  if (data.lifetimeBudget != null) params.lifetime_budget = data.lifetimeBudget;
  if (data.startTime) params.start_time = data.startTime;
  if (data.endTime) params.end_time = data.endTime;

  try {
    return await post(tok.accessToken, `/${campaignId}`, params);
  } catch (e: any) {
    fbErr('Failed to update campaign', e);
  }
}

export async function deleteCampaign(userId: string, campaignId: string) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');
  try {
    return await del(tok.accessToken, `/${campaignId}`);
  } catch (e: any) {
    fbErr('Failed to delete campaign', e);
  }
}

// ── Ad Sets ───────────────────────────────────────────

export async function createAdSet(userId: string, accountId: string, data: {
  name: string; campaignId: string; targeting: any;
  optimizationGoal: string; billingEvent: string; startTime: string; status: string;
  bidAmount?: number; dailyBudget?: number; lifetimeBudget?: number;
  endTime?: string; bidStrategy?: string; destinationType?: string;
}) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  const params: Record<string, any> = {
    name: data.name,
    campaign_id: data.campaignId,
    targeting: JSON.stringify(data.targeting),
    optimization_goal: data.optimizationGoal,
    billing_event: data.billingEvent,
    start_time: data.startTime,
    status: data.status,
  };
  if (data.bidAmount) params.bid_amount = data.bidAmount;
  if (data.dailyBudget) params.daily_budget = data.dailyBudget;
  if (data.lifetimeBudget) params.lifetime_budget = data.lifetimeBudget;
  if (data.endTime) params.end_time = data.endTime;
  if (data.bidStrategy) params.bid_strategy = data.bidStrategy;
  if (data.destinationType) params.destination_type = data.destinationType;

  try {
    return await post(tok.accessToken, `/act_${accountId}/adsets`, params);
  } catch (e: any) {
    fbErr('Failed to create ad set', e);
  }
}

export async function getAdSets(userId: string, accountId?: string, campaignId?: string) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  const url = campaignId ? `/${campaignId}/adsets` : `/act_${accountId}/adsets`;
  try {
    return await call(tok.accessToken, url, {
      fields: 'id,name,campaign_id,status,daily_budget,lifetime_budget,targeting,optimization_goal,billing_event,start_time,end_time,bid_amount,bid_strategy,created_time,effective_status',
      limit: 100,
    });
  } catch (e: any) {
    fbErr('Failed to fetch ad sets', e);
  }
}

export async function updateAdSet(userId: string, adSetId: string, data: Record<string, any>) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  const params: Record<string, any> = {};
  if (data.name) params.name = data.name;
  if (data.status) params.status = data.status;
  if (data.dailyBudget != null) params.daily_budget = data.dailyBudget;
  if (data.lifetimeBudget != null) params.lifetime_budget = data.lifetimeBudget;
  if (data.bidAmount) params.bid_amount = data.bidAmount;

  try {
    return await post(tok.accessToken, `/${adSetId}`, params);
  } catch (e: any) {
    fbErr('Failed to update ad set', e);
  }
}

// ── Ads ───────────────────────────────────────────────

export async function createAd(userId: string, accountId: string, data: {
  name: string; adSetId: string; status: string;
  creative: {
    name: string; title?: string; body?: string; objectUrl?: string;
    callToActionType?: string; imageHash?: string; videoId?: string;
    objectStorySpec?: any; assetFeedSpec?: any;
  };
}) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  const creativeParams: Record<string, any> = { name: data.creative.name || data.name };
  if (data.creative.objectStorySpec) {
    creativeParams.object_story_spec = JSON.stringify(data.creative.objectStorySpec);
  } else if (data.creative.assetFeedSpec) {
    creativeParams.asset_feed_spec = JSON.stringify(data.creative.assetFeedSpec);
  } else {
    if (data.creative.title) creativeParams.title = data.creative.title;
    if (data.creative.body) creativeParams.body = data.creative.body;
    if (data.creative.objectUrl) creativeParams.object_url = data.creative.objectUrl;
    if (data.creative.callToActionType) creativeParams.call_to_action_type = data.creative.callToActionType;
    if (data.creative.imageHash) creativeParams.image_hash = data.creative.imageHash;
    if (data.creative.videoId) creativeParams.video_id = data.creative.videoId;
  }

  try {
    const creativeRes = await post(tok.accessToken, `/act_${accountId}/adcreatives`, creativeParams);
    const creativeId = creativeRes.id;

    const adParams: Record<string, any> = {
      name: data.name,
      adset_id: data.adSetId,
      creative: JSON.stringify({ creative_id: creativeId }),
      status: data.status,
    };

    const adRes = await post(tok.accessToken, `/act_${accountId}/ads`, adParams);
    return { ...adRes, creativeId };
  } catch (e: any) {
    fbErr('Failed to create ad', e);
  }
}

export async function getAds(userId: string, accountId?: string, adSetId?: string) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  const url = adSetId ? `/${adSetId}/ads` : `/act_${accountId}/ads`;
  try {
    return await call(tok.accessToken, url, {
      fields: 'id,name,adset_id,campaign_id,status,creative,created_time,effective_status',
      limit: 100,
    });
  } catch (e: any) {
    fbErr('Failed to fetch ads', e);
  }
}

export async function updateAd(userId: string, adId: string, data: { name?: string; status?: string }) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  const params: Record<string, any> = {};
  if (data.name) params.name = data.name;
  if (data.status) params.status = data.status;

  try {
    return await post(tok.accessToken, `/${adId}`, params);
  } catch (e: any) {
    fbErr('Failed to update ad', e);
  }
}

export async function deleteAd(userId: string, adId: string) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');
  try {
    return await del(tok.accessToken, `/${adId}`);
  } catch (e: any) {
    fbErr('Failed to delete ad', e);
  }
}

// ── Insights ──────────────────────────────────────────

export async function getCampaignInsights(userId: string, campaignId: string, params?: {
  datePreset?: string; timeRange?: { since: string; until: string };
  fields?: string[]; breakdowns?: string[]; level?: string; limit?: number;
}) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  const defaultFields = [
    'impressions', 'reach', 'frequency', 'clicks', 'ctr', 'cpc', 'cpm',
    'cpa', 'spend', 'actions', 'conversions', 'cost_per_conversion',
    'video_avg_time_watched_actions', 'cost_per_action_type', 'roas',
  ];

  const query: Record<string, any> = {
    fields: (params?.fields || defaultFields).join(','),
    level: params?.level || 'campaign',
  };
  if (params?.datePreset) query.date_preset = params.datePreset;
  if (params?.timeRange) query.time_range = JSON.stringify(params.timeRange);
  if (params?.breakdowns) query.breakdowns = params.breakdowns.join(',');
  if (params?.limit) query.limit = params.limit;

  try {
    const data = await call(tok.accessToken, `/${campaignId}/insights`, query);
    return data;
  } catch (e: any) {
    fbErr('Failed to fetch insights', e);
  }
}

export async function getAccountInsights(userId: string, accountId: string, params?: {
  datePreset?: string; timeRange?: { since: string; until: string };
  level?: string; fields?: string[];
}) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  const query: Record<string, any> = {
    fields: (params?.fields || ['impressions', 'reach', 'clicks', 'ctr', 'cpc', 'cpm', 'spend', 'actions', 'conversions']).join(','),
    level: params?.level || 'account',
    date_preset: params?.datePreset || 'last_30d',
    limit: 100,
  };
  if (params?.timeRange) {
    query.time_range = JSON.stringify(params.timeRange);
    delete query.date_preset;
  }

  try {
    const data = await call(tok.accessToken, `/act_${accountId}/insights`, query);
    return data;
  } catch (e: any) {
    fbErr('Failed to fetch account insights', e);
  }
}

// ── Creative Assets ───────────────────────────────────

export async function uploadImage(userId: string, accountId: string, imageUrl: string) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  try {
    const data = await post(tok.accessToken, `/act_${accountId}/adimages`, { url: imageUrl });
    const hash = data?.images?.[Object.keys(data?.images || {})[0]]?.hash;
    return { hash, ...data };
  } catch (e: any) {
    fbErr('Failed to upload image', e);
  }
}

export async function uploadVideo(userId: string, accountId: string, videoUrl: string, title?: string) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  try {
    const data = await post(tok.accessToken, `/act_${accountId}/advideos`, {
      file_url: videoUrl,
      title: title || 'Video Upload',
    });
    return { videoId: data.id, ...data };
  } catch (e: any) {
    fbErr('Failed to upload video', e);
  }
}

export async function getAdCreatives(userId: string, accountId: string) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  try {
    return await call(tok.accessToken, `/act_${accountId}/adcreatives`, {
      fields: 'id,name,title,body,image_url,object_url,call_to_action_type,effective_status,thumbnail_url',
      limit: 100,
    });
  } catch (e: any) {
    fbErr('Failed to fetch creatives', e);
  }
}

// ── Pages ─────────────────────────────────────────────

export async function getPages(userId: string) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  try {
    const data = await call(tok.accessToken, '/me/accounts', {
      fields: 'id,name,category,fan_count,picture,access_token',
      limit: 100,
    });
    return (data.data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category || '',
      followers: p.fan_count || 0,
      pictureUrl: p.picture?.data?.url || '',
      accessToken: p.access_token,
    }));
  } catch (e: any) {
    fbErr('Failed to fetch pages', e);
  }
}

export async function getPageInsights(userId: string, pageId: string, metrics: string[], period = 'day') {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  try {
    return await call(tok.accessToken, `/${pageId}/insights`, { metric: metrics.join(','), period });
  } catch (e: any) {
    fbErr('Failed to fetch page insights', e);
  }
}

// ── Publish ───────────────────────────────────────────

export async function publishPost(userId: string, pageId: string, data: {
  message: string; link?: string; published?: boolean; scheduledPublishTime?: string;
}) {
  const tok = await getToken(userId);
  if (!tok) throw ApiError.notFound('Facebook token not found.');

  const params: Record<string, any> = { message: data.message };
  if (data.link) params.link = data.link;
  if (data.published === false) params.published = false;
  if (data.scheduledPublishTime) params.scheduled_publish_time = data.scheduledPublishTime;

  try {
    return await post(tok.accessToken, `/${pageId}/feed`, params);
  } catch (e: any) {
    fbErr('Failed to publish post', e);
  }
}
