const FB_API_VERSION = 'v22.0';
const FB_BASE = `https://graph.facebook.com/${FB_API_VERSION}`;
const FB_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.NEXT_PUBLIC_FACEBOOK_TOKEN || '';

export interface FBPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  picture?: string;
  followers_count?: number;
}

export interface FBConversation {
  id: string;
  snippet: string;
  updated_time: string;
  message_count: number;
  participants?: { name: string; email?: string }[];
  senders?: { name: string; id: string }[];
  unread_count?: number;
  is_unread?: boolean;
}

export interface FBMessage {
  id: string;
  message: string;
  from: { name: string; email?: string; id: string };
  created_time: string;
  attachments?: { data: { image_data?: { url: string }; file_url?: string }[] };
}

export interface FBAdAccount {
  id: string;
  account_id: string;
  name: string;
  account_status: number;
  currency: string;
  balance: string;
  amount_spent: string;
}

export interface FBCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  created_time: string;
  updated_time: string;
  daily_budget?: string;
  lifetime_budget?: string;
}

async function fbFetch<T>(path: string, params: Record<string, string> = {}, token?: string): Promise<T> {
  const accessToken = token || FB_TOKEN;
  if (!accessToken) throw new Error('Facebook access token not configured');

  const query = new URLSearchParams({ ...params, access_token: accessToken });
  const res = await fetch(`${FB_BASE}${path}?${query}`, {
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Facebook API error ${res.status}`);
  }

  return res.json();
}

export async function getFacebookPages(token?: string): Promise<FBPage[]> {
  const data = await fbFetch<{ data: FBPage[] }>('/me/accounts', { fields: 'id,name,access_token,category,picture,fan_count' }, token);
  return data.data || [];
}

export async function getPageConversations(pageId: string, pageToken: string): Promise<FBConversation[]> {
  const data = await fbFetch<{ data: FBConversation[] }>(
    `/${pageId}/conversations`,
    { fields: 'id,snippet,updated_time,message_count,participants,senders,unread_count,is_unread', limit: '25' },
    pageToken
  );
  return data.data || [];
}

export async function getConversationMessages(conversationId: string, pageToken: string): Promise<FBMessage[]> {
  const data = await fbFetch<{ data: FBMessage[] }>(
    `/${conversationId}/messages`,
    { fields: 'id,message,from,created_time,attachments', limit: '50' },
    pageToken
  );
  return data.data || [];
}

export async function sendFacebookReply(conversationId: string, message: string, pageToken: string): Promise<{ message_id: string }> {
  const res = await fetch(`${FB_BASE}/${conversationId}/messages?access_token=${pageToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to send reply');
  }
  return res.json();
}

export async function getAdAccounts(token?: string): Promise<FBAdAccount[]> {
  const data = await fbFetch<{ data: FBAdAccount[] }>('/me/adaccounts', { fields: 'id,account_id,name,account_status,currency,balance,amount_spent' }, token);
  return data.data || [];
}

export async function getAdAccountCampaigns(adAccountId: string, token?: string): Promise<FBCampaign[]> {
  const data = await fbFetch<{ data: FBCampaign[] }>(
    `/act_${adAccountId}/campaigns`,
    { fields: 'id,name,status,objective,created_time,updated_time,daily_budget,lifetime_budget', limit: '50' },
    token
  );
  return data.data || [];
}

export async function getFacebookPageByToken(token?: string): Promise<FBPage | null> {
  const accessToken = token || FB_TOKEN;
  if (!accessToken) return null;
  try {
    const me = await fbFetch<{ id: string; name: string; category?: string; picture?: any; fan_count?: number }>(
      '/me',
      { fields: 'id,name,category,picture,fan_count' },
      accessToken
    );
    if (me && me.id) {
      return {
        id: me.id,
        name: me.name,
        access_token: accessToken,
        category: me.category || '',
        picture: me.picture?.data?.url,
        followers_count: me.fan_count,
      };
    }
  } catch {
    // If /me fails, token might be a User Access Token
  }
  return null;
}

export async function validateFacebookPageAccessToken(pageId: string, token: string): Promise<FBPage | null> {
  try {
    const page = await fbFetch<{ id: string; name: string; category?: string; picture?: any; fan_count?: number; access_token?: string }>(
      `/${pageId}`,
      { fields: 'id,name,category,picture,fan_count,access_token' },
      token
    );
    if (page && page.id) {
      return {
        id: page.id,
        name: page.name,
        access_token: page.access_token || token,
        category: page.category || '',
        picture: page.picture?.data?.url,
        followers_count: page.fan_count,
      };
    }
  } catch {}
  return null;
}
