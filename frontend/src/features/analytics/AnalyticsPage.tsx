import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Filter, Eye, MousePointerClick, Target, DollarSign, Users, Clock, Smartphone, Globe } from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/utils/helpers';

const PERIODS = ['7', '30', '90', '365'];

export const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('30');

  const overviewStats = [
    { label: 'مرات الظهور', value: 1250000, change: 8.3, icon: Eye, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: 'النقرات', value: 78500, change: -2.1, icon: MousePointerClick, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: 'التحويلات', value: 3450, change: 15.7, icon: Target, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { label: 'الإنفاق', value: 45600, change: 12.5, icon: DollarSign, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
  ];

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('analytics.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">تحليل أداء الحملات</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {PERIODS.map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={cn('px-4 py-1.5 text-xs rounded-lg transition-colors', period === p ? 'bg-white dark:bg-gray-700 shadow-sm font-medium text-gray-900 dark:text-dark-text' : 'text-gray-500 hover:text-gray-700')}>
                {p === '365' ? 'سنة' : p === '30' ? 'شهر' : p === '7' ? 'أسبوع' : `${p} أيام`}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>تصدير</Button>
          <Button variant="outline" size="sm" icon={<Filter className="w-4 h-4" />}>تصفية</Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'overview', label: t('analytics.overview') },
          { id: 'audience', label: t('analytics.audienceAnalysis') },
          { id: 'timing', label: t('analytics.timePerformance') },
          { id: 'cost', label: t('analytics.costAnalysis') },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewStats.map((stat) => {
              const Icon = stat.icon;
              const isUp = stat.change >= 0;
              return (
                <Card key={stat.label} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn('p-2 rounded-lg', stat.color)}><Icon className="w-5 h-5" /></div>
                    <span className={cn('text-sm font-medium flex items-center gap-1', isUp ? 'text-green-600' : 'text-red-600')}>
                      <TrendingUp className="w-3 h-3" />
                      {Math.abs(stat.change)}%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{formatNumber(stat.value)}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-4">أداء الإنفاق</h3>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <BarChart3 className="w-12 h-12" />
                <p className="mr-2">الرسم البياني للإنفاق خلال 30 يوم</p>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-4">مقاييس رئيسية</h3>
              <div className="space-y-4">
                {[
                  { label: 'CTR', value: '2.45%', benchmark: '1.5%', status: 'up' },
                  { label: 'CPC', value: '$0.58', benchmark: '$0.75', status: 'down' },
                  { label: 'CPM', value: '$12.30', benchmark: '$15.00', status: 'down' },
                  { label: 'CPA', value: '$13.20', benchmark: '$18.00', status: 'down' },
                  { label: 'ROAS', value: '3.2x', benchmark: '2.0x', status: 'up' },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm font-medium text-gray-900 dark:text-dark-text">{metric.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">{metric.value}</span>
                      <Badge variant={metric.status === 'up' ? 'success' : 'info'}>المعيار: {metric.benchmark}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'audience' && (
        <Card className="p-6">
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">تحليل الجمهور - البيانات السكانية، الأجهزة، المتصفحات</p>
          </div>
        </Card>
      )}

      {activeTab === 'timing' && (
        <Card className="p-6">
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">تحليل الأداء الزمني - أفضل أيام وساعات التفاعل</p>
          </div>
        </Card>
      )}

      {activeTab === 'cost' && (
        <Card className="p-6">
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">تحليل التكلفة - CPM, CPC, CPA حسب المنصة</p>
          </div>
        </Card>
      )}
    </div>
  );
};



