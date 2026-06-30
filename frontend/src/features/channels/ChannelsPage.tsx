'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Facebook, Instagram, Music, Ghost, MessageCircle, Globe,
  Plus, Check, Loader2, Link2, Unlink, AlertCircle,
  ExternalLink, Settings, Eye, EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const platforms = [
  {
    id: 'facebook',
    name: 'فيسبوك',
    nameEn: 'Facebook',
    icon: Facebook,
    gradient: 'from-blue-600 to-blue-800',
    description: 'إدارة إعلانات فيسبوك وجلب بيانات الحملات',
    tokenLabel: 'Page Access Token',
    tokenPlaceholder: 'أدخل Facebook Page Access Token',
    docUrl: 'https://developers.facebook.com/docs/facebook-login/access-tokens',
  },
  {
    id: 'instagram',
    name: 'إنستجرام',
    nameEn: 'Instagram',
    icon: Instagram,
    gradient: 'from-pink-500 via-rose-500 to-orange-500',
    description: 'إدارة إعلانات إنستجرام وجلب بيانات الأداء',
    tokenLabel: 'Instagram Graph API Token',
    tokenPlaceholder: 'أدخل Instagram Access Token',
    docUrl: 'https://developers.facebook.com/docs/instagram-api',
  },
  {
    id: 'tiktok',
    name: 'تيك توك',
    nameEn: 'TikTok',
    icon: Music,
    gradient: 'from-gray-900 to-gray-700',
    description: 'إدارة حملات تيك توك وجلب التحليلات',
    tokenLabel: 'TikTok Access Token',
    tokenPlaceholder: 'أدخل TikTok Access Token',
    docUrl: 'https://ads.tiktok.com/marketing_api/docs',
  },
  {
    id: 'snapchat',
    name: 'سناب شات',
    nameEn: 'Snapchat',
    icon: Ghost,
    gradient: 'from-yellow-400 to-yellow-500',
    description: 'إدارة إعلانات سناب شات وجلب البيانات',
    tokenLabel: 'Snapchat Access Token',
    tokenPlaceholder: 'أدخل Snapchat Access Token',
    docUrl: 'https://developers.snap.com/api/marketing',
  },
  {
    id: 'whatsapp',
    name: 'واتساب',
    nameEn: 'WhatsApp',
    icon: MessageCircle,
    gradient: 'from-emerald-500 to-teal-500',
    description: 'صندوق رسائل موحد مع ردود ذكية عبر Evolution API',
    tokenLabel: 'Evolution API URL + Key',
    tokenPlaceholder: 'رابط API',
    docUrl: 'https://evolution-api.com',
  },
  {
    id: 'google',
    name: 'Google Ads',
    nameEn: 'Google Ads',
    icon: Globe,
    gradient: 'from-blue-600 to-sky-500',
    description: 'إدارة حملات Google Ads وتحليلات البحث',
    tokenLabel: 'Google Ads OAuth Token',
    tokenPlaceholder: 'أدخل Google Ads Refresh Token',
    docUrl: 'https://developers.google.com/google-ads/api',
  },
];

export default function ChannelsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isRtl = locale === 'ar';

  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<Record<string, any>>({});
  const [connectPlatform, setConnectPlatform] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/platforms');
      const data = await res.json();
      const conns: Record<string, any> = {};
      (data.data || []).forEach((c: any) => {
        conns[c.id || c.platform] = c;
      });
      setConnections(conns);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleConnect = async () => {
    if (!connectPlatform || !tokenInput.trim()) return;
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/platforms/${connectPlatform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ accessToken: tokenInput }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'فشل الاتصال');
      }
      await loadConnections();
      setConnectPlatform(null);
      setTokenInput('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    setError(null);
    try {
      await fetch(`/api/v1/platforms/${platformId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      await loadConnections();
    } catch {
      setError('فشل الفصل');
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black gradient-brand-text">ربط القنوات</h1>
            <p className="text-[#A1A1C2] text-sm mt-1">اربط حساباتك الإعلانية لإدارة كل شيء من مكان واحد</p>
          </div>
          <Link href={`/${locale}/dashboard/settings`}>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 ml-1" />
              الإعدادات المتقدمة
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#F43F5E]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="mr-auto text-[#F43F5E]/60 hover:text-[#F43F5E]">✕</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-[#1E1B3A] via-[#2D2B55] to-[#1E1B3A] animate-shimmer bg-[length:200%_100%]" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => {
              const conn = connections[platform.id];
              const Icon = platform.icon;
              const isConnecting = connectPlatform === platform.id;

              return (
                <Card key={platform.id} className={cn('overflow-hidden', conn ? 'ring-2 ring-[#10B981]/50' : '')}>
                  <div className={cn('bg-gradient-to-r px-5 py-4 text-white', platform.gradient)}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{isRtl ? platform.name : platform.nameEn}</p>
                        <p className="text-xs text-white/80">{platform.description}</p>
                      </div>
                      {conn && (
                        <Badge className="bg-emerald-500/80 text-white border-0 text-xs">
                          <Check className="w-3 h-3 ml-1" /> متصل
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-5">
                    {conn ? (
                      <div className="space-y-3">
                        {conn.name && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#A1A1C2]">الحساب:</span>
                            <span className="font-medium">{conn.name}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#A1A1C2]">الحالة:</span>
                          <Badge variant={conn.connected || conn.status === 'active' ? 'success' : 'secondary'} className="text-[10px]">
                            {conn.connected || conn.status === 'active' ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#F43F5E]/30 text-[#F43F5E] hover:bg-[#F43F5E]/10"
                            onClick={() => handleDisconnect(platform.id)}
                          >
                            <Unlink className="w-3 h-3 ml-1" /> فصل
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(platform.docUrl, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 ml-1" /> توثيق
                          </Button>
                        </div>
                      </div>
                    ) : isConnecting ? (
                      <div className="space-y-3">
                        <p className="text-xs text-[#A1A1C2]">{platform.tokenLabel}</p>
                        <div className="relative">
                          <Input
                            type={showToken ? 'text' : 'password'}
                            placeholder={platform.tokenPlaceholder}
                            value={tokenInput}
                            onChange={e => setTokenInput(e.target.value)}
                            dir="ltr"
                            className="text-xs font-mono pl-8"
                          />
                          <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-[#A1A1C2] hover:text-white"
                          >
                            {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 gradient-brand text-white border-0"
                            onClick={handleConnect}
                            disabled={connecting || !tokenInput.trim()}
                          >
                            {connecting ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <Link2 className="w-3 h-3 ml-1" />}
                            اتصال
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setConnectPlatform(null); setTokenInput(''); }}>
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-[#A1A1C2]">بوابة سريعة للربط. يمكنك أيضاً استخدام صفحة <Link href={`/${locale}/dashboard/settings`} className="text-[#7C3AED] underline">الإعدادات</Link> لإدارة متقدمة.</p>
                        <Button
                          className="w-full gradient-brand text-white border-0"
                          onClick={() => { setConnectPlatform(platform.id); setTokenInput(''); setError(null); }}
                        >
                          <Plus className="w-4 h-4 ml-1" />
                          ربط {isRtl ? platform.name : platform.nameEn}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
