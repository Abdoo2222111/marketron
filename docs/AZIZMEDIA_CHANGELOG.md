# سجل التطوير — MARKETRON على azizmedia.site

## 🎯 نظرة عامة
هذا الملف يوثق كل التعديلات والتطويرات التي تمت على منصة MARKETRON المرفوعة على `azizmedia.site` (Vercel).

---

## 🚀 النشر

| البيئة | الرابط | ملاحظات |
|--------|--------|---------|
| الإنتاج | `https://azizmedia.site` | مستضاف على Vercel (مشروع `marketron/frontend`) |
| API | `https://azizmedia.site/api/v1/*` | Next.js API Routes على نفس الدومين |
| قاعدة البيانات | PostgreSQL على Neon (`morning-wind-64665978`) | |
| Evolution API | `https://evolution-api-production-5e16.up.railway.app` | v2.3.7 على Railway |

---

## 📦 1. صفحة الخدمات (عامة — بدون تسجيل)

### المسار: `/ar/services`
### المكون: `frontend/src/features/services/ServicesPage.tsx`

### المحتوى:
- **الباقة الأساسية: 3,000 ريال** (1,500 قبل + 1,500 بعد)
  - 📊 شهر كامل إعلانات ميتا (فيسبوك + إنستجرام)
  - 🎨 10 تصاميم احترافية لبوستات السوشيال ميديا
  - 🎬 2 فيديو تسويقي (Reels)
  - 📈 تقارير أداء أسبوعية
  - 💡 تحسين مستمر (A/B Testing)
  - 📞 دعم فني على مدار الشهر

- **الباقة المتقدمة: 8,000 ريال** (4,000 قبل + 4,000 بعد)
- **الباقة الاحترافية: 15,000 ريال** (7,500 قبل + 7,500 بعد)

### نظام الدفع: نصف القبل ونصف البعد
- 50% عند بدء العمل
- 50% بعد استلام العمل النهائي والتأكد من الرضا

### الأقسام:
- Hero + شعار
- إحصائيات (50+ عميل، 200+ حملة، 98% رضا، 3 سنوات خبرة)
- الخدمات: تسويق إلكتروني، تصميم إعلاني، تطوير مواقع، إنشاء مواقع
- الباقات والأسعار
- شرح نظام الدفع
- طريقة العمل (4 خطوات)
- أسئلة شائعة
- CTA: تواصل عبر واتساب 01011273472

---

## 📞 2. رقم واتساب

- **الرقم:** `01011273472` (دولي: `201011273472`)
- رابط واتساب: `https://wa.me/201011273472`
- مستخدم في: صفحة الخدمات، CTA، الفوتر
- **IMPORTANT:** الإيميل (`info@marketron.sa`) تمت إزالته بالكامل

---

## 🖼️ 3. الشعار

- **الملف:** `frontend/public/logo.png` (129KB, 673x371 PNG)
- **مستخدم في:**
  - `Logo` component: `frontend/src/components/ui/Logo.tsx` — يستخدم `/logo.png`
  - صفحة الخدمات: `ServicesPage.tsx`
  - الـ Sidebar: `Sidebar.tsx` (عبر `Logo` component)
  - Dashboard Shell: `DashboardShell.tsx` (عبر `Logo` component)
  - Footer
- تم تحديث `mix-blend-multiply` إلى `object-contain` لظهور أفضل

---

## 🔧 4. إصلاح مشكلة QR واتساب

### المشكلة:
رسالة "تم بدء ربط واتساب - امسح الـ QR code" تظهر لكن QR لا يظهر.

### الأسباب الجذرية (3 أخطاء):

| # | المشكلة | الحل |
|---|---------|------|
| 1 | `POST /api/v1/platforms/whatsapp` لا يرجع `qrCode` في الـ response | تم تعديل المسار لاستدعاء `logoutInstance()` ثم `connectInstance()` وإرجاع `qrCode` |
| 2 | `GET /api/v1/platforms` يرجع static list بدون `platform` field | تمت إعادة كتابته ليقرأ من `PlatformConnection` + `PlatformToken` في قاعدة البيانات |
| 3 | الـ API routes تقرأ Auth من cookies فقط، لكن الـ Frontend يرسله في `Authorization: Bearer` header | إنشاء `getTokenFromRequest()` في `auth-utils.ts` تقرأ من المصدرين |

### الملفات المعدلة:
- `frontend/src/lib/auth-utils.ts` — إضافة `getTokenFromRequest()`
- `frontend/src/app/api/v1/platforms/whatsapp/route.ts` — إعادة كتابة كاملة
- `frontend/src/app/api/v1/platforms/whatsapp/qr/route.ts` — تحسين استخراج QR
- `frontend/src/app/api/v1/platforms/route.ts` — إعادة كتابة كاملة (Prisma)
- `frontend/src/app/api/v1/platforms/[platform]/route.ts` — DELETE + POST handlers
- `frontend/src/app/api/v1/platforms/whatsapp/send/route.ts` — إنشاء جديد لإرسال رسائل واتساب

### مكتبة Evolution API:
- `frontend/src/lib/evolution-api.ts` — دوال: `createInstance`, `getConnectionState`, `logoutInstance`, `connectInstance`, `sendTextMessage`, `instanceStatus`

---

## 💾 5. قاعدة البيانات — إضافات للـ Prisma Schema

### ملف: `frontend/prisma/schema.prisma`

| الموديل | الوصف | الجدول |
|---------|-------|--------|
| `PlatformConnection` | اتصالات المنصات (واتساب، فيسبوك) | `platform_connections` |
| `AiAgent` | وكلاء AI | `ai_agents` |
| `ReplyRule` | قواعد الرد التلقائي | `reply_rules` |

### العلاقات المضافة:
```prisma
model User {
  platformTokens PlatformToken[]
  aiAgents       AiAgent[]
  replyRules     ReplyRule[]
  aiProviders    AiProvider[]
}
```

---

## 🗑️ 6. إزالة البيانات الوهمية بالكامل

### الملفات المحذوفة:

| الملف | السبب |
|-------|-------|
| `frontend/src/lib/data-store.ts` | كان يحتوي 3 حملات وهمية، جميع الدوال تستخدم in-memory |
| `frontend/src/data/social-mock.ts` | كان يحتوي 176 سطر بيانات وهمية (عملاء، محادثات، رسائل) |

### الملفات المعاد كتابتها بدون بيانات وهمية:

#### API Routes:
| المسار | التغيير |
|--------|---------|
| `api/v1/campaigns/route.ts` | يستخدم Facebook API فقط |
| `api/v1/campaigns/stats/route.ts` | يستخدم Facebook API فقط |
| `api/v1/campaigns/[id]/route.ts` | يستخدم Facebook API فقط |
| `api/v1/campaigns/[id]/insights/route.ts` | يستخدم Facebook API فقط |
| `api/v1/campaigns/[id]/pause/route.ts` | يستخدم Facebook Marketing API |
| `api/v1/campaigns/[id]/activate/route.ts` | يستخدم Facebook Marketing API |
| `api/v1/platforms/facebook/route.ts` | يحفظ في Prisma (بدل in-memory) |
| `api/v1/platforms/[platform]/sync/route.ts` | **جديد** — مزامنة حقيقية مع Evolution API للواتساب |

#### Feature Pages:
| الصفحة | التغيير |
|--------|---------|
| `DashboardPage.tsx` | كل البيانات من `analyticsApi.getOverview()` + `campaignsApi.list()` |
| `CampaignListPage.tsx` | كل البيانات من `campaignsApi.list()` |
| `CompetitorsPage.tsx` | كل البيانات من `/api/v1/competitors` |
| `ai-replies.ts` | إزالة `MOCK_AI_RULES` + استخدام AI حقيقي |
| `AiReplyPanel.tsx` | معالجة async لـ `generateAiSuggestions()` |

---

## 🧩 7. Analytics API (جديد كلياً)

### المسارات:

| المسار | الوصف |
|--------|-------|
| `GET /api/v1/analytics/overview` | إحصائيات مجمعة من Facebook Ads (impressions, clicks, spend, CTR, CPC, CPA, ROAS) |
| `GET /api/v1/analytics/campaign/[id]` | تفاصيل حملة من Facebook Insights |
| `GET /api/v1/analytics/platform/[platform]` | إحصائيات حسب المنصة |

### الملفات:
- `frontend/src/app/api/v1/analytics/overview/route.ts`
- `frontend/src/app/api/v1/analytics/campaign/[id]/route.ts`
- `frontend/src/app/api/v1/analytics/platform/[platform]/route.ts`

---

## 🤖 8. AI Agents — قاعدة بيانات بدل In-Memory

### المسارات:

| المسار | الوصف |
|--------|-------|
| `GET/POST /api/v1/ai-agents` | قائمة + إنشاء وكيل |
| `GET/PUT/DELETE /api/v1/ai-agents/[id]` | وكيل فردي |
| `POST /api/v1/ai-agents/[id]/chat` | محادثة مع الوكيل |
| `GET /api/v1/ai-agents/types` | أنواع الوكلاء المتاحة |
| `GET/POST /api/v1/ai-agents/reply-rules` | قواعد الرد |
| `GET/PUT/DELETE /api/v1/ai-agents/reply-rules/[id]` | قاعدة رد فردية |

### Seed data:
- 3 وكلاء AI افتراضيين (وكيل الحملات، وكيل المحتوى، وكيل الدعم)
- 4 قواعد رد تلقائي (استفسار عن الخدمات، شكوى، استفسار أسعار، ترحيب)

---

## 🐛 9. أخطاء أخرى تم إصلاحها

### AppLayout — وسم main غير مقفول
- **الملف:** `frontend/src/components/layout/AppLayout.tsx`
- **المشكلة:** `<main>` مقفول بـ `</div>` بدل `</main>` — سبب فشل الـ build
- **الحل:** تغيير `</div>` إلى `</main>`

### فشل المزامنة (Sync)
- **الملف:** `frontend/src/app/api/v1/platforms/[platform]/sync/route.ts`
- **المشكلة:** الـ endpoint `POST /platforms/{platform}/sync` لم يكن موجوداً
- **الحل:** إنشاء الـ route + التحقق من حالة واتساب عبر Evolution API

---

## 🛠️ 10. المهارات (Skills) المضافة
تم إنشاء ملفات مهارات لـ opencode في `.opencode/skills/`:
- `marketron-deploy/` — نشر على Vercel
- `marketron-whatsapp/` — إدارة WhatsApp QR
- `marketron-database/` — إدارة Prisma

---

## 📋 11. متغيرات البيئة (Vercel)

| المتغير | القيمة | ملاحظات |
|---------|--------|---------|
| `DATABASE_URL` | `postgresql://...neon.tech` | قاعدة بيانات PostgreSQL على Neon |
| `JWT_ACCESS_SECRET` | `***` | سر توكن الوصول |
| `JWT_REFRESH_SECRET` | `***` | سر توكن التحديث |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | `***` | توكن فيسبوك |
| `WHATSAPP_EVOLUTION_API_URL` | `https://evolution-api-production-5e16.up.railway.app` | رابط Evolution API |
| `WHATSAPP_EVOLUTION_API_KEY` | `***` | مفتاح Evolution API |
| `NEXT_PUBLIC_API_URL` | `/api/v1` | قاعدة URL للـ API |

---

## 📁 12. قائمة الملفات المُنشأة أو المُعدلة

### ملفات جديدة:
- `frontend/src/features/services/ServicesPage.tsx`
- `frontend/src/app/[locale]/services/page.tsx`
- `frontend/src/lib/evolution-api.ts`
- `frontend/src/app/api/v1/analytics/overview/route.ts`
- `frontend/src/app/api/v1/analytics/campaign/[id]/route.ts`
- `frontend/src/app/api/v1/analytics/platform/[platform]/route.ts`
- `frontend/src/app/api/v1/platforms/whatsapp/send/route.ts`
- `frontend/src/app/api/v1/platforms/[platform]/sync/route.ts`
- `frontend/src/app/api/v1/ai-agents/types/route.ts`
- `frontend/src/app/api/v1/ai-agents/reply-rules/route.ts`
- `frontend/src/app/api/v1/ai-agents/reply-rules/[id]/route.ts`
- `frontend/src/app/api/v1/ai-agents/[id]/route.ts`
- `D:\new opene code\.opencode\skills\marketron-deploy\SKILL.md`
- `D:\new opene code\.opencode\skills\marketron-whatsapp\SKILL.md`
- `D:\new opene code\.opencode\skills\marketron-database\SKILL.md`

### ملفات معدلة:
- `frontend/src/lib/auth-utils.ts` — إضافة `getTokenFromRequest()`
- `frontend/src/app/api/v1/platforms/whatsapp/route.ts` — QR + Evolution API
- `frontend/src/app/api/v1/platforms/whatsapp/qr/route.ts` — تحسين استخراج QR
- `frontend/src/app/api/v1/platforms/route.ts` — إعادة كتابة كاملة (Prisma)
- `frontend/src/app/api/v1/platforms/[platform]/route.ts` — DELETE + POST
- `frontend/src/app/api/v1/platforms/facebook/route.ts` — Prisma بدل in-memory
- `frontend/src/app/api/v1/campaigns/route.ts` — Facebook API فقط
- `frontend/src/app/api/v1/campaigns/stats/route.ts` — Facebook API فقط
- `frontend/src/app/api/v1/campaigns/[id]/route.ts` — Facebook API فقط
- `frontend/src/app/api/v1/campaigns/[id]/insights/route.ts` — Facebook API فقط
- `frontend/src/app/api/v1/campaigns/[id]/pause/route.ts` — Facebook Marketing API
- `frontend/src/app/api/v1/campaigns/[id]/activate/route.ts` — Facebook Marketing API
- `frontend/src/components/layout/AppLayout.tsx` — fixing unclosed main tag
- `frontend/src/components/ui/Logo.tsx` — remove mix-blend-multiply
- `frontend/src/lib/ai-replies.ts` — إزالة MOCK_AI_RULES
- `frontend/src/components/social/AiReplyPanel.tsx` — async suggestions
- `frontend/src/features/dashboard/DashboardPage.tsx` — APIs حقيقية
- `frontend/src/features/campaigns/CampaignListPage.tsx` — APIs حقيقية
- `frontend/src/features/competitors/CompetitorsPage.tsx` — API حقيقي
- `frontend/prisma/schema.prisma` — إضافة AiAgent, ReplyRule, PlatformConnection
- `frontend/public/logo.png` — تم تحديث الشعار

### ملفات محذوفة:
- `frontend/src/lib/data-store.ts` — بيانات وهمية
- `frontend/src/data/social-mock.ts` — بيانات وهمية

---

## 💬 13. ملخص الشات الكامل — كل What تم الاتفاق عليه

### 13.1 الأهداف الرئيسية من الجلسة
1. **إكمال بناء الموقع** بالكامل وتحسين جميع الجوانب
2. **إصلاح WhatsApp QR** — كان لا يظهر رغم رسالة "تم بدء الربط"
3. **إنشاء صفحة خدمات** عامة (بدون تسجيل) تعرض الباقات والأسعار
4. **نظام دفع "نصف القبل ونصف البعد"** — 50% عند البداية، 50% عند التسليم
5. **إزالة كل البيانات الوهمية** — إظهار البيانات الحقيقية فقط من APIs
6. **تحديث الشعار** في كل الموقع
7. **تجربة المستخدم** — جعل الموقع أكثر احترافية 100x

### 13.2 كل التوكينات والمفاتيح والروابط

> ⚠️ **تنبيه أمني:** المفاتيح التالية حساسة — لا تشارك هذا الملف مع أي شخص. تم توثيقها هنا للرجوع إليها عند الحاجة.

#### 🌐 الاستضافة والدومين
| العنصر | القيمة |
|--------|--------|
| الدومين | `azizmedia.site` |
| المنصة | Vercel (مشروع `marketron/frontend`) |
| الـ API Base URL | `/api/v1` |
| مستضاف على | Vercel (Washington D.C., USA) |
| آلية الـ Alias | `vercel alias set <deployment-url> azizmedia.site` |

#### 🗄️ قاعدة البيانات
| العنصر | القيمة |
|--------|--------|
| المزود | Neon (Serverless PostgreSQL) |
| اسم المشروع | `morning-wind-64665978` |
| اسم القاعدة | `neondb` |
| Host | `ep-mute-block-asozu4jp-pooler.c-4.eu-central-1.aws.neon.tech` |
| Port | 5432 |

#### 📱 Evolution API (واتساب)
| العنصر | القيمة |
|--------|--------|
| الرابط | `https://evolution-api-production-5e16.up.railway.app` |
| API Key | `e94a419a-a8c3-4c42-9e2d-3f2f0e4dd2f5` |
| الإصدار | v2.3.7 |
| اسم الـ Instance | `marketron` |
| الاستضافة | Railway (free tier — 500 ساعة/شهر) |
| Header للمصادقة | `apikey` (lowercase) |

#### 🔑 فيسبوك
| العنصر | القيمة |
|--------|--------|
| نوع التوكن | Page Access Token |
| API Version | v22.0 |
| Base URL | `https://graph.facebook.com/v22.0/` |
| الوظائف المستخدمة | صفحات، محادثات، رسائل، حسابات إعلانية، حملات، Insights |

#### 🔐 JWT (المشروع)
| العنصر | القيمة |
|--------|--------|
| Access Secret | `marketron-access-secret-dev` |
| Refresh Secret | `marketron-refresh-secret-dev` |
| مدة Access Token | 15 دقيقة |
| مدة Refresh Token | 7 أيام |

#### 🤖 OpenCode AI
| العنصر | القيمة |
|--------|--------|
| API Key | `sk-I4TotpLhCAmg5wOosz47RnqvcR7ea4jiZv7sRNP61xBCSdcJziahm2CknSecw3i2` |
| الاستخدام | Zen AI model (لم يتم تفعيل billing بعد) |

#### 🖼️ الشعار
| الإصدار | الرابط |
|---------|--------|
| الأول (ibm.co) | `https://i.ibb.co/23FKSGk3/Gemini-Generated-Image-v9dkstv9dkstv9dk.png` |
| الثاني (مُستخدم حالياً) | `https://i.ibb.co/Wvn67dKw/Gemini-Generated-Image-v9dkstv9dkstv9dk.png` |
| المحلي | `/logo.png` في `frontend/public/` |

#### 📞 واتساب
| العنصر | القيمة |
|--------|--------|
| الرقم المحلي | `01011273472` |
| الرقم الدولي | `201011273472` |
| رابط واتساب | `https://wa.me/201011273472` |
| الاستخدام | صفحة الخدمات، CTA، الفوتر |

#### 🖥️ Namecheap (سيرفر)
| العنصر | القيمة |
|--------|--------|
| الخطة | Stellar (shared hosting) |
| الحالة | ⏳ Pending activation — في انتظار welcome email |

### 13.3 التسلسل الزمني للجلسة

| # | ما تم | التاريخ |
|---|------|---------|
| 1 | مراجعة الكود — اكتشاف أن QR لا يظهر بسبب `data-store` و `social-mock` | 1 يوليو 2026 |
| 2 | إصلاح QR — تحديث `platforms/whatsapp/route.ts` لإرجاع qrCode + تحسين auth | 1 يوليو 2026 |
| 3 | إصلاح `GET /api/v1/platforms` — من static list إلى Prisma (جدولين) | 1 يوليو 2026 |
| 4 | إصلاح `AppLayout.tsx` — وسم main غير مقفول (سبب فشل build) | 1 يوليو 2026 |
| 5 | إصلاح `platforms/[platform]/DELETE` — من in-memory إلى Prisma | 1 يوليو 2026 |
| 6 | إنشاء Analytics API — 3 endpoints جديدة (overview, campaign, platform) | 1 يوليو 2026 |
| 7 | إنشاء AI Agents CRUD — من in-memory إلى قاعدة بيانات (AiAgent + ReplyRule) | 1 يوليو 2026 |
| 8 | إنشاء صفحة الخدمات `azizmedia.site/ar/services` — بتصميم احترافي | 1 يوليو 2026 |
| 9 | تحميل الشعار الجديد وتحديثه في كل الموقع | 1 يوليو 2026 |
| 10 | إصلاح "فشل المزامنة" — إضافة `platforms/[platform]/sync/route.ts` | 1 يوليو 2026 |
| 11 | حذف `data-store.ts` و `social-mock.ts` — إزالة كل البيانات الوهمية | 1 يوليو 2026 |
| 12 | تحديث Campaigns API routes — تستخدم Facebook API فقط | 1 يوليو 2026 |
| 13 | تحديث Dashboard + CampaignList + Competitors — APIs حقيقية | 1 يوليو 2026 |
| 14 | تحديث ai-replies.ts — إزالة MOCK_AI_RULES + AI حقيقي | 1 يوليو 2026 |
| 15 | نشر 4 تحديثات متتالية على Vercel + Alias إلى azizmedia.site | 1 يوليو 2026 |

### 13.4 الملفات الأساسية التي تم العمل عليها

#### 📁 Frontend API Routes (`frontend/src/app/api/v1/`)
```
platforms/
├── route.ts                          # GET — قراءة الاتصالات من Prisma
├── [platform]/route.ts               # DELETE + POST — فصل + مزامنة
├── [platform]/sync/route.ts          # POST — مزامنة المنصة (جديد)
├── whatsapp/
│   ├── route.ts                      # GET/POST — حالة + ربط واتساب
│   ├── qr/route.ts                   # GET — QR code
│   └── send/route.ts                 # POST — إرسال رسالة (جديد)
└── facebook/route.ts                 # POST — ربط فيسبوك (Prisma)

analytics/
├── overview/route.ts                 # GET — إحصائيات مجمعة
├── campaign/[id]/route.ts            # GET — تفاصيل حملة
└── platform/[platform]/route.ts      # GET — إحصائيات منصة

campaigns/
├── route.ts                          # GET/POST — Facebook API فقط
├── stats/route.ts                    # GET — إحصائيات الحملات
├── [id]/route.ts                     # GET — حملة فردية
├── [id]/insights/route.ts            # GET — تحليلات الحملة
├── [id]/pause/route.ts               # POST — إيقاف حملة
└── [id]/activate/route.ts            # POST — تفعيل حملة

ai-agents/
├── route.ts                          # GET/POST — وكلاء (Prisma)
├── [id]/route.ts                     # GET/PUT/DELETE — وكيل فردي
├── [id]/chat/route.ts                # POST — محادثة
├── types/route.ts                    # GET — أنواع الوكلاء
└── reply-rules/
    ├── route.ts                      # GET/POST — قواعد الرد
    └── [id]/route.ts                 # PUT/DELETE — قاعدة فردية
```

#### 📁 Frontend Features
```
features/
├── services/ServicesPage.tsx         # صفحة الخدمات العامة (جديد)
├── dashboard/DashboardPage.tsx       # لوحة التحكم (API حقيقية)
├── campaigns/CampaignListPage.tsx    # قائمة الحملات (API حقيقية)
└── competitors/CompetitorsPage.tsx   # المنافسين (API حقيقي)

components/
├── layout/AppLayout.tsx              # إصلاح وسم main
├── ui/Logo.tsx                       # تحديث الشعار
└── social/AiReplyPanel.tsx           # معالجة async للاقتراحات
```

### 13.5 كل متغيرات البيئة المطلوبة للنشر

```env
# === الموقع ===
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_SITE_URL=https://azizmedia.site

# === قاعدة البيانات ===
DATABASE_URL=postgresql://<user>:<pass>@ep-mute-block-asozu4jp-pooler.c-4.eu-central-1.aws.neon.tech/neondb

# === JWT ===
JWT_ACCESS_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>

# === فيسبوك ===
FACEBOOK_PAGE_ACCESS_TOKEN=<page-token>

# === واتساب (Evolution API) ===
WHATSAPP_EVOLUTION_API_URL=https://evolution-api-production-5e16.up.railway.app
WHATSAPP_EVOLUTION_API_KEY=e94a419a-a8c3-4c42-9e2d-3f2f0e4dd2f5
WHATSAPP_DEFAULT_INSTANCE=marketron
```

### 13.6 أوامر النشر السريعة

```bash
# نشر تحديث جديد على Vercel (من مجلد frontend)
cd frontend
npx vercel --prod

# ربط alias بالدومين (بعد النشر)
npx vercel alias set <deployment-url> azizmedia.site

# Prisma (بعد أي تغيير في schema)
cd frontend
npx prisma generate
npx prisma db push
```

### 13.7 ملاحظات مهمة

- **Auth:** الـ Frontend يخزن التوكن في `localStorage` (`auth_token`) ويرسله كـ `Authorization: Bearer <token>`. API routes تقرأ من cookies + Bearer.
- **Facebook:** كل اتصالات فيسبوك تستخدم **Page Access Token** — لا App ID/Secret.
- **الصور:** AI image generation يستخدم Pollinations (مجاني) عبر Next.js API route.
- **البيانات:** لا توجد بيانات وهمية متبقية — كل البيانات من Facebook API مباشرة.
- **الواتساب:** Evolution API Instance (`marketron`) — في حالة "open" يتم logout أولاً ثم connect للحصول على QR جديد.
- **Namecheap:** السيرفر لسه pending — مستني welcome email.
