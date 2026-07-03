'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageCircle, Search, Send, Plus, CheckCheck, MoreHorizontal, Bot, Pin,
  Filter, Users, RefreshCw, Loader2, AlertCircle, X, QrCode, Wifi,
  WifiOff, Phone, Mail, Clock, Star, Smartphone, Check,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AiReplyPanel } from '@/components/social/AiReplyPanel';
import { CustomerPanel } from '@/components/social/CustomerPanel';
import {
  PLATFORM_META, CUSTOMER_STATUS_META,
  type PlatformKey, type ConversationThread, type Customer, type CustomerStatus,
} from '@/types/social';
import { socialApi } from '@/services/socialApi';

interface BackendMessage {
  id: string;
  inboxId: string;
  platform: PlatformKey;
  direction: 'inbound' | 'outbound';
  status: 'unread' | 'read' | 'replied';
  senderName: string;
  senderId: string;
  phoneNumber?: string;
  messageText: string;
  mediaUrl?: string;
  replyFromAi: boolean;
  aiReplyText?: string;
  createdAt: string;
  metadata?: string;
  inbox?: { name: string; platform: string };
}

interface BackendInbox {
  id: string;
  name: string;
  platform: PlatformKey;
  phoneNumber?: string;
  platformAccountId?: string;
  isActive: boolean;
  webhookToken?: string;
  _count?: { messages: number };
  whatsAppSessions?: Array<{ status: string; qrCode: string | null }>;
}

const avatarColors = [
  'from-[#7C3AED] to-[#06B6D4]',
  'from-[#06B6D4] to-[#7C3AED]',
  'from-[#7C3AED] to-[#8B5CF6]',
  'from-[#7C3AED] to-[#7C3AED]',
  'from-blue-500 to-[#7C3AED]',
];

function getInitial(name: string) {
  return name?.charAt(0).toUpperCase() || '؟';
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
}

function buildThreads(messages: BackendMessage[]): ConversationThread[] {
  const groups = new Map<string, BackendMessage[]>();
  for (const msg of messages) {
    const key = `${msg.platform}:${msg.senderId || msg.phoneNumber || 'unknown'}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(msg);
  }

  const threads: ConversationThread[] = [];
  for (const [key, msgs] of groups) {
    msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const last = msgs[msgs.length - 1];
    const firstInbound = msgs.find(m => m.direction === 'inbound');
    const senderName = last.senderName || firstInbound?.senderName || 'عميل';
    const unread = msgs.filter(m => m.direction === 'inbound' && m.status === 'unread').length;
    const platform = last.platform;

    threads.push({
      id: key,
      customerId: key,
      customerName: senderName,
      customerInitial: getInitial(senderName),
      customerAvatarColor: getAvatarColor(senderName),
      platform,
      lastMessage: last.messageText || '(رسالة وسائط)',
      lastMessageTime: formatTime(last.createdAt),
      unread,
      status: unread > 0 ? 'unread' : last.status === 'replied' ? 'replied' : 'read',
      pinned: false,
      messages: msgs.map(m => ({
        id: m.id,
        direction: m.direction,
        sender: m.direction === 'inbound' ? m.senderName : m.replyFromAi ? 'MARKETRON Bot' : 'أنت',
        text: m.messageText || '(رسالة وسائط)',
        time: formatTime(m.createdAt),
        status: m.status === 'read' ? 'read' : m.direction === 'outbound' ? 'sent' : 'delivered',
        kind: m.mediaUrl ? 'image' : 'text',
      })),
    });
  }

  return threads.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });
}

function buildCustomers(messages: BackendMessage[]): Customer[] {
  const seen = new Map<string, Customer>();
  for (const msg of messages) {
    const key = `${msg.platform}:${msg.senderId || msg.phoneNumber || 'unknown'}`;
    if (!seen.has(key)) {
      seen.set(key, {
        id: key,
        name: msg.senderName || 'عميل',
        initial: getInitial(msg.senderName || 'عميل'),
        avatarColor: getAvatarColor(msg.senderName || 'عميل'),
        status: 'new',
        platform: msg.platform,
        phone: msg.phoneNumber,
        notes: '',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
  return Array.from(seen.values());
}

const SocialInboxPage: React.FC = () => {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';

  const [messages, setMessages] = useState<BackendMessage[]>([]);
  const [inboxes, setInboxes] = useState<BackendInbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<PlatformKey | 'all'>('all');
  const [query, setQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [showCustomerPanel, setShowCustomerPanel] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [whatsAppStatus, setWhatsAppStatus] = useState<string>('disconnected');
  const [qrLoading, setQrLoading] = useState(false);
  const [whatsAppInboxId, setWhatsAppInboxId] = useState<string | null>(null);

  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const threads = useMemo(() => buildThreads(messages), [messages]);
  const selectedThread = threads.find(t => t.id === selectedThreadId) || null;
  const selectedCustomer = selectedThread
    ? customers.find(c => c.id === selectedThread.customerId) || null
    : null;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [msgRes, inboxRes] = await Promise.all([
        socialApi.listMessages({ limit: 200 }),
        socialApi.listInboxes(),
      ]);
      const msgs: BackendMessage[] = msgRes.data?.messages || [];
      setMessages(msgs);
      setInboxes(inboxRes.data?.data || []);
      setCustomers(buildCustomers(msgs));
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.hostname}:8000/ws/social/`;
      setWsStatus('connecting');
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => setWsStatus('connected');
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_message' || data.type === 'message_update') {
            fetchData();
          }
          if (data.type === 'typing') {
            setTypingStatus(prev => ({ ...prev, [data.senderId]: data.isTyping }));
          }
        } catch { /* ignore parse errors */ }
      };
      ws.onclose = () => {
        setWsStatus('disconnected');
        setTimeout(connectWebSocket, 5000);
      };
      ws.onerror = () => ws.close();
      wsRef.current = ws;
    } catch { setWsStatus('disconnected'); }
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => { wsRef.current?.close(); };
  }, [connectWebSocket]);

  const connectedPlatforms = useMemo(() => {
    const set = new Set(inboxes.map(i => i.platform));
    return Array.from(set) as PlatformKey[];
  }, [inboxes]);

  const hasWhatsApp = useMemo(() => inboxes.some(i => i.platform === 'whatsapp'), [inboxes]);

  const totalUnread = threads.reduce((n, t) => n + t.unread, 0);

  const filteredThreads = useMemo(() => {
    let list = threads;
    if (platformFilter !== 'all') list = list.filter(t => t.platform === platformFilter);
    if (query.trim()) {
      const q = query.trim();
      list = list.filter(t => t.customerName.includes(q) || t.lastMessage.includes(q));
    }
    return [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [threads, platformFilter, query]);

  const lastInbound = useMemo(() => {
    if (!selectedThread) return '';
    for (let i = selectedThread.messages.length - 1; i >= 0; i--) {
      if (selectedThread.messages[i].direction === 'inbound') return selectedThread.messages[i].text;
    }
    return selectedThread.lastMessage;
  }, [selectedThread]);

  const handleSendReply = async (text: string) => {
    if (!selectedThread || !text.trim()) return;
    const lastInboundMsg = messages
      .filter(m => m.platform === selectedThread.platform && (m.senderId || m.phoneNumber))
      .slice(-1)[0];
    if (!lastInboundMsg) return;

    try {
      await socialApi.sendReply(lastInboundMsg.id, { text });
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل إرسال الرد');
    }
    setReplyText('');
  };

  const handleStatusChange = (customerId: string, status: CustomerStatus) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, status, updatedAt: new Date().toISOString() } : c));
  };

  const handleSaveNotes = (customerId: string, notes: string) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, notes, updatedAt: new Date().toISOString() } : c));
  };

  const togglePin = (_threadId: string) => {};

  const markAsRead = async (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return;
    const unreadMsg = messages.find(
      m => m.direction === 'inbound' && m.status === 'unread' &&
        `${m.platform}:${m.senderId || m.phoneNumber || 'unknown'}` === threadId
    );
    if (unreadMsg) {
      try {
        await socialApi.markAsRead(unreadMsg.id);
        await fetchData();
      } catch {}
    }
  };

  const openQRModal = async () => {
    const waInbox = inboxes.find(i => i.platform === 'whatsapp');
    if (!waInbox) return;
    setWhatsAppInboxId(waInbox.id);
    setShowQRModal(true);
    setQrLoading(true);
    try {
      const res = await socialApi.generateWhatsAppQR(waInbox.id);
      const qr = res.data?.qrCodeUrl || res.data?.data?.qrCode || res.data?.qrCode || null;
      if (qr && (qr.startsWith('data:') || qr.startsWith('http'))) {
        setQrCodeUrl(qr);
      } else if (qr) {
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
      } else {
        setQrCodeUrl(null);
      }
      setWhatsAppStatus(qr ? 'pending' : 'disconnected');
    } catch {
      setError('فشل إنشاء رمز QR للواتساب');
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    if (!showQRModal || !whatsAppInboxId) return;
    statusIntervalRef.current = setInterval(async () => {
      try {
        const res = await socialApi.getWhatsAppStatus(whatsAppInboxId);
        const status = res.data?.data?.status || res.data?.status || 'disconnected';
        setWhatsAppStatus(status);
        if (status === 'connected') {
          setQrCodeUrl(null);
        }
      } catch {}
    }, 3000);
    return () => { if (statusIntervalRef.current) clearInterval(statusIntervalRef.current); };
  }, [showQRModal, whatsAppInboxId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-white/60" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-white/60" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-[#06B6D4]" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-l from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">
            صندوق الرسائل الموحد
          </h1>
          <p className="text-sm text-[#A1A1C2] mt-1">
            {connectedPlatforms.length} منصات مربوطة · {totalUnread} رسالة غير مقروءة · {customers.length} عميل في منظومة CRM
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={cn(
            'flex items-center gap-2 text-[11px] px-3 py-1 rounded-full border transition-all',
            wsStatus === 'connected'
              ? 'text-[#10B981] bg-[#10B981]/5 border-[#10B981]/20'
              : 'text-[#F43F5E] bg-[#F43F5E]/5 border-[#F43F5E]/20'
          )}>
            <span className={cn(
              'w-1.5 h-1.5 rounded-full',
              wsStatus === 'connected' ? 'bg-[#10B981] animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-[#F43F5E]'
            )} />
            {wsStatus === 'connected' ? 'مباشر' : wsStatus === 'connecting' ? 'جاري الاتصال...' : 'غير متصل'}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#A1A1C2] bg-[#1E1B3A] px-3 py-1 rounded-full border border-[#7C3AED]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse shadow-[0_0_6px_rgba(124,58,237,0.5)]" />
            {lastUpdated
              ? `آخر تحديث: ${lastUpdated.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`
              : 'مباشر'}
          </div>
          <Button size="sm" variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4 ml-1', loading && 'animate-spin')} />
            تحديث
          </Button>
          <div className="flex gap-1 overflow-x-auto max-w-[400px] scrollbar-thin">
            <button
              onClick={() => setPlatformFilter('all')}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap',
                platformFilter === 'all'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white border-transparent font-medium shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                  : 'bg-[#14102B] border-[#7C3AED]/20 hover:border-[#7C3AED] text-[#A1A1C2]'
              )}
            >
              <Filter className="w-3 h-3 inline ml-1" />
              الكل ({threads.length})
            </button>
            {connectedPlatforms.map((platform) => {
              const meta = PLATFORM_META[platform];
              const count = threads.filter(t => t.platform === platform).length;
              return (
                <button
                  key={platform}
                  onClick={() => setPlatformFilter(platform)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 whitespace-nowrap',
                    platformFilter === platform
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white border-transparent font-medium shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                      : 'bg-[#14102B] border-[#7C3AED]/20 hover:border-[#7C3AED] text-[#A1A1C2]'
                  )}
                >
                  <span>{meta.emoji}</span>
                  {meta.label}
                  {count > 0 && <span className="opacity-70">({count})</span>}
                </button>
              );
            })}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCustomerPanel(!showCustomerPanel)}
            title="إظهار/إخفاء بيانات العميل"
            className={cn(showCustomerPanel && 'border-[#7C3AED] bg-[#7C3AED]/10')}
          >
            <Users className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#F43F5E]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="hover:text-[#F43F5E]/80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main layout */}
      <div
        className="flex rounded-2xl overflow-hidden border border-[#7C3AED]/20 bg-[#14102B]/80 backdrop-blur-sm shadow-[0_0_30px_rgba(124,58,237,0.05)]"
        style={{ height: 'calc(100vh - 220px)' }}
      >
        {/* Left panel - Threads */}
        <div className="w-[320px] flex-shrink-0 border-l border-[#7C3AED]/20 flex flex-col bg-[#0B0A1A]/60">
          <div className="p-3 border-b border-[#7C3AED]/10">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1C2]/40" />
              <Input
                placeholder="بحث في المحادثات..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-9 bg-[#14102B]/60 border-[#7C3AED]/10 focus:border-[#7C3AED]/30 text-sm"
                dir="rtl"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {loading && threads.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED] mx-auto" />
                  <p className="text-xs text-[#A1A1C2]/60 mt-2">جاري التحميل...</p>
                </div>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-6">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#14102B] border border-[#7C3AED]/10 mx-auto mb-3 flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-[#2D2B55]" />
                  </div>
                  <p className="text-sm text-[#A1A1C2]/60">لا توجد محادثات مطابقة</p>
                  {query && (
                    <p className="text-xs text-[#A1A1C2]/40 mt-1">جرب بحثاً آخر</p>
                  )}
                </div>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const meta = PLATFORM_META[thread.platform];
                const isSelected = thread.id === selectedThreadId;
                const isOnline = typingStatus[thread.customerId] === true;
                return (
                  <button
                    key={thread.id}
                    onClick={() => { setSelectedThreadId(thread.id); markAsRead(thread.id); }}
                    className={cn(
                      'w-full text-right p-3 border-b border-[#7C3AED]/5 transition-all duration-200 relative group',
                      isSelected
                        ? 'bg-gradient-to-l from-[#7C3AED]/15 via-[#7C3AED]/5 to-transparent border-r-2 border-r-[#7C3AED] shadow-[inset_0_0_20px_rgba(124,58,237,0.05)]'
                        : 'hover:bg-[#7C3AED]/5 hover:border-r-[#7C3AED]/30'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className={cn(
                          'w-11 h-11 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-lg',
                          thread.customerAvatarColor
                        )}>
                          {thread.customerInitial}
                        </div>
                        {isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#0B0A1A] shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-[#F5F3FF] truncate flex items-center gap-1">
                            {thread.customerName}
                            {thread.pinned && <Pin className="w-3 h-3 text-[#7C3AED]" />}
                          </span>
                          <span className="text-[11px] text-[#A1A1C2]/60 flex-shrink-0 font-mono">{thread.lastMessageTime}</span>
                        </div>
                        <p className="text-xs text-[#A1A1C2]/60 truncate mt-0.5 text-right">{thread.lastMessage}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={cn('inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full', meta.color, meta.bg)}>
                            {meta.emoji} {meta.label}
                          </span>
                          {thread.unread > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold shadow-[0_0_12px_rgba(124,58,237,0.4)] animate-pulse">
                              {thread.unread}
                            </span>
                          )}
                          {thread.status === 'replied' && (
                            <span className="text-[10px] text-[#10B981] flex items-center gap-0.5">
                              <CheckCheck className="w-3 h-3" /> تم الرد
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-[#7C3AED]/10 space-y-2">
            {!hasWhatsApp && (
              <Button
                variant="outline"
                className="w-full border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10 hover:border-[#10B981]/50 transition-all text-xs"
                onClick={openQRModal}
              >
                <Smartphone className="w-4 h-4 ml-2" />
                ربط واتساب
              </Button>
            )}
            <Link href={`/${locale}/dashboard/settings`}>
              <Button variant="outline" className="w-full border-[#7C3AED]/20 hover:border-[#7C3AED]/50 text-[#A1A1C2] transition-all text-xs">
                <Plus className="w-4 h-4 ml-2" />
                ربط منصة جديدة
              </Button>
            </Link>
          </div>
        </div>

        {/* Center panel - Chat */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0B0A1A]">
          {selectedThread ? (
            <>
              <div className="p-4 border-b border-[#7C3AED]/10 bg-[#14102B]/40 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={cn('w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold shadow-lg', selectedThread.customerAvatarColor)}>
                      {selectedThread.customerInitial}
                    </div>
                    <span className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0B0A1A]',
                      selectedThread.status === 'unread' ? 'bg-[#7C3AED] shadow-[0_0_6px_rgba(124,58,237,0.5)]' :
                      selectedThread.status === 'replied' ? 'bg-[#10B981]' : 'bg-gray-500'
                    )} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#F5F3FF]">{selectedThread.customerName}</p>
                    <p className="text-xs text-[#A1A1C2] flex items-center gap-1">
                      {PLATFORM_META[selectedThread.platform].emoji}
                      {PLATFORM_META[selectedThread.platform].label}
                      {typingStatus[selectedThread.customerId] && (
                        <span className="text-[#10B981] mr-1">يكتب...</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="text-[#A1A1C2] hover:text-white hover:bg-[#7C3AED]/20" onClick={() => markAsRead(selectedThread.id)} title="تحديد كمقروء">
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-[#A1A1C2] hover:text-white hover:bg-[#7C3AED]/20" title="خيارات إضافية">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin" dir="rtl">
                {selectedThread.messages.map((msg) => (
                  <div key={msg.id} className={cn('flex', msg.direction === 'inbound' ? 'justify-start' : 'justify-end')}>
                    <div className={cn(
                      'max-w-[75%] px-4 py-2.5 rounded-2xl transition-all duration-200',
                      msg.direction === 'inbound'
                        ? 'bg-[#14102B] text-[#E8E6F0] rounded-tr-sm shadow-sm border border-[#7C3AED]/5'
                        : (msg.sender === 'MARKETRON Bot'
                            ? 'bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] text-white rounded-tl-sm shadow-[0_0_15px_rgba(124,58,237,0.15)]'
                            : 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white rounded-tl-sm shadow-[0_0_15px_rgba(124,58,237,0.2)]')
                    )}>
                      {msg.sender === 'MARKETRON Bot' && (
                        <div className="flex items-center gap-1 text-[10px] opacity-80 mb-1 bg-white/10 rounded-full px-2 py-0.5 w-fit">
                          <Bot className="w-3 h-3" />
                          <span>رد آلي</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                      <div className={cn(
                        'flex items-center gap-1 mt-1.5 text-[10px]',
                        msg.direction === 'outbound' ? 'justify-end text-white/70' : 'text-[#A1A1C2]/60'
                      )}>
                        <span>{msg.time}</span>
                        {msg.direction === 'outbound' && (
                          <span className="inline-flex">
                            {getStatusIcon(msg.status)}
                          </span>
                        )}
                        {msg.direction === 'inbound' && msg.status === 'read' && (
                          <span className="text-[#06B6D4]">مقروءة</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <AiReplyPanel lastInbound={lastInbound} onSend={handleSendReply} />

              <div className="p-3 border-t border-[#7C3AED]/10 bg-[#14102B]/40 backdrop-blur-sm">
                <div className="flex gap-2">
                  <Input
                    placeholder="اكتب رسالتك أو اختر رد ذكي من الأعلى..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(replyText); } }}
                    className="flex-1 bg-[#0B0A1A] border-[#7C3AED]/10 focus:border-[#7C3AED]/30 text-sm text-[#F5F3FF]"
                    dir="rtl"
                  />
                  <Button
                    onClick={() => handleSendReply(replyText)}
                    disabled={!replyText.trim()}
                    className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white border-0 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-200"
                  >
                    <Send className="w-4 h-4 ml-1" />
                    إرسال
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <p className="font-semibold text-[#F5F3FF] text-lg">مرحباً بك في صندوق MARKETRON</p>
                <p className="text-sm text-[#A1A1C2]/60 mt-2 max-w-sm">
                  اختر محادثة من اليمين للبدء، أو ربط منصتك من الإعدادات.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right panel - Customer */}
        {showCustomerPanel && (
          <CustomerPanel customer={selectedCustomer} onStatusChange={handleStatusChange} onSaveNotes={handleSaveNotes} />
        )}
      </div>

      {/* WhatsApp QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowQRModal(false)}>
          <div
            className="bg-[#14102B] border border-[#7C3AED]/20 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-[0_0_50px_rgba(124,58,237,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#F5F3FF] flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#10B981]" />
                ربط واتساب
              </h3>
              <button onClick={() => setShowQRModal(false)} className="text-[#A1A1C2] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center">
              {qrLoading ? (
                <div className="py-12">
                  <Loader2 className="w-10 h-10 animate-spin text-[#7C3AED] mx-auto" />
                  <p className="text-sm text-[#A1A1C2] mt-3">جاري إنشاء رمز QR...</p>
                </div>
              ) : whatsAppStatus === 'connected' ? (
                <div className="py-8">
                  <div className="w-16 h-16 rounded-full bg-[#10B981]/20 mx-auto mb-4 flex items-center justify-center">
                    <Check className="w-8 h-8 text-[#10B981]" />
                  </div>
                  <p className="text-lg font-bold text-[#10B981]">متصل بنجاح</p>
                  <p className="text-sm text-[#A1A1C2] mt-1">واتساب متصل وجاهز للاستخدام</p>
                </div>
              ) : qrCodeUrl ? (
                <>
                  <div className="bg-white p-3 rounded-xl inline-block mb-4 shadow-lg">
                    <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-sm text-[#A1A1C2] mb-2">امسح رمز QR باستخدام واتساب</p>
                  <div className={cn(
                    'inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full',
                    whatsAppStatus === 'pending'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/30'
                  )}>
                    <WifiOff className="w-3 h-3" />
                    {whatsAppStatus === 'pending' ? 'بانتظار الاتصال...' : 'غير متصل'}
                  </div>
                </>
              ) : (
                <div className="py-8">
                  <div className="w-16 h-16 rounded-full bg-[#F43F5E]/20 mx-auto mb-4 flex items-center justify-center">
                    <WifiOff className="w-8 h-8 text-[#F43F5E]" />
                  </div>
                  <p className="text-sm text-[#A1A1C2]">فشل إنشاء رمز QR</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 border-[#7C3AED]/30 text-[#7C3AED]"
                    onClick={openQRModal}
                  >
                    إعادة المحاولة
                  </Button>
                </div>
              )}
            </div>

            {whatsAppStatus === 'connected' && (
              <Button
                className="w-full mt-4 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white border-0"
                onClick={() => setShowQRModal(false)}
              >
                تم
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { SocialInboxPage }; export default SocialInboxPage;
