'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Facebook, Instagram, Music, Ghost, MessageCircle, Globe,
  Plus, Check, X, RefreshCw, Loader2, Link2, Unlink, AlertCircle,
  ExternalLink, Smartphone, Settings,
} from 'lucide-react';

const platforms = [
  {
    id: 'facebook',
    name: 'فيسبوك',
    nameEn: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    description: 'إدارة إعلانات فيسبوك وجلب بيانات الحملات',
    required: 'معرف التطبيق (App ID) + Secret',
    docUrl: 'https://developers.facebook.com/docs/marketing-apis',
  },
  {
    id: 'instagram',
    name: 'إنستجرام',
    nameEn: 'Instagram',
    icon: Instagram,
    color: 'bg-pink-500',
    gradient: 'from-pink-500 to-rose-500',
    description: 'إدارة إعلانات إنستجرام وجلب بيانات الأداء',
    required: 'حساب إنستجرام أعمال مرتبط بفيسبوك',
    docUrl: 'https://developers.facebook.com/docs/instagram-api',
  },
  {
    id: 'tiktok',
    name: 'تيك توك',
    nameEn: 'TikTok',
    icon: Music,
    color: 'bg-gray-900',
    gradient: 'from-gray-900 to-gray-700',
    description: 'إدارة حملات تيك توك وجلب التحليلات',
    required: 'معرف التطبيق (App ID) + Secret',
    docUrl: 'https://ads.tiktok.com/marketing_api/docs',
  },
  {
    id: 'snapchat',
    name: 'سناب شات',
    nameEn: 'Snapchat',
    icon: Ghost,
    color: 'bg-yellow-400',
    gradient: 'from-yellow-400 to-yellow-500',
    description: 'إدارة إعلانات سناب شات وجلب البيانات',
    required: 'معرف التطبيق (App ID) + Secret',
    docUrl: 'https://developers.snap.com/api/marketing',
  },
  {
    id: 'whatsapp',
    name: 'واتساب',
    nameEn: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-teal-500',
    description: 'صندوق رسائل موحد مع ردود ذكية عبر Evolution API',
    required: 'Evolution API + QR code',
    docUrl: 'https://evolution-api.com',
  },
  {
    id: 'google',
    name: 'Google Ads',
    nameEn: 'Google Ads',
    icon: Globe,
    color: 'bg-blue-600',
    gradient: 'from-blue-600 to-sky-500',
    description: 'إدارة حملات Google Ads وتحليلات البحث',
    required: 'حساب Google Ads + OAuth',
    docUrl: 'https://developers.google.com/google-ads/api',
  },
];

interface PlatformState {
  connected: boolean;
  loading: boolean;
  error: string | null;
  accountName?: string;
  expiresAt?: string;
}

export default function ChannelsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isRtl = locale === 'ar';

  const [platformsState, setPlatformsState] = useState<Record<string, PlatformState>>({
    facebook: { connected: false, loading: false, error: null },
    instagram: { connected: false, loading: false, error: null },
    tiktok: { connected: false, loading: false, error: null },
    snapchat: { connected: false, loading: false, error: null },
    whatsapp: { connected: true, loading: false, error: null, accountName: 'رقم واتساب الأعمال', expiresAt: new Date(Date.now() + 86400000 * 60).toISOString() },
    google: { connected: false, loading: false, error: null },
  });

  const [connectDialog, setConnectDialog] = useState<string | null>(null);
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');

  const handleConnect = async (platformId: string) => {
    setPlatformsState(prev => ({
      ...prev,
      [platformId]: { ...prev[platformId], loading: true, error: null },
    }));
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/platforms/${platformId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({ appId, appSecret }),
        }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'فشل الاتصال بالمنصة');
      }
      const data = await res.json();
      setPlatformsState(prev => ({
        ...prev,
        [platformId]: {
          connected: true,
          loading: false,
          error: null,
          accountName: data.data?.name || platformId,
          expiresAt: data.data?.tokenExpiresAt,
        },
      }));
      setConnectDialog(null);
    } catch (err: any) {
      setPlatformsState(prev => ({
        ...prev,
        [platformId]: { ...prev[platformId], loading: false, error: err.message },
      }));
    }
  };

  const handleDisconnect = async (platformId: string) => {
    setPlatformsState(prev => ({
      ...prev,
      [platformId]: { ...prev[platformId], loading: true },
    }));
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/platforms/${platformId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );
      setPlatformsState(prev => ({
        ...prev,
        [platformId]: { connected: false, loading: false, error: null, accountName: undefined, expiresAt: undefined },
      }));
    } catch {
      setPlatformsState(prev => ({
        ...prev,
        [platformId]: { ...prev[platformId], loading: false },
      }));
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black gradient-brand-text">ربط القنوات</h1>
            <p className="text-muted-foreground text-sm mt-1">
              اربط حساباتك الإعلانية لإدارة كل شيء من مكان واحد
            </p>
          </div>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => {
            const state = platformsState[platform.id];
            const Icon = platform.icon;

            return (
              <Card key={platform.id} className={`border-0 shadow-md overflow-hidden ${state.connected ? 'ring-2 ring-emerald-500/50' : ''}`}>
                {/* Platform header */}
                <div className={`bg-gradient-to-r ${platform.gradient} px-5 py-4 text-white flex items-center gap-3`}>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">{isRtl ? platform.name : platform.nameEn}</p>
                    <p className="text-xs text-white/80">{platform.description}</p>
                  </div>
                  {state.connected && (
                    <Badge className="mr-auto bg-emerald-500/80 text-white border-0 text-xs">
                      <Check className="w-3 h-3 ml-1" />
                      متصل
                    </Badge>
                  )}
                </div>

                <CardContent className="p-5">
                  {state.error && (
                    <div className="mb-3 flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                      <AlertCircle className="w-3 h-3" />
                      {state.error}
                    </div>
                  )}

                  {state.connected ? (
                    <div className="space-y-3">
                      {state.accountName && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">الحساب:</span>
                          <span className="font-medium">{state.accountName}</span>
                        </div>
                      )}
                      {state.expiresAt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">صلاحية الرمز:</span>
                          <span className="text-xs">
                            {new Date(state.expiresAt).toLocaleDateString(isRtl ? 'ar' : 'en')}
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-1/2 border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDisconnect(platform.id)}
                          disabled={state.loading}
                        >
                          {state.loading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Unlink className="w-3 h-3 ml-1" />
                          )}
                          فصل
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-1/2"
                          onClick={() => window.open(platform.docUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 ml-1" />
                          توثيق
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        المطلوب: {platform.required}
                      </p>
                      {connectDialog === platform.id ? (
                        <div className="space-y-2" onClick={e => e.stopPropagation()}>
                          <Input
                            placeholder="App ID / Client ID"
                            value={appId}
                            onChange={e => setAppId(e.target.value)}
                            dir="ltr"
                          />
                          <Input
                            placeholder="App Secret / Client Secret"
                            type="password"
                            value={appSecret}
                            onChange={e => setAppSecret(e.target.value)}
                            dir="ltr"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 gradient-brand text-white border-0"
                              onClick={() => handleConnect(platform.id)}
                              disabled={state.loading || !appId}
                            >
                              {state.loading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Link2 className="w-3 h-3 ml-1" />
                              )}
                              اتصال
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setConnectDialog(null); setAppId(''); setAppSecret(''); }}
                            >
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          className="w-full gradient-brand text-white border-0"
                          onClick={() => {
                            if (platform.id === 'whatsapp') {
                              window.location.href = `/${locale}/dashboard/settings`;
                            } else {
                              setConnectDialog(platform.id);
                            }
                          }}
                        >
                          <Plus className="w-4 h-4 ml-1" />
                          ربط {isRtl ? platform.name : platform.nameEn}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500/5 to-electric/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple to-electric flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">تحتاج مساعدة في ربط المنصات؟</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  كل منصة إعلانية تتطلب إنشاء تطبيق (App) في لوحة المطورين الخاصة بها. اتبع الخطوات في صفحة الإعدادات أو راجع التوثيق الرسمي لكل منصة.
                </p>
                <Link href={`/${locale}/dashboard/settings`}>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 ml-1" />
                    الذهاب للإعدادات
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
