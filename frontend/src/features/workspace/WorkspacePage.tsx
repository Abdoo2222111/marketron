import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Users, TrendingUp, DollarSign, HardDrive, Plus, UserPlus, Trash2, Settings, Crown, Building2, CalendarDays, Loader2, AlertCircle } from 'lucide-react';
import { cn, formatNumber } from '@/utils/helpers';
import { EmptyState } from '@/components/ui/empty-state';
import { cn as cnLib } from '@/lib/utils';
import api from '@/services/api';

export const WorkspacePage: React.FC = () => {
  const { t } = useTranslation();
  const [workspace, setWorkspace] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'member' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      window.location.href = '/ar/auth/login';
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [wsRes] = await Promise.allSettled([
        api.get('/workspace'),
      ]);
      if (wsRes.status === 'fulfilled') {
        setWorkspace(wsRes.value.data?.data || null);
        setClients(wsRes.value.data?.data?.clients || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async () => {
    if (!form.email.trim()) return;
    try {
      setSaving(true);
      await api.post('/workspace/clients', form);
      setShowAddClient(false);
      setForm({ name: '', email: '', role: 'member' });
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل إضافة العميل');
    } finally {
      setSaving(false);
    }
  };

  const statsCards = [
    { label: 'إجمالي العملاء', value: clients.length, change: '+0', icon: Users, gradient: 'from-blue-500 to-blue-600' },
    { label: 'الحملات النشطة', value: 0, change: '+0%', icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'الإنفاق الكلي', value: 0, change: '+0%', icon: DollarSign, gradient: 'from-purple to-violet', format: 'currency' },
    { label: 'التخزين', value: '0 / 1 GB', change: '0%', icon: HardDrive, gradient: 'from-orange-500 to-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black gradient-brand-text">{t('workspace.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">إدارة مساحة العمل والعملاء في MARKETRON</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 ml-1" />الإعدادات
          </Button>
          <Button onClick={() => setShowAddClient(true)} className="gradient-brand text-white border-0">
            <UserPlus className="w-4 h-4 ml-1" />{t('workspace.addClient')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5 border-0 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className={cnLib('p-3 rounded-xl bg-gradient-to-br text-white shadow-md', stat.gradient)}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-emerald-600">{stat.change}</span>
              </div>
              <p className="text-2xl font-black gradient-brand-text">
                {stat.format === 'currency' ? `$${formatNumber(stat.value as number)}` : stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 border-0 shadow-md bg-gradient-to-br from-electric/5 via-transparent to-purple/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl gradient-brand">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {workspace?.companyName || 'مساحة العمل الخاصة بك'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                الباقة: <Badge className="gradient-brand text-white border-0">{workspace?.subscriptionTier || 'احترافي'}</Badge>
                {' — '}
                الحالة: <Badge variant="success">نشط</Badge>
              </p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              التجديد: {workspace?.subscriptionEndsAt ? new Date(workspace.subscriptionEndsAt).toLocaleDateString('ar') : '2026-07-15'}
            </p>
            <Crown className="w-5 h-5 text-amber-500 mt-1 inline-block" />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-electric" />
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10" />}
          title="لا يوجد عملاء بعد"
          description="أضف عملاءك لإدارة حساباتهم وحملاتهم في مساحة عمل MARKETRON"
          actionLabel="إضافة عميل"
          onAction={() => setShowAddClient(true)}
        />
      ) : (
        <Card className="p-5 border-0 shadow-md">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">العملاء</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="pb-3 text-sm font-medium text-gray-500">العميل</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">البريد الإلكتروني</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">الدور</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">الحالة</th>
                  <th className="pb-3 text-sm font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client: any) => (
                  <tr key={client.id} className="border-b dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric to-cyan flex items-center justify-center text-white font-bold text-sm">
                          {client.user?.name?.charAt(0) || client.name?.charAt(0) || '؟'}
                        </div>
                        <span className="font-medium">{client.user?.name || client.name || 'عميل'}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">{client.user?.email || client.email}</td>
                    <td className="py-3 text-sm">
                      <Badge variant="info">{client.role}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={client.isActive ? 'success' : 'secondary'}>
                        {client.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm" className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
        <DialogContent>
          <DialogTitle className="gradient-brand-text">إضافة عميل جديد</DialogTitle>
          <div className="space-y-4">
            <div>
              <Label>اسم العميل</Label>
              <Input
                placeholder="اسم العميل أو الشركة"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input
                placeholder="email@example.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>الدور</Label>
              <select
                className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="member">عضو</option>
                <option value="admin">مدير</option>
                <option value="viewer">مشاهد</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowAddClient(false)}>إلغاء</Button>
              <Button onClick={handleAddClient} disabled={saving || !form.email.trim()} className="gradient-brand text-white border-0">
                {saving ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : null}
                إضافة العميل
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
