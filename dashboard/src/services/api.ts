const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

let _token: string | null = null;

function getToken(): string | null {
  if (_token) return _token;
  const params = new URLSearchParams(window.location.search);
  _token = params.get('token') || localStorage.getItem('dashboard_token') || null;
  return _token;
}

export function setToken(token: string) {
  _token = token;
  localStorage.setItem('dashboard_token', token);
}

export function clearToken() {
  _token = null;
  localStorage.removeItem('dashboard_token');
}

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/v1${url}`, { ...opts, headers });
  const json = await res.json();

  if (!json.success) throw new Error(json.error || `API error ${res.status}`);
  return json.data as T;
}

export function get<T>(url: string): Promise<T> {
  return request<T>(url);
}

export function post<T>(url: string, body?: unknown): Promise<T> {
  return request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
}

export interface OverviewData {
  totals: {
    impressions: number; clicks: number; conversions: number;
    spend: number; revenue: number; ctr: number; cpc: number;
    cpm: number; cpa: number; roas: number;
  };
  dailyPerformance: Array<{
    date: string; impressions: number; clicks: number;
    conversions: number; spend: number; revenue: number;
  }>;
  platformBreakdown: Array<{
    platform: string; spend: number; impressions: number;
    clicks: number; conversions: number; revenue: number;
  }>;
  campaignCount: number;
  activeCampaigns: number;
}

export interface AudienceData {
  countries: Record<string, number>;
  ageGroups: Record<string, number>;
  genders: Record<string, number>;
}

export interface CompetitorData {
  id: string; name: string; platform: string;
  spend: number; impressions: number; clicks: number;
  ctr: number; engagement: number;
}

export async function fetchOverview(): Promise<OverviewData> {
  return get<OverviewData>('/analytics/overview');
}

export async function fetchAudience(): Promise<AudienceData> {
  return get<AudienceData>('/analytics/audience');
}

export async function fetchTiming() {
  return get<any>('/analytics/timing');
}

export async function fetchCompetitors(): Promise<CompetitorData[]> {
  return get<CompetitorData[]>('/competitors');
}

export async function fetchNotifications() {
  return get<any[]>('/notifications');
}

export async function fetchCampaigns() {
  return get<any[]>('/campaigns');
}
