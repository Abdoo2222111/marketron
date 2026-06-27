# 🚀 MARKETRON AI Suite — منصة إدارة الحملات الإعلانية الذكية

> منصة SaaS متكاملة تجمع بين إدارة الحملات الإعلانية (فيسبوك، إنستجرام، Google، TikTok)، توليد المحتوى بالذكاء الاصطناعي، تحليل الأداء، الرد الآلي على واتساب، وتقارير ذكية — كل هذا في لوحة تحكم واحدة.

## 📋 المميزات الرئيسية

| الميزة | الوصف |
|--------|-------|
| 🎯 **إدارة الحملات** | إنشاء، إدارة، تتبع جميع الحملات الإعلانية من مكان واحد مع دعم Meta وGoogle وTikTok |
| 🤖 **توليد المحتوى بالذكاء الاصطناعي** | نصوص إعلانية، صور، توصيات — بالعربية والإنجليزية. يدعم 8 مزودين (OpenAI, Claude, Gemini, Groq, DeepSeek...) |
| 📊 **تحليلات متقدمة** | لوحة تحكم تفاعلية مع رسوم بيانية، تقارير PDF/Excel، تحليل الجمهور والأداء |
| 🔍 **تحليل المنافسين** | تتبع إعلانات المنافسين، تحليل استراتيجياتهم، مقارنة الأداء |
| 💡 **توصيات ذكية** | "ليه مش ببيع؟" — تحليل عميق لأسباب ضعف المبيعات + توصيات قابلة للتنفيذ |
| 📱 **واتساب موحّد** | Unified Inbox مع Evolution API — ردود تلقائية ذكية، تحويل للموظف البشري، قواعد تصنيف |
| 👥 **إدارة الفريق** | صلاحيات مختلفة (مالك، مدير، عضو) مع Workspace متعدد المستأجرين |
| 🔐 **متعدد المستأجرين (Multi-Tenant)** | البنية تدعم منظمات متعددة من اليوم الأول |
| 🌐 **عربي / English** | دعم كامل للعربية RTL كلغة أساسية + الإنجليزية كلغة ثانية |

## 🏗️ المكونات

```
marketing-platform/
├── frontend/           # Next.js 14 + TypeScript + Tailwind + shadcn/ui (Vercel)
├── backend/            # Express + Prisma + PostgreSQL (Railway)
│   ├── prisma/         # 30+ نموذج قاعدة بيانات
│   └── src/
│       ├── routes/     # 15 وحدة مسارات
│       ├── services/   # 16 خدمة أعمال
│       ├── middleware/  # Auth, error, rate-limit, CSRF
│       └── integrations/ # AI (8 مزودين), Meta Graph, Evolution API
├── ai-services/        # خدمات AI إضافية (Python FastAPI + Node.js)
├── integrations/       # تكاملات منصات الإعلانات (OAuth + API)
├── dashboard/          # لوحة تحكم وتحليلات (React + Recharts + AG Grid)
├── shared/             # أنواع TypeScript مشتركة
├── evolution-api-deploy/ # Dockerfile لـ Evolution API
└── deployment/         # Docker, CI/CD, nginx, scripts
```

## 🛠️ التقنيات

| المكون | التقنية | الاستضافة |
|--------|---------|-----------|
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui | Vercel (مجاني) |
| **Backend** | Express + TypeScript + Prisma ORM | Railway (مجاني) |
| **Database** | PostgreSQL 15 | Railway (مجاني) |
| **Cache** | Redis | Railway (مجاني) |
| **WhatsApp** | Evolution API (Docker) | Railway (مجاني) |
| **AI Layer** | 8 مزودين (OpenAI, Claude, Gemini, Groq, DeepSeek, Mistral, Cohere, Perplexity) | — |
| **File Storage** | Supabase Storage (1GB مجاني) | Supabase (مجاني) |
| **Auth** | JWT (access + refresh) + bcrypt | — |
| **Charts** | Recharts + D3.js | — |
| **Forms** | react-hook-form + zod | — |
| **i18n** | i18next + react-i18next (415 مفتاح لكل لغة) | — |

## 🚀 النشر المباشر (Already Deployed)

| الخدمة | الرابط | الحالة |
|--------|--------|--------|
| **Frontend** | https://frontend-one-virid-95.vercel.app | ✅ شغال |
| **Backend API** | https://marketron-backend-production.up.railway.app | ✅ شغال |
| **Evolution API** | https://evolution-api-production-5e16.up.railway.app | ✅ شغال |
| **Health Check** | https://marketron-backend-production.up.railway.app/api/v1/health | ✅ شغال |

## 🚀 البدء السريع (Local Development)

```bash
# 1. Clone
git clone https://github.com/Abdoo2222111/marketron.git
cd marketron

# 2. Backend
cd backend
cp .env.example .env.local  # عدّل القيم
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# 3. Frontend (نافذة جديدة)
cd frontend
npm install
npm run dev
```

## 📚 التوثيق

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — البنية التقنية الكاملة
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — دليل النشر المجاني (عربي)
- [`WHATSAPP_SETUP.md`](WHATSAPP_SETUP.md) — ربط واتساب عبر Evolution API
- [`DECISIONS.md`](DECISIONS.md) — القرارات التقنية ولماذا
- [`backend/.env.example`](backend/.env.example) — كل المتغيرات البيئية

## 📄 الترخيص
MIT

---

**بُني بـ ❤️ للسوق العربي — MARKETRON AI Suite**
