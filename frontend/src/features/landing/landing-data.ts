import { Bot, BarChart3, Sparkles, TrendingUp, MessageSquare, Shield, Building2, Share2, CheckCircle } from 'lucide-react';

export const features = [
  { icon: Bot,        title: 'وكيل مبيعات ذكي 24/7',      desc: 'يرد على عملائك بشكل طبيعي، يفهم نشاطك، ويحول الاستفسارات لمبيعات',             color: '#7C3AED' },
  { icon: BarChart3,  title: 'لوحة تحكم موحدة',            desc: 'كل حملاتك على Meta وGoogle وTikTok في مكان واحد مع تقارير لحظية',               color: '#06B6D4' },
  { icon: Sparkles,   title: 'توليد محتوى بالذكاء الاصطناعي', desc: 'نصوص إعلانية وصور بأسلوبك بالعربية — جاهزة للنشر في ثوانٍ',                    color: '#EC4899' },
  { icon: TrendingUp, title: 'تحليل وتحسين الحملات',       desc: 'تقارير ذكية تحدد نقاط القوة والضعف وتقترح تحسينات فورية',                         color: '#7C3AED' },
  { icon: MessageSquare, title: 'صندوق وارد موحد',         desc: 'كل محادثات واتساب وعملائك في مكان واحد مع ردود AI ذكية',                         color: '#06B6D4' },
  { icon: Shield,     title: 'موافقتك أولاً',              desc: 'لا ينشر أي حملة بدون موافقتك — تحكم كامل بدون قلق',                                color: '#10D9A0' },
];

export const steps = [
  { num: '01', title: 'سجّل وعرّف نشاطك',      desc: 'أخبرنا عن نشاطك التجاري ومنتجاتك وجمهورك في 5 دقائق',              icon: Building2 },
  { num: '02', title: 'اربط حساباتك الإعلانية',  desc: 'اربط Meta وGoogle وTikTok بنقرة — نجلب كل حملاتك تلقائياً',         icon: Share2 },
  { num: '03', title: 'الذكاء الاصطناعي يبدأ العمل', desc: 'يحلل أداء حملاتك، يرد على عملائك، ويولّد محتوى مخصص',         icon: Bot },
  { num: '04', title: 'أنت تتحكم، هو ينفّذ',     desc: 'تراجع كل شيء وتوافق قبل النشر — تحكم كامل مع توفير 80% من وقتك',    icon: CheckCircle },
];

export const plans = [
  { name: 'تجريبي', price: 'مجاني', period: '', desc: 'للتجربة والاستكشاف', features: ['وكيل ذكي (50 رسالة/شهر)', 'لوحة تحكم أساسية', 'منصة واحدة'], cta: 'ابدأ مجاناً', highlight: false },
  { name: 'احترافي', price: '299', period: 'ريال / شهر', desc: 'للأعمال النشطة', features: ['وكيل ذكي غير محدود', '3 منصات إعلانية', 'توليد محتوى AI', 'تحليل متقدم', 'دعم واتساب'], cta: 'ابدأ الآن', highlight: true, badge: 'الأكثر طلباً' },
  { name: 'مؤسسي', price: '799', period: 'ريال / شهر', desc: 'للشركات الكبيرة', features: ['كل مميزات الاحترافي', 'مستخدمين غير محدودين', 'API مخصص', 'مدير حساب مخصص', 'SLA مضمون'], cta: 'تواصل معنا', highlight: false },
];

export const testimonials = [
  { name: 'أحمد السيد', role: 'مدير تسويق', company: 'شركة التقنية المتقدمة', text: 'منذ استخدام MARKETRON، زادت كفاءة حملاتنا بنسبة ٤٠٪. الوكيل الذكي وفر علينا ساعات من الرد على العملاء.', rating: 5 },
  { name: 'سارة العنزي', role: 'صاحبة متجر إلكتروني', company: 'متجر روز للتجميل', text: 'لم أتوقع أن أجد منصة عربية متكاملة بهذا المستوى. توليد المحتوى بالعربية دقيق جداً وأوفر ٧٠٪ من وقتي.', rating: 5 },
  { name: 'فيصل المطيري', role: 'مستشار تسويق رقمي', company: 'مكتب فيصل للاستشارات', text: 'أرشح MARKETRON لكل عملاي. لوحة التحكم الموحدة تغنيك عن ٣ أدوات مختلفة. منصة مذهلة.', rating: 5 },
  { name: 'نورة الدوسري', role: 'مديرة علامة تجارية', company: 'مجموعة الضيافة العربية', text: 'تقارير التحليل الذكية ساعدتنا نحدد نقاط الضعف في حملاتنا بسرعة. التوصيات دائماً دقيقة ومفيدة.', rating: 5 },
  { name: 'عبدالله الزهراني', role: 'رائد أعمال', company: 'منصة زاد للتجارة', text: 'بدأت بالخطة التجريبية وبعد أسبوع انتقلت للاحترافية. الفرق واضح — وكيل ذكي وتقارير وتوليد محتوى بجودة احترافية.', rating: 5 },
  { name: 'هند الشمري', role: 'أخصائية تسويق', company: 'وكالة براند للإعلان', text: 'أفضل ما في MARKETRON أنه ينشر بإذنك — تحكم كامل بدون مفاجآت. عملاي يثقون فيّ أكثر.', rating: 5 },
];

export const platforms = [
  { name: 'Meta Ads',   emoji: '📘' },
  { name: 'Google Ads', emoji: '🎯' },
  { name: 'TikTok Ads', emoji: '🎵' },
  { name: 'WhatsApp',   emoji: '💬' },
  { name: 'Snapchat',   emoji: '👻' },
  { name: 'Instagram',  emoji: '📸' },
];

export const heroStats = [
  { num: '٥٠٠+', label: 'حملة مُدارة' },
  { num: '٩٨٪',   label: 'رضا العملاء' },
  { num: '24/7',  label: 'وكيل ذكي نشط' },
];

export const LOGO_URL = '/logo.png';

export const CUBES = [
  { x: 3,  y: 8,  size: '110px', delay: 0 },
  { x: 88, y: 12, size: '70px',  delay: 1.2 },
  { x: 12, y: 72, size: '55px',  delay: 2.5 },
  { x: 82, y: 68, size: '90px',  delay: 0.8 },
  { x: 50, y: 4,  size: '65px',  delay: 1.8 },
  { x: 92, y: 42, size: '45px',  delay: 3.2 },
  { x: 25, y: 42, size: '40px',  delay: 0.5 },
  { x: 70, y: 55, size: '50px',  delay: 2.0 },
  { x: 45, y: 85, size: '35px',  delay: 1.5 },
];

export const LANGUAGES = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'tr', label: 'Türkçe', dir: 'ltr' },
] as const;
