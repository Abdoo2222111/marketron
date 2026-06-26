'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  MessageCircle, Search, Send, Plus, CheckCheck, MoreHorizontal, Bot, Pin,
  Filter, Users, RefreshCw, Loader2, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/helpers';
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
  'from-electric to-cyan',
  'from-cyan to-purple',
  'from-purple to-violet',
  'from-electric to-purple',
  'from-blue-500 to-electric',
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

export const SocialInboxPage: React.FC = () => {
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
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const connectedPlatforms = useMemo(() => {
    const set = new Set(inboxes.map(i => i.platform));
    return Array.from(set) as PlatformKey[];
  }, [inboxes]);

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

  const togglePin = (threadId: string) => {
    // local only until backend supports pin
  };

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

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-black gradient-brand-text">صندوق الرسائل الموحد</h1>
          <p className="text-sm text-gray-500 mt-1">
            {connectedPlatforms.length} منصات مربوطة · {totalUnread} رسالة غير مقروءة · {customers.length} عميل في منظومة CRM
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4 ml-1', loading && 'animate-spin')} />
            تحديث
          </Button>
          <button
            onClick={() => setPlatformFilter('all')}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border transition-all',
              platformFilter === 'all'
                ? 'bg-gradient-to-r from-electric to-cyan text-white border-transparent font-medium'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-electric'
            )}
          >
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
                  'text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5',
                  platformFilter === platform
                    ? 'bg-gradient-to-r from-electric to-cyan text-white border-transparent font-medium'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-electric'
                )}
              >
                <span>{meta.emoji}</span>
                {meta.label}
                {count > 0 && <span className="opacity-70">({count})</span>}
              </button>
            );
          })}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCustomerPanel(!showCustomerPanel)}
            title="إظهار/إخفاء بيانات العميل"
          >
            <Users className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-300">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Main Inbox layout */}
      <div className="flex rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Threads List */}
        <div className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800">
            <Input
              placeholder="بحث في المحادثات..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<Search className="w-4 h-4 opacity-40" />}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && threads.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-electric" />
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex-1 h-full flex items-center justify-center text-center p-6">
                <div>
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                  <p className="text-sm text-gray-400">لا توجد محادثات مطابقة</p>
                </div>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const meta = PLATFORM_META[thread.platform];
                const isSelected = thread.id === selectedThreadId;
                return (
                  <button
                    key={thread.id}
                    onClick={() => { setSelectedThreadId(thread.id); markAsRead(thread.id); }}
                    className={cn(
                      'w-full text-right p-3 border-b border-gray-100 dark:border-gray-800 transition-all',
                      isSelected
                        ? 'bg-gradient-to-l from-electric/10 to-transparent dark:from-electric/20 border-r-2 border-r-electric'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('w-11 h-11 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm flex-shrink-0', thread.customerAvatarColor)}>
                        {thread.customerInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate flex items-center gap-1">
                            {thread.customerName}
                            {thread.pinned && <Pin className="w-3 h-3 text-electric" />}
                          </span>
                          <span className="text-[11px] text-gray-400 flex-shrink-0">{thread.lastMessageTime}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{thread.lastMessage}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={cn('inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full', meta.color, meta.bg)}>
                            {meta.label}
                          </span>
                          {thread.unread > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-electric to-cyan text-white font-medium">
                              {thread.unread}
                            </span>
                          )}
                          {thread.status === 'replied' && <span className="text-[10px] text-emerald-500">✓ تم الرد</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
            <Link href="/ar/dashboard/settings">
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 ml-2" />
                ربط منصة جديدة
              </Button>
            </Link>
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950">
          {selectedThread ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold', selectedThread.customerAvatarColor)}>
                    {selectedThread.customerInitial}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedThread.customerName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span className={cn('w-1.5 h-1.5 rounded-full', selectedThread.status === 'unread' ? 'bg-electric' : selectedThread.status === 'replied' ? 'bg-emerald-500' : 'bg-gray-300')} />
                      {PLATFORM_META[selectedThread.platform].label} · {selectedThread.lastMessageTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => togglePin(selectedThread.id)} title="تثبيت">
                    <Pin className={cn('w-4 h-4', selectedThread.pinned && 'text-electric fill-electric/20')} />
                  </Button>
                  <Button size="sm" variant="ghost" title="تحديد كمقروء">
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost"><MoreHorizontal className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedThread.messages.map((msg) => (
                  <div key={msg.id} className={cn('flex', msg.direction === 'inbound' ? 'justify-start' : 'justify-end')}>
                    <div className={cn(
                      'max-w-[75%] px-4 py-2.5 rounded-2xl',
                      msg.direction === 'inbound'
                        ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tr-sm shadow-sm'
                        : (msg.sender === 'MARKETRON Bot'
                            ? 'bg-gradient-to-br from-electric to-purple text-white rounded-tl-sm'
                            : 'bg-gradient-to-r from-electric to-cyan text-white rounded-tl-sm')
                    )}>
                      {msg.sender === 'MARKETRON Bot' && (
                        <div className="flex items-center gap-1 text-[10px] opacity-90 mb-0.5">
                          <Bot className="w-3 h-3" />
                          <span>رد آلي</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                      <p className={cn('text-[10px] mt-1', msg.direction === 'outbound' ? 'text-white/70' : 'text-gray-400')}>
                        {msg.time} · {msg.status === 'read' ? '✓✓ مقروء' : msg.status === 'delivered' ? '✓✓ مستلم' : '✓ مرسل'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <AiReplyPanel lastInbound={lastInbound} onSend={handleSendReply} />

              <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex gap-2">
                  <Input
                    placeholder="اكتب رسالتك أو اختر رد ذكي من الأعلى..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(replyText); } }}
                    className="flex-1"
                    dir="rtl"
                  />
                  <Button onClick={() => handleSendReply(replyText)} disabled={!replyText.trim()} className="gradient-brand text-white border-0">
                    <Send className="w-4 h-4 ml-1" />
                    إرسال
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl gradient-brand mx-auto mb-3 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">مرحباً بك في صندوق MARKETRON</p>
                <p className="text-sm text-gray-500 mt-1">اختر محادثة من اليمين للبدء، أو ربط منصتك من الإعدادات.</p>
              </div>
            </div>
          )}
        </div>

        {showCustomerPanel && (
          <CustomerPanel customer={selectedCustomer} onStatusChange={handleStatusChange} onSaveNotes={handleSaveNotes} />
        )}
      </div>
    </div>
  );
};

export default SocialInboxPage;
