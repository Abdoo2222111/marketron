# 🎯 MASTER PROMPT — التطوير البصري الشامل لـ MARKETRON

> هذا الملف هو المرجع الأساسي لتطوير كل العناصر البصرية في الموقع — استخدمه كـ prompt مع أي AI لتطوير أو تحسين أي جزء.

---

## 🧠 الهدف العام
تحويل MARKETRON (`azizmedia.site`) إلى منصة احترافية عالمية المستوى — تصميم فاخر، تجربة مستخدم سلسة، أداء عالٍ، وكل شيء يعمل بكفاءة مثالية.

---

## 1️⃣ صفحة الهبوط (Landing Page)

### الملف: `frontend/src/features/landing/LandingPage.tsx`

### المطلوب:
- [ ] **إعادة تصميم الهيرو** — Hero section بخلفية متحركة (gradient animated mesh أو particles)
- [ ] **الشعار** — استخدم `/logo.png` كصورة وليس نص
- [ ] **الألوان** — درجات البنفسجي (#7C3AED) + السماوي (#06B6D4) + أسود داكن (#0B0826)
- [ ] **الخطوط** — نظام طباعة عربي احترافي (Tajawal أو Cairo من Google Fonts)
- [ ] **الأقسام**:
  - [ ] Hero: عنوان جريء + نص فرعي + زرين CTA (عرض الباقات + تواصل واتساب)
  - [ ] إحصائيات: أرقام حقيقية مع counter animation
  - [ ] الخدمات: 4 بطاقات (تسويق، تصميم، تطوير، استشارات) مع أيقونات وحواف متدرجة
  - [ ] المميزات: لماذا MARKETRON؟ (4-6 نقاط قوة)
  - [ ] طريقة العمل: 4 خطوات (استشارة → استراتيجية → تنفيذ → تحسين)
  - [ ] الباقات: 3 بطاقات تسعير مع تأثير hover مكبر
  - [ ] الأسئلة الشائعة: accordion تفاعلي
  - [ ] الشهادات: testimonials من عملاء حقيقيين (carousel)
  - [ ] CTA: قسم اتصال بارز مع رقم واتساب
  - [ ] Footer: شعار، روابط، حقوق النشر

### العناصر التفاعلية:
- [ ] أنيميشن عند السكرول (scroll reveal) للبطاقات
- [ ] Counter تصاعدي للأرقام الإحصائية
- [ ] Smooth scroll بين الأقسام
- [ ] Dark/Light mode متوافق
- [ ] RTL كامل + LRL جاهز

### الصور المطلوبة:
- `/logo.png` — الشعار
- `/images/hero-bg.png` — خلفية الهيرو (اختياري)
- `/images/mockup-dashboard.png` — معاينة للوحة التحكم

---

## 2️⃣ صفحة الخدمات (Services Page)

### الملف: `frontend/src/features/services/ServicesPage.tsx`

### المطلوب:
- [ ] **إضافة أنيميشن** للبطاقات عند الظهور (fade-in + slide-up)
- [ ] **تحسين الهيرو** — إضافة خلفية متحركة
- [ ] **عداد إحصائي** متحرك (50+ → يتصاعد)
- [ ] **قسم الشهادات** — testimonials من العملاء
- [ ] **قسم المدونة/الأخبار** — (اختياري)
- [ ] **تحسين SEO** — meta tags, structured data, Open Graph
- [ ] **تحسين الأداء** — lazy loading للصور، تقليل الـ JS

### الألوان:
- نفس تدرجات الموقع: بنفسجي (#7C3AED) → سماوي (#06B6D4) → زمردي (#10B981)

---

## 3️⃣ لوحة التحكم (Dashboard)

### الملف: `frontend/src/features/dashboard/DashboardPage.tsx`

### المطلوب:
- [ ] **إضافة رسوم بيانية حقيقية** — من `analyticsApi.getOverview()`
- [ ] **جدول الحملات** — من `campaignsApi.list()`
- [ ] **إضافة خاصية التصفية** — حسب التاريخ (7/30/90 يوم)
- [ ] **إضافة زر "تصدير تقرير"** — PDF/Excel
- [ ] **تحسين الـ KPIs** — إضافة icons متدرجة
- [ ] **إضافة Notifications live** — من WebSocket أو polling
- [ ] **إضافة Quick Actions** — زر "إنشاء حملة"، "ربط منصة"، "عرض QR"

### التحسينات البصرية:
- [ ] Skeleton loading بدل الـ spinner
- [ ] أنيميشن عند تحميل البيانات
- [ ] بطاقات شفافة مع Glassmorphism effect
- [ ] Responsive بالكامل (mobile-first)

---

## 4️⃣ صفحة الحملات (Campaigns)

### الملفات:
- `CampaignListPage.tsx` — قائمة الحملات
- `CampaignDetailsPage.tsx` — تفاصيل الحملة
- `CreateCampaignPage.tsx` — إنشاء حملة جديدة

### المطلوب:
- [ ] **إزالة كل البيانات الوهمية** — استخدام `campaignsApi` فقط
- [ ] **إضافة فلترة متقدمة** — حسب الحالة، المنصة، التاريخ
- [ ] **إضافة بحث** — بحث نصي في الحملات
- [ ] **إضافة Pagination** — إذا كان فيه أكثر من 20 حملة
- [ ] **صفحة التفاصيل** — رسوم بيانية حقيقية من Facebook Insights
- [ ] **إنشاء حملة** — ربط بـ Facebook API الفعلي لإنشاء الحملة

### التحسينات البصرية:
- [ ] بطاقات مع hover effects
- [ ] Badges ملونة للحالات (active: أخضر، paused: برتقالي، completed: أزرق)
- [ ] Progress bars للميزانية المنفقة
- [ ] Responsive tables

---

## 5️⃣ صفحة التحليلات (Analytics)

### الملف: `frontend/src/features/analytics/AnalyticsPage.tsx`

### المطلوب:
- [ ] **إزالة كل البيانات الوهمية**
- [ ] **جلب البيانات من `analyticsApi`** — overview + campaign insights
- [ ] **إضافة رسوم بيانية متعددة** — Line chart (الإنفاق), Bar chart (الانطباعات), Pie chart (المنصات)
- [ ] **إضافة مقارنات** — مقارنة الفترات (هذا الشهر vs الشهر الماضي)
- [ ] **إضافة تصدير** — PDF + Excel + CSV
- [ ] **إضافة فلترة متقدمة** — حسب المنصة، الفترة، الحملة

---

## 6️⃣ صفحة الإعدادات (Settings)

### الملف: `features/settings/SettingsPage.tsx`

### المطلوب:
- [ ] **إزالة كل البيانات الوهمية** (اسم المستخدم، الإيميل، الفون، الشركة)
- [ ] **جلب البيانات من API** — `settingsApi.getProfile()`
- [ ] **جلب الاتصالات من `platformsApi.list()`** — (مفعل دلوقتي ✅)
- [ ] **تحسين UI الأمان** — إظهار/إخفاء التوكنات
- [ ] **إضافة تأكيد للحذف** — Confirm dialog عند فصل منصة

---

## 7️⃣ صفحة AI Agents

### الملف: `features/ai-agents/AiAgentsPage.tsx`

### المطلوب:
- [ ] **إزالة `MOCK_REPLY_RULES`** — استخدام API فقط
- [ ] **إظهار حالة empty** — لما مفيش قواعد رد
- [ ] **إضافة إمكانية تعديل/حذف القواعد** من الواجهة
- [ ] **تحسين واجهة الشات** — تصميم أشبه بـ ChatGPT
- [ ] **إضافة Typing indicator** — أثناء انتظار رد الـ AI

---

## 8️⃣ الصفحة الاجتماعية (Social Inbox)

### الملف: `features/social/SocialInboxPage.tsx`

### المطلوب:
- [ ] **تحسين واجهة المحادثات** — تصميم أشبه بـ WhatsApp Web
- [ ] **إضافة Search** — بحث في الرسائل والمحادثات
- [ ] **إضافة Mentions** — @assign للموظفين
- [ ] **تحسين الأداء** — Virtual scrolling للرسائل الكثيرة
- [ ] **إضافة إشعارات صوتية** — للرسائل الجديدة

---

## 9️⃣ الملفات المشتركة (Components)

### التحسينات المطلوبة:
- [ ] **`Logo.tsx`** — دعم lazy loading للصورة
- [ ] **`Sidebar.tsx`** — إضافة collapse animation ناعم
- [ ] **`DashboardShell.tsx`** — إضافة Breadcrumbs ديناميكية
- [ ] **`Navbar.tsx`** — إظهار اسم المستخدم الحقيقي من API
- [ ] **`Card.tsx`** — إضافة hover effect موحد
- [ ] **`Button.tsx`** — إضافة loading state + ripple effect

### ألوان الموقع الموحدة:
```css
--color-primary: #7C3AED;
--color-secondary: #06B6D4;
--color-accent: #10B981;
--color-dark: #0B0826;
--color-surface: #1E1B3A;
--color-text: #A1A1C2;
--gradient-brand: linear-gradient(135deg, #7C3AED, #06B6D4);
--gradient-hero: linear-gradient(180deg, #0B0826, #1E1B3A);
```

---

## 🔟 التحسينات الأمنية

- [ ] **نقل `prisma.ts`** إلى server-side فقط (لا يستورد في client components)
- [ ] **نقل `auth-utils.ts`** إلى server-side — bcrypt + jwt ممنوع في الـ bundle
- [ ] **تأكد من عدم تسريب API keys** — كل env variables تبدأ بـ `NEXT_PUBLIC_` فقط ما ينكشف
- [ ] **إضافة rate limiting** للـ API routes
- [ ] **إضافة CSRF protection** للـ POST/PUT/DELETE routes

---

## 1️⃣1️⃣ الأداء

- [ ] **Image optimization** — استخدام `next/image` لكل الصور
- [ ] **Code splitting** — Dynamic imports للمكونات الثقيلة
- [ ] **Bundle analysis** — تشغيل `npx next build` ومراجعة الحجم
- [ ] **Lazy loading** — للمكونات غير المرئية
- [ ] **Memoization** — `useMemo` و `useCallback` في كل المكونات
- [ ] **التقليل من الـ re-renders** — فصل المكونات الكبيرة

---

## 1️⃣2️⃣ قائمة كل الملفات التي تحتاج تطوير

### ✅ تم إصلاحها (لا تحتاج):
- `features/services/ServicesPage.tsx` — ✅
- `features/dashboard/DashboardPage.tsx` — ✅ (API حقيقية)
- `features/campaigns/CampaignListPage.tsx` — ✅ (API حقيقية)
- `features/competitors/CompetitorsPage.tsx` — ✅ (API حقيقي)
- `app/api/v1/platforms/*` — ✅ (Prisma)
- `app/api/v1/campaigns/*` — ✅ (Facebook API)
- `app/api/v1/analytics/*` — ✅ (تم الإنشاء)
- `app/api/v1/ai-agents/*` — ✅ (Prisma)
- `lib/ai-replies.ts` — ✅ (بدون data وهمية)

### 🔴 لا تزال تحتاج إصلاح:
- `features/campaigns/CampaignDetailsPage.tsx` — بيانات وهمية
- `features/analytics/AnalyticsPage.tsx` — بيانات وهمية
- `features/campaigns/CreateCampaignPage.tsx` — لا يرسل للـ API
- `features/market-research/MarketResearchPage.tsx` — بيانات وهمية
- `features/ai-agents/AiAgentsPage.tsx` — MOCK_REPLY_RULES كـ fallback
- `features/settings/SettingsPage.tsx` — بيانات مستخدم وهمية
- `features/client/ClientPortalPage.tsx` — بيانات وهمية
- `components/layout/Sidebar.tsx` — اسم مستخدم وهمي
- `components/layout/Navbar.tsx` — اسم مستخدم وهمي
- `lib/prisma.ts` — في الـ client bundle (خطر أمني)
- `lib/auth-utils.ts` — في الـ client bundle (خطر أمني)

---

## 🚀 أمر النشر النهائي

```bash
cd D:\marketing-platform\frontend
npx vercel --prod
npx vercel alias set <deployment-url> azizmedia.site
```

---

## 📋 CHECKLIST النهائي

- [ ] كل الصفحات تظهر بشكل صحيح على الجوال
- [ ] كل الروابط شغالة
- [ ] لا توجد أخطاء في الـ build
- [ ] كل APIs ترجع بيانات حقيقية
- [ ] لا توجد بيانات وهمية (zero mock data)
- [ ] الـ bundle size أقل من 200KB (First Load JS)
- [ ] الـ Performance score فوق 90 (Lighthouse)
- [ ] كل النصوص العربية مضبوطة (no mojibake)
- [ ] كل env variables مضبوطة في Vercel
- [ ] الـ Prisma schema متزامن مع قاعدة البيانات
