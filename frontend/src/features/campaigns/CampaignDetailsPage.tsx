import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/tabs';
import { formatCurrency, formatNumber, formatDate } from '@/utils/helpers';
import { ArrowLeft, Facebook, Instagram, Music, Ghost, Edit3, Pause, Play, Trash2, DollarSign, Eye, MousePointerClick, Target, TrendingUp, CalendarDays, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'الأسبوع 1', الإنفاق: 1200, الظهور: 35000, النقرات: 2100 },
  { name: 'الأسبوع 2', الإنفاق: 1500, الظهور: 42000, النقرات: 2800 },
  { name: 'الأسبوع 3', الإنفاق: 900, الظهور: 28000, النقرات: 1900 },
  { name: 'الأسبوع 4', الإنفاق: 1800, الظهور: 52000, النقرات: 3500 },
];

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-5 h-5" style={{ color: '#1877F2' }} />,
  instagram: <Instagram className="w-5 h-5" style={{ color: '#E4405F' }} />,
  tiktok: <Music className="w-5 h-5" />,
  snapchat: <Ghost className="w-5 h-5" style={{ color: '#FFFC00' }} />,
};

export const CampaignDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate('/campaigns')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-2">
            <ArrowLeft className="w-4 h-4" /> رجوع للحملات
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">حملة عيد الأضحى</h1>
            <Badge variant="success">نشط</Badge>
          </div>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">{platformIcons['facebook']} فيسبوك • {t('campaigns.awareness')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Pause className="w-4 h-4" />}>إيقاف</Button>
          <Button variant="outline" size="sm" icon={<Edit3 className="w-4 h-4" />}>{t('common.edit')}</Button>
          <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />}>{t('common.delete')}</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: t('campaigns.budget'), value: formatCurrency(10000), icon: DollarSign, color: 'text-primary-600' },
          { label: t('campaigns.spent'), value: formatCurrency(4500), icon: DollarSign, color: 'text-amber-600' },
          { label: t('campaigns.impressions'), value: formatNumber(125000), icon: Eye, color: 'text-secondary-600' },
          { label: t('campaigns.clicks'), value: formatNumber(8900), icon: MousePointerClick, color: 'text-accent-600' },
          { label: t('campaigns.conversionsObjective'), value: formatNumber(345), icon: Target, color: 'text-purple-600' },
          { label: t('campaigns.roas'), value: '3.2x', icon: TrendingUp, color: 'text-green-600' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-4 text-center">
              <Icon className={cn('w-5 h-5 mx-auto mb-2', kpi.color)} />
              <p className="text-lg font-bold text-gray-900 dark:text-dark-text">{kpi.value}</p>
              <p className="text-xs text-gray-500">{kpi.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Budget Progress */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-dark-text">استهلاك الميزانية</h3>
          <span className="text-sm text-gray-500">4,500 / 10,000 {formatCurrency(0).split(/\d/)[0]}</span>
        </div>
        <Progress value={45} color={'bg-primary-600'} />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>5,000</span>
          <span>10,000</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-4">أداء الحملة</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              <Line type="monotone" dataKey="الإنفاق" stroke="#6366f1" strokeWidth={2} />
              <Line type="monotone" dataKey="الظهور" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="النقرات" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Campaign Info */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-4">معلومات الحملة</h3>
          <div className="space-y-3">
            {[
              { label: 'المنصة', value: 'فيسبوك', icon: platformIcons['facebook'] },
              { label: 'الهدف', value: 'الوعي', icon: Target },
              { label: 'تاريخ البدء', value: formatDate('2026-06-01'), icon: CalendarDays },
              { label: 'تاريخ الانتهاء', value: formatDate('2026-06-30'), icon: CalendarDays },
              { label: 'الجمهور', value: 'السعودية • 18-65', icon: Users },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <span className="text-gray-400">{typeof item.icon === 'function' ? React.createElement(item.icon as React.ComponentType<{size?: number}>, { size: 16 }) : item.icon}</span>
                <span className="text-gray-500 min-w-[80px]">{item.label}:</span>
                <span className="text-gray-900 dark:text-dark-text font-medium">{item.value}</span>
              </div>
            ))}
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-dark-text mt-6 mb-3">محتوى الإعلان</h3>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg mb-3 flex items-center justify-center">
              <Eye className="w-8 h-8 text-primary-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-dark-text">تخفيضات عيد الأضحى!</p>
            <p className="text-xs text-gray-500 mt-1">احصل على خصم 30% على جميع المنتجات بمناسبة عيد الأضحى المبارك</p>
            <Button variant="primary" size="sm" className="mt-2 w-full">تسوق الآن</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) { return inputs.filter(Boolean).join(' '); }



