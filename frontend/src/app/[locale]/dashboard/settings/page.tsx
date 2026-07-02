'use client';

import React, { useEffect, useState } from 'react';
import {
  User, Building2, Loader2, AlertCircle, Trash2,
  Link as LinkIcon, CheckCircle2, RefreshCw, MessageCircle, QrCode, Facebook, Send, AlertTriangle,
  Brain, Cpu, Bot, Key, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { PersonasTab } from '@/components/settings/PersonasTab';
import { BillingTab } from '@/components/settings/BillingTab';
import { PlatformTokensTab } from '@/components/settings/PlatformTokensTab';
import { FacebookInspectorTab } from '@/components/settings/FacebookInspectorTab';
import { AiProvidersTab } from '@/components/settings/AiProvidersTab';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { AiKeysTab } from '@/components/settings/AiKeysTab';
import { platformsApi, type PlatformConnection } from '@/services/api-modules';
import { cn } from '@/lib/utils';

const PLATFORMS = [
  { id: 'facebook', label: 'فيسبوك', emoji: '📘', color: 'from-blue-600 to-blue-800', desc: 'ربط صفحة فيسبوك لاستقبال وإرسال الرسائل' },
  { id: 'instagram', label: 'إنستجرام', emoji: '📸', color: 'from-pink-500 via-rose-500 to-orange-500', desc: 'ربط حساب إنستجرام للرسائل المباشرة' },
  { id: 'whatsapp', label: 'واتساب', emoji: '💬', color: 'from-emerald-500 to-green-600', desc: 'ربط واتساب عبر Evolution API (QR Code)' },
  { id: 'telegram', label: 'تيليجرام', emoji: '✈️', color: 'from-cyan-400 to-cyan-600', desc: 'ربط بوت تيليجرام لاستقبال الرسائل' },
];

interface FbPageInfo {
  id: string;
  name: string;
  accessToken: string;
  category?: string;
  picture?: { data: { url: string } };
}

const STATUS_BADGES: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  active: { label: 'نشط', variant: 'success' },
  pending: { label: 'بانتظار', variant: 'warning' },
  error: { label: 'خطأ', variant: 'destructive' },
  expired: { label: 'منتهي', variant: 'destructive' },
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function SettingsPage({ params: { locale } }: { params: { locale: string } }) {
  const [tab, setTab] = useState('platforms');
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Facebook form
  const [fbToken, setFbToken] = useState('');
  const [fbPageId, setFbPageId] = useState('');

  // WhatsApp form
  const [waInstance, setWaInstance] = useState('marketron');
  const [waPhone, setWaPhone] = useState('');
  const [waQR, setWaQR] = useState<string | null>(null);

  // Telegram form
  const [tgToken, setTgToken] = useState('');

  const [connecting, setConnecting] = useState<string | null>(null);
  const [fbPages, setFbPages] = useState<FbPageInfo[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  const fetchFbPages = async () => {
    setLoadingPages(true);
    try {
      const res = await fetch('/api/v1/platforms/facebook/pages');
      const data = await res.json();
      if (data.data) setFbPages(data.data);
    } catch {}
    finally { setLoadingPages(false); }
  };

  useEffect(() => {
    loadConnections();

    const params = new URLSearchParams(window.location.search);
    if (params.get('fb_success') === 'true') {
      const tokenFromUrl = params.get('fb_token');
      if (tokenFromUrl) {
        setFbToken(tokenFromUrl);
        setTimeout(() => handleConnectFacebookWithToken(tokenFromUrl), 500);
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('fb_error')) {
      setError(params.get('fb_error'));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const res = await platformsApi.list();
      const conns = res.data?.data || [];
      setConnections(conns);
      const fbConn = conns.find((c: PlatformConnection) => c.platform === 'facebook');
      if (fbConn?.status === 'active') fetchFbPages();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل التحميل');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  // ── Connect Facebook ───────────────────────────────────
  const handleConnectFacebook = async (token?: string, pageId?: string) => {
    const t = token || fbToken;
    if (!t?.trim()) return;
    setConnecting('facebook');
    setError(null);
    try {
      await platformsApi.connectFacebook(t, pageId || fbPageId || undefined);
      setFbToken('');
      setFbPageId('');
      await loadConnections();
      showSuccess('تم ربط فيسبوك بنجاح!');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل الربط');
    } finally {
      setConnecting(null);
    }
  };

  const handleConnectFacebookWithToken = async (token: string) => {
    setConnecting('facebook');
    setError(null);
    try {
      await platformsApi.connectFacebook(token, undefined);
      await loadConnections();
      showSuccess('تم ربط فيسبوك بنجاح!');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل الربط');
    } finally {
      setConnecting(null);
    }
  };

  // ── Connect WhatsApp ───────────────────────────────────
  const handleConnectWhatsApp = async () => {
    if (!waInstance.trim()) return;
    setConnecting('whatsapp');
    setError(null);
    try {
      const res = await platformsApi.connectWhatsApp(waInstance, waPhone || undefined);
      const data = res.data?.data;
      if (data?.qrCode) {
        setWaQR(data.qrCode);
      }
      await loadConnections();
      showSuccess('تم بدء ربط واتساب - امسح الـ QR code');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل الربط');
    } finally {
      setConnecting(null);
    }
  };

  // ── Get WhatsApp QR ────────────────────────────────────
  const handleGetQR = async () => {
    setConnecting('whatsapp-qr');
    try {
      const res = await platformsApi.getWhatsAppQR();
      setWaQR(res.data?.data?.qrCode || null);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل جلب QR');
    } finally {
      setConnecting(null);
    }
  };

  // ── Connect Telegram ───────────────────────────────────
  const handleConnectTelegram = async () => {
    if (!tgToken.trim()) return;
    setConnecting('telegram');
    setError(null);
    try {
      await platformsApi.connectTelegram(tgToken);
      setTgToken('');
      await loadConnections();
      showSuccess('تم ربط تيليجرام بنجاح!');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل الربط');
    } finally {
      setConnecting(null);
    }
  };

  // ── Disconnect ─────────────────────────────────────────
  const handleDisconnect = async (platform: string) => {
    if (!confirm(`هل أنت متأكد من فصل ${platform}؟`)) return;
    setConnecting(platform);
    try {
      await platformsApi.disconnect(platform);
      await loadConnections();
      showSuccess(`تم فصل ${platform} بنجاح`);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل الفصل');
    } finally {
      setConnecting(null);
    }
  };

  // ── Sync Messages ──────────────────────────────────────
  const handleSync = async (platform: string) => {
    setConnecting(`sync-${platform}`);
    setError(null);
    try {
      const res = await platformsApi.syncMessages(platform);
      showSuccess(res.data?.data?.message || 'تمت المزامنة');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل المزامنة');
    } finally {
      setConnecting(null);
    }
  };

  // ── Refresh Token ──────────────────────────────────────
  const handleRefreshToken = async (platform: string) => {
    setConnecting(`refresh-${platform}`);
    setError(null);
    try {
      const res = await platformsApi.refreshToken(platform);
      showSuccess(res.data?.data?.message || 'تم تحديث الرمز');
      await loadConnections();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل تحديث الرمز');
    } finally {
      setConnecting(null);
    }
  };

  const getConnection = (platform: string) => connections.find(c => c.platform === platform);

  return (
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-2xl font-black gradient-brand-text">الإعدادات</h1>
          <p className="text-[#A1A1C2] text-sm mt-1">إدارة حسابك ومنصاتك في MARKETRON</p>
        </div>

        {error && (
          <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#F43F5E]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="mr-auto text-[#F43F5E]/60 hover:text-[#F43F5E]">✕</button>
          </div>
        )}

        {success && (
          <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#10B981]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Tabs - horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-3 border-b border-[#7C3AED]/20">
          {[
            { id: 'platforms', label: 'المنصات', icon: LinkIcon },
            { id: 'profile', label: 'الملف الشخصي', icon: User },
            { id: 'ai-providers', label: 'مزودات الذكاء', icon: Brain },
            { id: 'ai-keys', label: 'مفاتيح API', icon: Cpu },
            { id: 'platform-tokens', label: 'توكنات الإعلانات', icon: Key },
            { id: 'facebook-inspector', label: 'فحص توكن فيسبوك', icon: Shield },
            { id: 'personas', label: 'شخصيات AI', icon: Bot },
            { id: 'billing', label: 'الرصيد والفواتير', icon: Building2 },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap',
                    tab === t.id
                      ? 'bg-gradient-to-r from-[#7C3AED]/10 to-[#06B6D4]/10 text-[#7C3AED] font-semibold'
                      : 'text-[#A1A1C2] hover:bg-[#7C3AED]/10'
                )}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Platforms Tab ── */}
        {tab === 'platforms' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
              </div>
            ) : (
              <>
                {/* Platform Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PLATFORMS.map(p => {
                    const conn = getConnection(p.id);
                    const isConnecting = connecting === p.id;
                    return (
                      <Card key={p.id} className={cn('overflow-hidden', conn && 'ring-2 ring-[#10B981]/50')}>
                        <div className={cn('h-2 bg-gradient-to-r', p.color)} />
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl', p.color)}>
                                {p.emoji}
                              </div>
                              <div>
                                <h3 className="font-bold">{p.label}</h3>
                                <p className="text-xs text-[#A1A1C2]">{p.desc}</p>
                              </div>
                            </div>
                            {conn ? (
                              <Badge variant="success" className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> مربوط
                              </Badge>
                            ) : (
                              <Badge variant="secondary">غير مربوط</Badge>
                            )}
                          </div>

                          {/* Connection details */}
                          {conn && (
                            <div className="bg-[#1E1B3A]/50 rounded-lg p-3 mb-3 text-sm space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[#A1A1C2]">الحساب:</span>
                                <span className="font-medium">{conn.platformAccountName || conn.platformAccountId}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[#A1A1C2]">الحالة:</span>
                                <Badge variant={STATUS_BADGES[conn.status]?.variant || 'secondary'} className="text-xs">
                                  {STATUS_BADGES[conn.status]?.label || conn.status}
                                </Badge>
                              </div>
                              {conn.createdAt && (
                                <div className="flex items-center justify-between">
                                  <span className="text-[#A1A1C2]">تاريخ الربط:</span>
                                  <span className="text-xs">{formatDate(conn.createdAt)}</span>
                                </div>
                              )}
                              {conn.tokenExpiresAt && (
                                <div className="flex items-center justify-between">
                                  <span className="text-[#A1A1C2]">انتهاء الرمز:</span>
                                      <span className={cn('text-xs', new Date(conn.tokenExpiresAt) < new Date() ? 'text-[#F43F5E] font-bold' : '')}>
                                    {formatDate(conn.tokenExpiresAt)}
                                  </span>
                                </div>
                              )}
                              {/* Connected Pages */}
                              {p.id === 'facebook' && conn.status === 'active' && fbPages.length > 0 && (
                                <div className="border-t border-[#7C3AED]/10 pt-2 mt-2">
                                  <p className="text-xs text-[#A1A1C2] mb-2">الصفحات المتصلة ({fbPages.length})</p>
                                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                    {fbPages.map(page => (
                                      <div key={page.id} className="flex items-center gap-2 bg-[#14102B] rounded-lg p-1.5">
                                        {page.picture?.data?.url ? (
                                          <img src={page.picture.data.url} alt="" className="w-6 h-6 rounded-full" />
                                        ) : (
                                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-[10px] text-white font-bold">
                                            {page.name?.[0]}
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium truncate">{page.name}</p>
                                          <p className="text-[10px] text-[#A1A1C2] truncate">{page.category || ''}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {p.id === 'facebook' && conn.status === 'active' && loadingPages && (
                                <div className="flex items-center gap-2 text-xs text-[#A1A1C2] py-1">
                                  <Loader2 className="w-3 h-3 animate-spin" /> جاري تحميل الصفحات...
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-2 flex-wrap">
                            {conn ? (
                              <>
                                {conn.status === 'expired' || conn.status === 'error' ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B]/10"
                                    onClick={() => handleRefreshToken(p.id)}
                                    disabled={connecting === `refresh-${p.id}`}
                                  >
                                    {connecting === `refresh-${p.id}` ? (
                                      <Loader2 className="w-3.5 h-3.5 ml-1 animate-spin" />
                                    ) : (
                                      <RefreshCw className="w-3.5 h-3.5 ml-1" />
                                    )}
                                    تحديث الرمز
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-[#7C3AED]/20"
                                    onClick={() => handleSync(p.id)}
                                    disabled={connecting === `sync-${p.id}`}
                                  >
                                    {connecting === `sync-${p.id}` ? (
                                      <Loader2 className="w-3.5 h-3.5 ml-1 animate-spin" />
                                    ) : (
                                      <RefreshCw className="w-3.5 h-3.5 ml-1" />
                                    )}
                                    مزامنة الرسائل
                                  </Button>
                                )}
                                {p.id === 'facebook' && conn.status === 'active' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#F59E0B] hover:text-[#F59E0B]/80"
                                    onClick={() => handleRefreshToken(p.id)}
                                    disabled={connecting === `refresh-${p.id}`}
                                    title="تحديث رمز الوصول"
                                  >
                                    <RefreshCw className={cn('w-3.5 h-3.5', connecting === `refresh-${p.id}` && 'animate-spin')} />
                                  </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#F43F5E] hover:text-[#F43F5E]/80"
                                  onClick={() => handleDisconnect(p.id)}
                                  disabled={isConnecting}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            ) : null}
                          </div>

                          {/* Warning for expired/error connections */}
                          {conn?.status === 'expired' && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-[#F59E0B] bg-[#F59E0B]/10 rounded-lg p-2">
                              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                              انتهت صلاحية الرمز. اضغط "تحديث الرمز" لتجديده.
                            </div>
                          )}
                          {conn?.status === 'error' && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-[#F43F5E] bg-[#F43F5E]/10 rounded-lg p-2">
                              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                              الرمز غير صالح. اربط الحساب مجدداً.
                            </div>
                          )}

                          {/* Facebook connect form */}
                          {p.id === 'facebook' && !conn && (
                            <div className="mt-3 space-y-2 border-t pt-3">
                              <Input
                                placeholder="Page Access Token"
                                value={fbToken}
                                onChange={e => setFbToken(e.target.value)}
                                className="text-xs"
                              />
                              <Input
                                placeholder="Page ID (اختياري)"
                                value={fbPageId}
                                onChange={e => setFbPageId(e.target.value)}
                                className="text-xs"
                              />
      <Button
          size="sm"
          className="w-full gradient-brand text-white border-0"
          onClick={() => handleConnectFacebook()}
          disabled={isConnecting || !fbToken.trim()}
        >
          {isConnecting ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Facebook className="w-4 h-4 ml-1" />}
          ربط فيسبوك
                              </Button>
                              <p className="text-[10px] text-[#A1A1C2] text-center">
                                احصل على Token من Facebook Developers → Graph API Explorer
                              </p>
                            </div>
                          )}

                          {/* WhatsApp connect form */}
                          {p.id === 'whatsapp' && !conn && (
                            <div className="mt-3 space-y-2 border-t pt-3">
                              <Input
                                placeholder="اسم Instance (مثال: marketron)"
                                value={waInstance}
                                onChange={e => setWaInstance(e.target.value)}
                                className="text-xs"
                              />
                              <Input
                                placeholder="رقم الهاتف (اختياري)"
                                value={waPhone}
                                onChange={e => setWaPhone(e.target.value)}
                                className="text-xs"
                              />
                              <Button
                                size="sm"
                                className="w-full gradient-brand text-white border-0"
                                onClick={handleConnectWhatsApp}
                                disabled={isConnecting || !waInstance.trim()}
                              >
                                {isConnecting ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <MessageCircle className="w-4 h-4 ml-1" />}
                                ربط واتساب
                              </Button>
                            </div>
                          )}

                          {/* WhatsApp QR display */}
                          {p.id === 'whatsapp' && conn && waQR && (
                            <div className="mt-3 border-t pt-3 text-center">
                              <p className="text-xs text-[#A1A1C2] mb-2">امسح الـ QR code بواسطة واتساب:</p>
                              {waQR.startsWith('data:') || waQR.startsWith('http') ? (
                                <img src={waQR} alt="WhatsApp QR" className="mx-auto rounded-lg w-full max-w-[200px] sm:max-w-[250px] h-auto" />
                              ) : (
                                  <div className="bg-[#1E1B3A] p-4 rounded-lg inline-block max-w-full overflow-x-auto">
                                    <pre className="text-xs text-[#A1A1C2] whitespace-pre-wrap break-all">{waQR}</pre>
                                  </div>
                              )}
                            </div>
                          )}

                          {p.id === 'whatsapp' && conn && (
                            <div className="mt-2 flex flex-col sm:flex-row gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={handleGetQR}
                                disabled={connecting === 'whatsapp-qr'}
                              >
                                {connecting === 'whatsapp-qr' ? (
                                  <Loader2 className="w-3.5 h-3.5 ml-1 animate-spin" />
                                ) : (
                                  <QrCode className="w-3.5 h-3.5 ml-1" />
                                )}
                                عرض QR Code
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={async () => {
                                  setConnecting('whatsapp-qr');
                                  try {
                                    const res = await fetch('/api/v1/platforms/whatsapp/qr?checkonly=true');
                                    const data = await res.json();
                                    const instanceStatus = data?.data?.instanceStatus || 'unknown';
                                    setConnections(prev => prev.map(c =>
                                      c.platform === 'whatsapp'
                                        ? { ...c, status: instanceStatus === 'open' ? 'connected' : c.status }
                                        : c
                                    ));
                                  } catch {}
                                  finally { setConnecting(null); }
                                }}
                                disabled={connecting === 'whatsapp-qr'}
                              >
                                <RefreshCw className="w-3.5 h-3.5 ml-1" />
                                التحقق من الحالة
                              </Button>
                            </div>
                          )}

                          {/* Telegram connect form */}
                          {p.id === 'telegram' && !conn && (
                            <div className="mt-3 space-y-2 border-t pt-3">
                              <Input
                                placeholder="Bot Token (من @BotFather)"
                                value={tgToken}
                                onChange={e => setTgToken(e.target.value)}
                                className="text-xs"
                              />
                              <Button
                                size="sm"
                                className="w-full gradient-brand text-white border-0"
                                onClick={handleConnectTelegram}
                                disabled={isConnecting || !tgToken.trim()}
                              >
                                {isConnecting ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Send className="w-4 h-4 ml-1" />}
                                ربط تيليجرام
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Profile Tab ── */}
        {tab === 'profile' && <ProfileTab />}

        {/* ── AI Providers Tab ── */}
        {tab === 'ai-providers' && <AiProvidersTab />}

        {/* ── AI Keys (BYOK) Tab ── */}
        {tab === 'ai-keys' && <AiKeysTab />}

        {/* ── Platform Tokens Tab ── */}
        {tab === 'platform-tokens' && <PlatformTokensTab />}

        {/* ── Facebook Token Inspector Tab ── */}
        {tab === 'facebook-inspector' && <FacebookInspectorTab />}

        {/* ── Personas Tab ── */}
        {tab === 'personas' && <PersonasTab />}

        {/* ── Billing Tab ── */}
        {tab === 'billing' && (
          <BillingTab />
        )}
      </div>
  );
}

