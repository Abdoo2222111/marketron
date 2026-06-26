import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, TrendingUp, TrendingDown, BarChart3, Eye, MousePointerClick, Target, DollarSign, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/utils/helpers';

const MOCK_COMPETITORS = [
  { id: '1', name: 'شركة الأفق', platform: 'facebook', activeAds: 12, monthlySpend: 15000, followers: 125000, engagement: 3.2, trend: 'up', lastAnalyzed: 'منذ يومين' },
  { id: '2', name: 'متجر النخبة', platform: 'instagram', activeAds: 8, monthlySpend: 9500, followers: 89000, engagement: 4.5, trend: 'up', lastAnalyzed: 'منذ 5 أيام' },
  { id: '3', name: 'شركة البركة', platform: 'tiktok', activeAds: 15, monthlySpend: 22000, followers: 340000, engagement: 6.8, trend: 'up', lastAnalyzed: 'منذ أسبوع' },
  { id: '4', name: 'مؤسسة الرفاه', platform: 'snapchat', activeAds: 5, monthlySpend: 6000, followers: 45000, engagement: 2.1, trend: 'down', lastAnalyzed: 'منذ 3 أيام' },
];

const platformBadge: Record<string, string> = { facebook: 'primary', instagram: 'danger', tiktok: 'info', snapchat: 'warning' };

export const CompetitorsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('competitors.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">تحليل ومراقبة المنافسين</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />}>تحديث</Button>
          <Button icon={<Plus className="w-4 h-4" />}>{t('competitors.addCompetitor')}</Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'المنافسون', value: MOCK_COMPETITORS.length, change: '+2', icon: BarChart3, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
          { label: 'إجمالي الإعلانات', value: MOCK_COMPETITORS.reduce((s, c) => s + c.activeAds, 0), change: '+15%', icon: Eye, color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
          { label: 'متوسط التفاعل', value: '4.2%', change: '+0.8%', icon: TrendingUp, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
          { label: 'الإنفاق التقديري', value: formatCurrency(MOCK_COMPETITORS.reduce((s, c) => s + c.monthlySpend, 0)), change: '+12%', icon: DollarSign, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('p-2 rounded-lg', stat.color)}><Icon className="w-5 h-5" /></div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Competitor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_COMPETITORS.map((comp) => (
          <Card key={comp.id} className="p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-lg">
                  {comp.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-dark-text">{comp.name}</h3>
                  <Badge variant={platformBadge[comp.platform] as any}>{comp.platform === 'facebook' ? 'فيسبوك' : comp.platform === 'instagram' ? 'إنستجرام' : comp.platform === 'tiktok' ? 'تيك توك' : 'سناب شات'}</Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">الإعلانات النشطة</p>
                <p className="font-bold text-lg">{comp.activeAds}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">الإنفاق التقديري</p>
                <p className="font-bold text-lg">{formatCurrency(comp.monthlySpend)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">المتابعون</p>
                <p className="font-bold text-lg">{formatNumber(comp.followers)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">معدل التفاعل</p>
                <p className={cn('font-bold text-lg flex items-center gap-1', comp.trend === 'up' ? 'text-green-600' : 'text-red-600')}>
                  {comp.engagement}%
                  {comp.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
              <span className="text-xs text-gray-400">آخر تحليل: {comp.lastAnalyzed}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">عرض الإعلانات</Button>
                <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};



