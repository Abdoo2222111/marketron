let campaigns = [
  {
    id: '1',
    name: 'حملة تسويق المنتج الجديد',
    platform: 'facebook',
    status: 'active',
    budget: 5000,
    spent: 2340,
    impressions: 45000,
    clicks: 1200,
    conversions: 85,
    ctr: 2.67,
    cpc: 1.95,
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'حملة إعادة الاستهداف',
    platform: 'instagram',
    status: 'active',
    budget: 3000,
    spent: 1500,
    impressions: 28000,
    clicks: 890,
    conversions: 45,
    ctr: 3.18,
    cpc: 1.69,
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'حملة موسمية',
    platform: 'facebook',
    status: 'draft',
    budget: 8000,
    spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    ctr: 0,
    cpc: 0,
    startDate: null,
    createdAt: new Date().toISOString(),
  },
];

export function getCampaigns() { return campaigns; }
export function setCampaigns(list: any[]) { campaigns = list; }
export function addCampaign(c: any) { campaigns.unshift(c); }
export function updateCampaign(id: string, data: any) {
  const idx = campaigns.findIndex(c => c.id === id);
  if (idx >= 0) { campaigns[idx] = { ...campaigns[idx], ...data, id }; return campaigns[idx]; }
  return null;
}
export function deleteCampaign(id: string) {
  const idx = campaigns.findIndex(c => c.id === id);
  if (idx >= 0) { campaigns.splice(idx, 1); return true; }
  return false;
}
