// MARKETRON — Social Inbox + CRM Types

export type PlatformKey =
  | 'whatsapp'
  | 'messenger'
  | 'instagram'
  | 'tiktok'
  | 'snapchat'
  | 'facebook'
  | 'twitter'
  | 'telegram';

export interface PlatformConnection {
  id: string;
  platform: PlatformKey;
  name: string;
  connected: boolean;
  connectedAt?: string;
  unread: number;
  meta?: Record<string, string>;
}

export type CustomerStatus = 'new' | 'hot' | 'warm' | 'cold' | 'sold' | 'lost';

export type ConversationStatus = 'unread' | 'read' | 'pending' | 'replied' | 'closed';

export interface ConversationMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  sender: string;
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
  kind?: 'text' | 'image' | 'audio' | 'video' | 'file' | 'system';
  attachments?: string[];
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  platform: PlatformKey;
  status: CustomerStatus;
  source?: string;
  notes?: string;
  tags?: string[];
  value?: number;
  lastContactAt?: string;
  createdAt: string;
  updatedAt: string;
  history?: ConversationMessage[];
  labels?: string[];
  avatarColor?: string;
  initial?: string;
}

export interface ConversationThread {
  id: string;
  customerId: string;
  customerName: string;
  customerInitial: string;
  customerAvatarColor: string;
  platform: PlatformKey;
  status: ConversationStatus;
  unread: number;
  lastMessage: string;
  lastMessageTime: string;
  pinned?: boolean;
  assignedTo?: string;
  messages: ConversationMessage[];
}

export interface AiReplyRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: string;
  reply: string;
  contextKeywords: string[];
}

export interface AiReplySuggestion {
  id: string;
  text: string;
  intent: 'greeting' | 'product_inquiry' | 'pricing' | 'objection' | 'closing' | 'support' | 'follow_up' | 'general';
  confidence: number;
  used?: boolean;
}

export const PLATFORM_META: Record<PlatformKey, { label: string; color: string; bg: string; emoji: string }> = {
  whatsapp: { label: 'واتساب', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', emoji: '🟢' },
  messenger: { label: 'ماسنجر', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', emoji: '🔵' },
  instagram: { label: 'إنستجرام', color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30', emoji: '🟣' },
  tiktok: { label: 'تيك توك', color: 'text-gray-900', bg: 'bg-gray-100 dark:bg-gray-800', emoji: '⚫' },
  snapchat: { label: 'سناب شات', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', emoji: '🟡' },
  facebook: { label: 'فيسبوك', color: 'text-blue-700', bg: 'bg-blue-100 dark:bg-blue-900/30', emoji: '🔵' },
  twitter: { label: 'تويتر', color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/30', emoji: '🐦' },
  telegram: { label: 'تيليجرام', color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30', emoji: '🔵' },
};

export const CUSTOMER_STATUS_META: Record<CustomerStatus, { label: string; color: string; dot: string }> = {
  new: { label: 'عميل جديد', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', dot: 'bg-blue-500' },
  hot: { label: 'عميل محتمل', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', dot: 'bg-orange-500' },
  warm: { label: 'تفاعل إيجابي', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30', dot: 'bg-amber-500' },
  cold: { label: 'عميل بارد', color: 'text-gray-500 bg-gray-100 dark:bg-gray-800', dot: 'bg-gray-400' },
  sold: { label: 'تم البيع', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30', dot: 'bg-emerald-500' },
  lost: { label: 'عميل سلبي', color: 'text-red-600 bg-red-100 dark:bg-red-900/30', dot: 'bg-red-500' },
};

export const AVATAR_COLORS = [
  'from-blue-500 to-cyan-400',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-400',
  'from-orange-500 to-amber-400',
  'from-red-500 to-rose-400',
  'from-indigo-500 to-blue-400',
];