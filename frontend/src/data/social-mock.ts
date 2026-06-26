// MARKETRON Social Inbox — Mock Data Store
// This will be replaced by real API calls once backend integration is live.
import type { PlatformConnection, ConversationThread, Customer, AiReplyRule } from '@/types/social';

export const MOCK_PLATFORMS: PlatformConnection[] = [
  { id: 'p1', platform: 'whatsapp', name: 'واتساب الأعمال', connected: true, connectedAt: '2026-06-20', unread: 12, meta: { phoneNumber: '+966551234567' } },
  { id: 'p2', platform: 'messenger', name: 'فيسبوك ماسنجر', connected: true, connectedAt: '2026-06-18', unread: 5, meta: { pageName: 'Marketron SA' } },
  { id: 'p3', platform: 'instagram', name: 'إنستجرام', connected: true, connectedAt: '2026-06-22', unread: 8, meta: { username: '@marketron.ai' } },
  { id: 'p4', platform: 'tiktok', name: 'تيك توك', connected: false, unread: 0, meta: { username: '@marketron' } },
  { id: 'p5', platform: 'snapchat', name: 'سناب شات', connected: false, unread: 0, meta: { username: '@marketron.sa' } },
  { id: 'p6', platform: 'telegram', name: 'تيليجرام', connected: true, connectedAt: '2026-06-23', unread: 3, meta: { botName: 'Marketron Bot' } },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1', name: 'أحمد محمد', phone: '+966500000011', email: 'ahmed@example.com',
    platform: 'whatsapp', status: 'hot', source: 'إعلان فيسبوك', tags: ['م interessé', 'VIP'],
    value: 4500, lastContactAt: 'منذ 5 دقائق', createdAt: '2026-06-25T08:00:00', updatedAt: '2026-06-25T11:30:00',
    initial: 'أ', avatarColor: 'from-blue-500 to-cyan-400', labels: ['استفسار سعر'],
    notes: ' سأل عن المنتج الجديد و السعر. موافق على التوصيل.',
  },
  {
    id: 'c2', name: 'سارة أحمد', phone: '+966500000022', email: 'sara@example.com',
    platform: 'whatsapp', status: 'new', source: 'Story Link', tags: ['أول تواصل'],
    value: 0, lastContactAt: 'منذ 15 دقيقة', createdAt: '2026-06-25T10:15:00', updatedAt: '2026-06-25T11:20:00',
    initial: 'س', avatarColor: 'from-purple-500 to-pink-500', labels: ['متى الشحنة'],
    notes: 'سؤال عن تاريخ الشحنة الجاية.',
  },
  {
    id: 'c3', name: 'خالد عمر', phone: '+966500000033', email: 'khaled@example.com',
    platform: 'messenger', status: 'cold', source: 'صفحة فيسبوك', tags: ['تبريد'],
    value: 0, lastContactAt: 'منذ ساعة', createdAt: '2026-06-24T09:00:00', updatedAt: '2026-06-25T10:30:00',
    initial: 'خ', avatarColor: 'from-emerald-500 to-teal-400', labels: ['استفسار إعلان'],
    notes: 'لم يرد منذ 3 أيام.',
  },
  {
    id: 'c4', name: 'نورة سعد', phone: '+966500000044', email: 'noura@example.com',
    platform: 'instagram', status: 'hot', source: 'Story DM', tags: ['محتمل'],
    value: 2200, lastContactAt: 'منذ ساعتين', createdAt: '2026-06-24T14:20:00', updatedAt: '2026-06-25T09:30:00',
    initial: 'ن', avatarColor: 'from-orange-500 to-amber-400', labels: ['استفسار سعر'],
    notes: 'سألت عن سعر المنتج و قابلة للتفاوض.',
  },
  {
    id: 'c5', name: 'فهد عبدالله', phone: '+966500000055',
    platform: 'whatsapp', status: 'sold', source: 'إعلان انستجرام', tags: ['مبيعات', 'عميل دائم'],
    value: 7800, lastContactAt: 'منذ 3 ساعات', createdAt: '2026-06-20T11:00:00', updatedAt: '2026-06-25T08:00:00',
    initial: 'ف', avatarColor: 'from-red-500 to-rose-400', labels: ['تأكيد طلب'],
    notes: 'تم إتمام البيع. عميل سعيد و مهتم بالشراء مرة ثانية.',
  },
  {
    id: 'c6', name: 'لينا محمد', phone: '+966500000066',
    platform: 'messenger', status: 'warm', source: 'صفحة فيسبوك', tags: ['متابعة'],
    value: 1200, lastContactAt: 'منذ 5 ساعات', createdAt: '2026-06-23T15:00:00', updatedAt: '2026-06-25T06:30:00',
    initial: 'ل', avatarColor: 'from-indigo-500 to-blue-400', labels: ['خصم'],
    notes: 'سألت عن خصم للطلبات الكبيرة. عميل متفاعل.',
  },
  {
    id: 'c7', name: 'محمد علي', phone: '+966500000077',
    platform: 'instagram', status: 'lost', source: 'إعلان تيك توك', tags: ['بدون رد'],
    value: 0, lastContactAt: 'منذ يومين', createdAt: '2026-06-18T10:00:00', updatedAt: '2026-06-23T16:00:00',
    initial: 'م', avatarColor: 'from-orange-500 to-amber-400', labels: ['إلغاء'],
    notes: 'ألغى الاهتمام بعد الأخبار عن سعر المنافس.',
  },
  {
    id: 'c8', name: 'ريم خالد', phone: '+966500000088',
    platform: 'telegram', status: 'new', source: 'روابط', tags: ['جديد'],
    value: 0, lastContactAt: 'منذ ساعة', createdAt: '2026-06-25T07:00:00', updatedAt: '2026-06-25T10:00:00',
    initial: 'ر', avatarColor: 'from-purple-500 to-pink-500', labels: ['DM'],
    notes: 'استفسار عام.',
  },
];

export const MOCK_THREADS: ConversationThread[] = [
  {
    id: 't1', customerId: 'c1', customerName: 'أحمد محمد', customerInitial: 'أ', customerAvatarColor: 'from-blue-500 to-cyan-400',
    platform: 'whatsapp', status: 'unread', unread: 2,
    lastMessage: 'السلام عليكم، عندي استفسار عن المنتج الجديد', lastMessageTime: 'منذ 5 دقائق', pinned: true,
    messages: [
      { id: 'm1', direction: 'inbound', sender: 'أحمد محمد', text: 'السلام عليكم، عندي استفسار عن المنتج الجديد', time: '10:30', status: 'read' },
      { id: 'm2', direction: 'outbound', sender: 'MARKETRON Bot', text: 'وعليكم السلام ورحمة الله 🌟 نورتنا! كيف أقدر أساعدك اليوم؟', time: '10:30', status: 'read', kind: 'text' },
      { id: 'm3', direction: 'inbound', sender: 'أحمد محمد', text: 'حابب أسأل عن السعر وهل فيه توصيل مجاني؟', time: '10:32', status: 'read' },
      { id: 'm4', direction: 'inbound', sender: 'أحمد محمد', text: 'و هل عندكم خصم على الكمية؟', time: '10:33', status: 'delivered' },
    ],
  },
  {
    id: 't2', customerId: 'c2', customerName: 'سارة أحمد', customerInitial: 'س', customerAvatarColor: 'from-purple-500 to-pink-500',
    platform: 'whatsapp', status: 'unread', unread: 1,
    lastMessage: 'متى تتوفر الشحنة الجديدة؟', lastMessageTime: 'منذ 15 دقيقة',
    messages: [
      { id: 'm1', direction: 'inbound', sender: 'سارة أحمد', text: 'السلام عليكم، متى تتوفر الشحنة الجديدة؟', time: '10:18', status: 'delivered' },
    ],
  },
  {
    id: 't3', customerId: 'c4', customerName: 'نورة سعد', customerInitial: 'ن', customerAvatarColor: 'from-orange-500 to-amber-400',
    platform: 'instagram', status: 'unread', unread: 1,
    lastMessage: 'كم سعر المنتج؟', lastMessageTime: 'منذ ساعتين',
    messages: [
      { id: 'm1', direction: 'inbound', sender: 'نورة سعد', text: 'مساء الخير، كم سعر المنتج اللي شفته في الستوري؟', time: '09:15', status: 'read' },
      { id: 'm2', direction: 'outbound', sender: 'MARKETRON Bot', text: 'مساء النور 🌸 المنتج متوفر بـ 450 ريال، ومع رسوم التوصيل مجانية للطلبات فوق 300 ريال! 😍', time: '09:16', status: 'read' },
      { id: 'm3', direction: 'inbound', sender: 'نورة سعد', text: 'كم سعر المنتج؟', time: '09:30', status: 'delivered' },
    ],
  },
  {
    id: 't4', customerId: 'c5', customerName: 'فهد عبدالله', customerInitial: 'ف', customerAvatarColor: 'from-red-500 to-rose-400',
    platform: 'whatsapp', status: 'replied', unread: 0,
    lastMessage: 'شكراً لكم على الخدمة الممتازة', lastMessageTime: 'منذ 3 ساعات', pinned: true,
    messages: [
      { id: 'm1', direction: 'inbound', sender: 'فهد عبدالله', text: 'قبلت الطلب، متى يوصل؟', time: '07:00', status: 'read' },
      { id: 'm2', direction: 'outbound', sender: 'MARKETRON Bot', text: 'توصلك اليوم قبل المغرب بإذن الله 🚚', time: '07:02', status: 'read' },
      { id: 'm3', direction: 'inbound', sender: 'فهد عبدالله', text: 'شكراً لكم على الخدمة الممتازة', time: '08:00', status: 'read' },
    ],
  },
  {
    id: 't5', customerId: 'c6', customerName: 'لينا محمد', customerInitial: 'ل', customerAvatarColor: 'from-indigo-500 to-blue-400',
    platform: 'messenger', status: 'read', unread: 0,
    lastMessage: 'هل يوجد خصم للطلبات الكبيرة؟', lastMessageTime: 'منذ 5 ساعات',
    messages: [
      { id: 'm1', direction: 'inbound', sender: 'لينا محمد', text: 'هل يوجد خصم للطلبات الكبيرة؟', time: '06:30', status: 'read' },
    ],
  },
  {
    id: 't6', customerId: 'c3', customerName: 'خالد عمر', customerInitial: 'خ', customerAvatarColor: 'from-emerald-500 to-teal-400',
    platform: 'messenger', status: 'read', unread: 0,
    lastMessage: 'عندي استفسار عن الإعلان الأخير', lastMessageTime: 'منذ ساعة',
    messages: [
      { id: 'm1', direction: 'inbound', sender: 'خالد عمر', text: 'عندي استفسار عن الإعلان الأخير', time: '10:00', status: 'read' },
    ],
  },
  {
    id: 't7', customerId: 'c8', customerName: 'ريم خالد', customerInitial: 'ر', customerAvatarColor: 'from-purple-500 to-pink-500',
    platform: 'telegram', status: 'unread', unread: 1,
    lastMessage: 'السلام، حابة أعرف عن العروض الجديدة', lastMessageTime: 'منذ ساعة',
    messages: [
      { id: 'm1', direction: 'inbound', sender: 'ريم خالد', text: 'السلام، حابة أعرف عن العروض الجديدة', time: '10:00', status: 'delivered' },
    ],
  },
];

export const MOCK_AI_RULES: AiReplyRule[] = [
  {
    id: 'r1', name: 'رد الترحيب', enabled: true,
    trigger: 'السلام عليكم|مرحبا|اهلا|hello|hi',
    reply: 'وعليكم السلام ورحمة الله 🌟 نورتنا في MARKETRON! كيف أقدر أخدمك اليوم؟',
    contextKeywords: ['ترحيب', 'بدء', 'استفسار'],
  },
  {
    id: 'r2', name: 'الاستفسار عن السعر', enabled: true,
    trigger: 'سعر|كم|بكم|السعر|price',
    reply: 'المنتج متوفر بـ {السعر} ريال، والتوصيل مجاني للطلبات فوق 300 ريال 🚚\nللطلب المباشر يمكنك استخدام رابط الدفع: {روابط}',
    contextKeywords: ['سعر', 'كلفة', 'تكلفة'],
  },
  {
    id: 'r3', name: 'الاستفسار عن التوصيل', enabled: true,
    trigger: 'توصيل|شحن|توصيل مجاني|delivery',
    reply: 'نعم عندنا توصيل مجاني داخل المدن الرئيسية للطلبات فوق 300 ريال 🚚\nمدة التوصيل عادة من 1-3 أيام عمل.',
    contextKeywords: ['توصيل', 'شحن', 'logistics'],
  },
  {
    id: 'r4', name: 'خصم على الكمية', enabled: true,
    trigger: 'خصم|كاش باك|تخفيض|discount|offer',
    reply: 'فعلاً عندنا عروض خاصة للطلبات الكبيرة! 💎\n- 5% خصم للطلبات فوق 1000 ريال\n- 10% خصم للطلبات فوق 2500 ريال\n- توصيل مجاني للكل',
    contextKeywords: ['خصم', 'عرض', 'كاش باك'],
  },
  {
    id: 'r5', name: 'الاعتراض على السعر', enabled: true,
    trigger: 'غالي|سعر عالي|لماذا|كبير',
    reply: 'أتفهم قلقك 💙 سعرنا يضمن لك جودة عالية ومنتج أصلي 100% 🛡️ ومع منافساتنا المستمرة على الجودة نقدر نضمن احسن قيمة.\nراح نقدملك عرض خاص: خصم 10% على طلبك الأول، كيف تفضّل؟',
    contextKeywords: ['غالي', 'اعتراض'],
  },
  {
    id: 'r6', name: 'الإغلاق / إتمام البيع', enabled: true,
    trigger: 'تم|اوكي|موافق|اشتري|accept|pay',
    reply: 'ممتاز! 🎉 يؤسفني شكرك على ثقتك بـ MARKETRON. خلني أكمل بياناتك و أرسل لك رابط الدفع الآمن. 📲\nاسمك الكامل: \nرقم الجوال: \nالعنوان للتوصيل: ',
    contextKeywords: ['بيع', 'إغلاق', 'موافقة'],
  },
];