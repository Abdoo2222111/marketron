import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { formatCurrency, formatNumber, formatDate } from '@/utils/helpers';
import { Eye, TrendingUp, Download, FileText, CreditCard, Settings, BarChart3, DollarSign, MousePointerClick, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'يناير', الإنفاق: 3200, الظهور: 85000, النقرات: 5600 },
  { name: 'فبراير', الإنفاق: 4100, الظهور: 102000, النقرات: 7200 },
  { name: 'مارس', الإنفاق: 3800, الظهور: 95000, النقرات: 6400 },
];

const invoices = [
  { id: 'INV-001', date: '2026-06-01', amount: 4500, status: 'paid' },
  { id: 'INV-002', date: '2026-05-01', amount: 4500, status: 'paid' },
  { id: 'INV-003', date: '2026-04-01', amount: 4500, status: 'pending' },
  { id: 'INV-004', date: '2026-03-01', amount: 3500, status: 'paid' },
];

export const ClientPortalPage: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: t('client.overview'), icon: <Eye className="w-4 h-4" /> },
    { id: 'reports', label: t('client.reports'), icon: <FileText className="w-4 h-4" /> },
    { id: 'invoices', label: t('client.invoices'), icon: <CreditCard className="w-4 h-4" /> },
    { id: 'settings', label: t('client.accountSettings'), icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('client.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">مرحباً بك، أحمد! إليك ملخص أداء حملاتك</p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {/* Overview */}
      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('dashboard.totalSpend'), value: formatCurrency(12200), icon: DollarSign, color: 'text-primary-600' },
              { label: t('campaigns.impressions'), value: formatNumber(282000), icon: Eye, color: 'text-secondary-600' },
              { label: t('campaigns.clicks'), value: formatNumber(19200), icon: MousePointerClick, color: 'text-accent-600' },
              { label: t('campaigns.conversionsObjective'), value: formatNumber(845), icon: Target, color: 'text-purple-600' },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label} className="p-4 text-center">
                  <Icon className={`w-5 h-5 mx-auto mb-2 ${kpi.color}`} />
                  <p className="text-xl font-bold text-gray-900 dark:text-dark-text">{kpi.value}</p>
                  <p className="text-xs text-gray-500">{kpi.label}</p>
                </Card>
              );
            })}
          </div>

          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-4">أداء الحملات</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Line type="monotone" dataKey="الإنفاق" stroke="#6366f1" strokeWidth={2} />
                <Line type="monotone" dataKey="الظهور" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {/* Reports */}
      {tab === 'reports' && (
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-4">{t('client.reports')}</h3>
          <div className="space-y-3">
            {['تقرير أداء شهر يونيو', 'تقرير أداء شهر مايو', 'تقرير أداء الربع الثاني'].map((report, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-text">{report}</span>
                </div>
                <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>تحميل PDF</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Invoices */}
      {tab === 'invoices' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">رقم الفاتورة</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 dark:border-dark-border">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-dark-text">{inv.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(inv.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatCurrency(inv.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status === 'paid' ? 'مدفوعة' : 'قيد الدفع'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>PDF</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <Card className="p-5 max-w-lg">
          <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-4">{t('client.accountSettings')}</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-primary-600">أ</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-dark-text">أحمد محمد</p>
                <p className="text-sm text-gray-500">ahmed@example.com</p>
              </div>
              <Button variant="outline" size="sm" className="mr-auto">تعديل</Button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'البريد الإلكتروني', value: 'ahmed@example.com' },
                { label: 'رقم الجوال', value: '+966 55 123 4567' },
                { label: 'الشركة', value: 'شركة الأمل للتسويق' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm text-gray-900 dark:text-dark-text">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};



