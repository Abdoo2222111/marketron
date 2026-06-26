import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/DataDisplay';
import { Pagination } from '@/components/ui/tabs';
import { cn, formatCurrency, formatNumber, formatDate, getStatusTextColor } from '@/utils/helpers';
import { Plus, Filter, Download, Facebook, Instagram, Music, Ghost, MoreHorizontal, Eye, Pencil, Play, Pause, Trash2, Search } from 'lucide-react';

const campaigns = [
  { id: '1', name: 'حملة عيد الأضحى', platform: 'facebook', status: 'active', budget: 10000, spent: 4500, impressions: 125000, clicks: 8900, conversions: 345, startDate: '2026-06-01', endDate: '2026-06-30' },
  { id: '2', name: 'حملة الربيع', platform: 'instagram', status: 'active', budget: 8000, spent: 3200, impressions: 98000, clicks: 6700, conversions: 234, startDate: '2026-03-15', endDate: '2026-06-15' },
  { id: '3', name: 'تخفيضات الصيف', platform: 'tiktok', status: 'paused', budget: 6000, spent: 2800, impressions: 245000, clicks: 12000, conversions: 189, startDate: '2026-05-01', endDate: '2026-08-31' },
  { id: '4', name: 'إطلاق منتج جديد', platform: 'snapchat', status: 'completed', budget: 5000, spent: 2100, impressions: 76000, clicks: 4300, conversions: 156, startDate: '2026-01-01', endDate: '2026-03-31' },
  { id: '5', name: 'حملة العودة للمدارس', platform: 'facebook', status: 'draft', budget: 4000, spent: 0, impressions: 0, clicks: 0, conversions: 0, startDate: '2026-08-15', endDate: '2026-09-15' },
  { id: '6', name: 'حملة الشتاء', platform: 'instagram', status: 'active', budget: 7000, spent: 1800, impressions: 54000, clicks: 3200, conversions: 98, startDate: '2026-11-01', endDate: '2026-12-31' },
  { id: '7', name: 'تخفيضات الجمعة البيضاء', platform: 'tiktok', status: 'draft', budget: 12000, spent: 0, impressions: 0, clicks: 0, conversions: 0, startDate: '2026-11-20', endDate: '2026-11-28' },
  { id: '8', name: 'حملة رمضان', platform: 'facebook', status: 'active', budget: 15000, spent: 7800, impressions: 310000, clicks: 18500, conversions: 567, startDate: '2026-02-01', endDate: '2026-03-31' },
];

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4" style={{ color: '#1877F2' }} />,
  instagram: <Instagram className="w-4 h-4" style={{ color: '#E4405F' }} />,
  tiktok: <Music className="w-4 h-4" />,
  snapchat: <Ghost className="w-4 h-4" style={{ color: '#FFFC00' }} />,
};

const platformNames: Record<string, string> = {
  facebook: 'فيسبوك',
  instagram: 'إنستجرام',
  tiktok: 'تيك توك',
  snapchat: 'سناب شات',
};

const statusNames: Record<string, string> = {
  active: 'نشط',
  paused: 'موقف',
  completed: 'منتهي',
  draft: 'مسودة',
};

const statusVariants: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
  active: 'success',
  paused: 'warning',
  completed: 'info',
  draft: 'neutral',
};

export const CampaignListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = campaigns.filter((c) => c.name.includes(search));

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('campaigns.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة ومراقبة جميع حملاتك الإعلانية</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<Filter className="w-4 h-4" />}>{t('common.filter')}</Button>
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>{t('common.export')}</Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/campaigns/create')}>{t('campaigns.createCampaign')}</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{campaigns.length}</p>
          <p className="text-sm text-gray-500">إجمالي الحملات</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{campaigns.filter((c) => c.status === 'active').length}</p>
          <p className="text-sm text-gray-500">النشطة</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{campaigns.filter((c) => c.status === 'paused').length}</p>
          <p className="text-sm text-gray-500">الموقوفة</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{formatCurrency(campaigns.reduce((a, c) => a + c.spent, 0))}</p>
          <p className="text-sm text-gray-500">إجمالي الإنفاق</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-dark-border">
          <SearchInput value={search} onChange={setSearch} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-gray-800/50">
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">اسم الحملة</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">المنصة</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">الميزانية</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">الإنفاق</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">مرات الظهور</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">النقرات</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">التحويلات</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">تاريخ البدء</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer" onClick={() => navigate(`/campaigns/${c.id}`)}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-dark-text">{c.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {platformIcons[c.platform]}
                      <span className="text-sm text-gray-600 dark:text-gray-400">{platformNames[c.platform]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatCurrency(c.budget)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatCurrency(c.spent)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatNumber(c.impressions)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatNumber(c.clicks)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatNumber(c.conversions)}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariants[c.status]}>{statusNames[c.status]}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(c.startDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Eye className="w-4 h-4 text-gray-400" /></button>
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Pencil className="w-4 h-4 text-gray-400" /></button>
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        {c.status === 'active' ? <Pause className="w-4 h-4 text-gray-400" /> : <Play className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-dark-border">
          <Pagination currentPage={page} totalPages={3} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
};



