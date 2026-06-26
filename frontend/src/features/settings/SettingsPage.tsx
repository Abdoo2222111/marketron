import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { User, Link2, Users, Bell, CreditCard, Palette, Shield, Smartphone, Globe, Save, Camera, Trash2, Plus, X } from 'lucide-react';
import { cn } from '@/utils/helpers';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'platforms', label: t('settings.connectedPlatforms'), icon: Link2 },
    { id: 'team', label: t('settings.team'), icon: Users },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'billing', label: t('settings.billing'), icon: CreditCard },
    { id: 'branding', label: t('settings.branding'), icon: Palette },
  ];

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 text-2xl font-bold">
              أ
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-primary-600 text-white rounded-full">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-dark-text">أحمد محمد</h3>
            <p className="text-sm text-gray-500">ahmed@example.com</p>
            <Badge variant="primary" className="mt-1">مدير</Badge>
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <Card className="p-6">
        <h3 className="font-bold text-gray-900 dark:text-dark-text mb-4">{t('settings.editProfile')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('settings.fullName')}</label>
            <Input defaultValue="أحمد محمد" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('settings.email')}</label>
            <Input defaultValue="ahmed@example.com" type="email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('settings.phone')}</label>
            <Input defaultValue="+966501234567" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الشركة</label>
            <Input defaultValue="شركة التسويق المتميز" />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button icon={<Save className="w-4 h-4" />}>حفظ التغييرات</Button>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <h3 className="font-bold text-gray-900 dark:text-dark-text mb-4">{t('settings.changePassword')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('settings.currentPassword')}</label>
            <Input type="password" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('settings.newPassword')}</label>
            <Input type="password" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.confirmPassword')}</label>
            <Input type="password" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline">تحديث كلمة المرور</Button>
        </div>
      </Card>
    </div>
  );

  const renderPlatforms = () => (
    <div className="space-y-4">
      {[
        { name: 'فيسبوك', platform: 'facebook', connected: true, icon: 'facebook', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
        { name: 'إنستجرام', platform: 'instagram', connected: true, icon: 'instagram', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' },
        { name: 'تيك توك', platform: 'tiktok', connected: false, icon: 'tiktok', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600' },
        { name: 'سناب شات', platform: 'snapchat', connected: false, icon: 'snapchat', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
      ].map((p) => (
        <Card key={p.platform} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg', p.color)}>
                {p.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-dark-text">{p.name}</p>
                <p className="text-xs text-gray-500">{p.connected ? 'الحساب متصل' : 'غير متصل'}</p>
              </div>
            </div>
            <Button variant={p.connected ? 'outline' : 'primary'}>
              {p.connected ? 'فصل' : t('settings.connect')}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderTeam = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-dark-text">{t('settings.team')}</h3>
        <Button icon={<Plus className="w-4 h-4" />}>{t('settings.inviteMember')}</Button>
      </div>
      <div className="space-y-3">
        {[
          { name: 'أحمد محمد', email: 'ahmed@company.com', role: 'owner' },
          { name: 'سارة أحمد', email: 'sara@company.com', role: 'admin' },
          { name: 'خالد عمر', email: 'khalid@company.com', role: 'editor' },
          { name: 'نورة سعد', email: 'noura@company.com', role: 'viewer' },
        ].map((member, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-dark-text">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={member.role === 'owner' ? 'primary' : member.role === 'admin' ? 'success' : 'info'}>
                {member.role === 'owner' ? 'مالك' : member.role === 'admin' ? 'مدير' : member.role === 'editor' ? 'محرر' : 'مشاهد'}
              </Badge>
              {member.role !== 'owner' && (
                <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-red-500" /></Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderNotifications = () => (
    <Card className="p-6">
      <h3 className="font-bold text-gray-900 dark:text-dark-text mb-4">{t('settings.notifications')}</h3>
      <div className="space-y-4">
        {[
          { label: 'إشعارات البريد الإلكتروني', desc: 'استلام إشعارات على البريد الإلكتروني', enabled: true },
          { label: 'إشعارات واتساب', desc: 'استلام إشعارات عبر واتساب', enabled: false },
          { label: 'تنبيهات الحملات', desc: 'إشعارات عند انتهاء أو تجاوز ميزانية الحملة', enabled: true },
          { label: 'تقارير أسبوعية', desc: 'استلام تقرير أداء أسبوعي', enabled: true },
        ].map((n, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <div>
              <p className="font-medium text-gray-900 dark:text-dark-text">{n.label}</p>
              <p className="text-sm text-gray-500">{n.desc}</p>
            </div>
            <button className={cn('w-12 h-6 rounded-full transition-colors', n.enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600')}>
              <div className={cn('w-5 h-5 rounded-full bg-white shadow-sm transition-transform', n.enabled ? 'translate-x-6' : 'translate-x-0.5')} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-bold text-gray-900 dark:text-dark-text mb-4">الباقة الحالية</h3>
        <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
          <div>
            <p className="font-bold text-lg text-gray-900 dark:text-dark-text">الباقة الاحترافية</p>
            <p className="text-sm text-gray-500">$79/شهر — 14 يوماً متبقية في الفترة التجريبية</p>
          </div>
          <Badge variant="primary">نشط</Badge>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="font-bold text-gray-900 dark:text-dark-text mb-4">{t('settings.billingHistory')}</h3>
        <div className="text-center py-8 text-gray-500">
          <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>لا توجد فواتير سابقة</p>
        </div>
      </Card>
    </div>
  );

  const renderBranding = () => (
    <Card className="p-6">
      <h3 className="font-bold text-gray-900 dark:text-dark-text mb-4">{t('settings.branding')}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('settings.brandName')}</label>
          <Input placeholder="اسم العلامة التجارية" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('settings.uploadLogo')}</label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
            <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">اسحب وأفلت الشعار هنا أو انقر للرفع</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الألوان الرئيسية</label>
          <div className="flex gap-3">
            {['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color) => (
              <button key={color} className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <Button icon={<Save className="w-4 h-4" />}>حفظ العلامة التجارية</Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('settings.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">إدارة إعدادات حسابك والمنصة</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full text-right flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm',
                  activeTab === tab.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'platforms' && renderPlatforms()}
          {activeTab === 'team' && renderTeam()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'billing' && renderBilling()}
          {activeTab === 'branding' && renderBranding()}
        </div>
      </div>
    </div>
  );
};



