'use client';

import React, { useEffect, useState } from 'react';
import {
  User, Mail, Phone, Building2, Loader2, AlertCircle, Save, Plus, Trash2,
  Link as LinkIcon, CheckCircle2, RefreshCw, MessageCircle, QrCode, Facebook, Instagram, Send, AlertTriangle, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { platformsApi, type PlatformConnection } from '@/services/api-modules';
import { cn } from '@/lib/utils';

const PLATFORMS = [
  { id: 'facebook', label: 'فيسبوك', emoji: '📘', color: 'from-blue-600 to-blue-800', desc: 'ربط صفحة فيسبوك لاستقبال وإرسال الرسائل' },
  { id: 'instagram', label: 'إنستجرام', emoji: '📸', color: 'from-pink-500 via-rose-500 to-orange-500', desc: 'ربط حساب إنستجرام للرسائل المباشرة' },
  { id: 'whatsapp', label: 'واتساب', emoji: '💬', color: 'from-emerald-500 to-green-600', desc: 'ربط واتساب عبر Evolution API (QR Code)' },
  { id: 'telegram', label: 'تيليجرام', emoji: '✈️', color: 'from-cyan-400 to-cyan-600', desc: 'ربط بوت تيليجرام لاستقبال الرسائل' },
];

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

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      window.location.href = '/ar/auth/login';
      return;
    }
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const res = await platformsApi.list();
      setConnections(res.data?.data || []);
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
  const handleConnectFacebook = async () => {
    if (!fbToken.trim()) return;
    setConnecting('facebook');
    setError(null);
    try {
      await platformsApi.connectFacebook(fbToken, fbPageId || undefined);
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
    <DashboardShell>
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

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap border-b border-[#7C3AED]/20 pb-3">
          {[
            { id: 'platforms', label: 'المنصات', icon: LinkIcon },
            { id: 'profile', label: 'الملف الشخصي', icon: User },
            { id: 'billing', label: 'الرصيد والفواتير', icon: Building2 },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all',
                    tab === t.id
                      ? 'bg-gradient-to-r from-[#7C3AED]/10 to-[#06B6D4]/10 text-[#7C3AED] font-semibold'
                      : 'text-[#A1A1C2] hover:bg-[#7C3AED]/10'
                )}
              >
                <Icon size={16} />
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
                                onClick={handleConnectFacebook}
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
                                <img src={waQR} alt="WhatsApp QR" className="mx-auto rounded-lg" style={{ maxWidth: 250 }} />
                              ) : (
                                  <div className="bg-[#1E1B3A] p-4 rounded-lg inline-block">
                                    <pre className="text-xs text-[#A1A1C2]">{waQR}</pre>
                                  </div>
                              )}
                            </div>
                          )}

                          {p.id === 'whatsapp' && conn && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mt-2"
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

        {/* ── Billing Tab ── */}
        {tab === 'billing' && (
          <BillingTab />
        )}
      </div>
    </DashboardShell>
  );
}

// ── Profile Component ────────────────────────────────────
function ProfileTab() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const api = (await import('@/services/api')).default;
        const res = await api.get('/auth/me');
        const u = res.data?.data || res.data;
        setName(u.name || '');
        setPhone(u.phone || '');
        setCompany(u.company || '');
        setEmail(u.email || '');
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const api = (await import('@/services/api')).default;
      const res = await api.put('/auth/me', { name, phone, company });
      if (res.data?.success || res.status === 200) {
        setSuccess('تم حفظ التغييرات بنجاح');
        setTimeout(() => setSuccess(null), 4000);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل حفظ التغييرات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-electric" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">المعلومات الشخصية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#F43F5E]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}
        {success && (
          <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#10B981]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{success}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>الاسم</Label>
            <Input placeholder="اسمك الكامل" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>البريد الإلكتروني</Label>
            <Input placeholder="email@example.com" value={email} disabled />
          </div>
          <div>
            <Label>رقم الجوال</Label>
            <Input placeholder="+966 5X XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>اسم الشركة</Label>
            <Input placeholder="اسم شركتك" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
        </div>
        <Button className="gradient-brand text-white border-0" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Save className="w-4 h-4 ml-1" />}
          حفظ التغييرات
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Billing Component ────────────────────────────────────
function BillingTab() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const api = (await import('@/services/api')).default;
      const res = await api.get('/auth/credits/balance');
      setBalance(res.data?.data?.balance || 0);
    } catch {
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (amount: number) => {
    setPurchasing(true);
    try {
      const api = (await import('@/services/api')).default;
      const res = await api.post('/auth/credits/purchase', { amount });
      setBalance(res.data?.data?.balance || (balance ?? 0) + amount);
    } catch {
      // ignore
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-electric" /></div>;

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card className="bg-gradient-to-br from-[#7C3AED]/5 via-transparent to-[#06B6D4]/5">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-[#A1A1C2] mb-2">رصيدك الحالي</p>
          <p className="text-5xl font-black gradient-brand-text mb-4">{balance ?? 0}</p>
          <p className="text-xs text-[#A1A1C2]">توكن (1 توكن = 1 عملية ذكاء اصطناعي)</p>
        </CardContent>
      </Card>

      {/* Purchase Packages */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { amount: 100, price: '$5', label: '100 توكن' },
          { amount: 500, price: '$20', label: '500 توكن', popular: true },
          { amount: 1000, price: '$35', label: '1000 توكن' },
          { amount: 5000, price: '$150', label: '5000 توكن' },
        ].map(pkg => (
          <Card key={pkg.amount} className={cn('text-center relative', pkg.popular && 'ring-2 ring-[#7C3AED]')}>
            {pkg.popular && (
              <div className="absolute -top-2 right-1/2 translate-x-1/2">
                <Badge className="text-xs">الأفضل قيمة</Badge>
              </div>
            )}
            <CardContent className="p-4">
              <p className="font-bold text-lg mb-1">{pkg.label}</p>
              <p className="text-2xl font-black gradient-brand-text mb-3">{pkg.price}</p>
              <Button
                size="sm"
                className="w-full gradient-brand text-white border-0"
                onClick={() => handlePurchase(pkg.amount)}
                disabled={purchasing}
              >
                {purchasing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'شراء'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
