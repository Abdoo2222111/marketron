# 🚀 منصة التسويق الإلكتروني الشاملة (Marketing Platform)

> منصة متكاملة لإدارة الحملات الإعلانية على **فيسبوك، إنستجرام، تيك توك، سناب شات** — مع الذكاء الاصطناعي لتوليد المحتوى، تحليل المنافسين، أبحاث السوق، وتوصيات ذكية

## 📋 المميزات الرئيسية

| الميزة | الوصف |
|--------|-------|
| 🎯 **إدارة الحملات** | إنشاء، إدارة، تتبع جميع الحملات الإعلانية من مكان واحد |
| 🤖 **توليد المحتوى بالذكاء الاصطناعي** | نصوص إعلانية، صور، فيديوهات، هاشتاجات — بالعربية |
| 📊 **تحليلات متقدمة** | لوحة تحكم تفاعلية مع رسوم بيانية وتقارير PDF/Excel |
| 🔍 **تحليل المنافسين** | تتبع إعلانات المنافسين، تحليل استراتيجياتهم |
| 🌍 **أبحاث السوق** | تحليل أي منتج في أي سوق عربي (السعودية، الإمارات، مصر...) |
| 💡 **توصيات ذكية** | "ليه مش ببيع؟" + توصيات الميزانية والجمهور والتوقيت |
| 🔗 **ربط المنصات** | فيسبوك، إنستجرام، تيك توك، سناب شات — من واجهة واحدة |
| 👥 **إدارة الفريق** | صلاحيات مختلفة (مدير، محرر، مشاهد) |
| 📱 **دعم كامل للعربية** | واجهة RTL، أرقام عربية، تقارير بالعربية |

## 🏗️ المكونات

```
marketing-platform/
├── frontend/          # واجهة المستخدم (React + TypeScript + Tailwind)
├── backend/           # API Server (Node.js + Express + Prisma + PostgreSQL)
├── ai-services/       # خدمات الذكاء الاصطناعي (Python FastAPI + LangChain)
├── integrations/      # تكاملات المنصات الإعلانية (FB, IG, TikTok, Snap)
├── dashboard/         # لوحة التحكم والتحليلات (React + Recharts + AG Grid)
├── deployment/        # البنية التحتية والنشر (Docker, CI/CD, Vercel, Render)
├── shared/            # أنواع وواجهات مشتركة
└── scripts/           # سكريبتات مساعدة
```

## 🛠️ التقنيات

| المكون | التقنية |
|--------|---------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + React Query + Zustand |
| **Backend** | Node.js + Express + TypeScript + Prisma ORM |
| **Database** | PostgreSQL (Supabase / Neon) |
| **AI** | Python + FastAPI + LangChain + OpenAI + Anthropic |
| **Charts** | Recharts + D3.js |
| **Tables** | AG Grid Community |
| **PDF** | jsPDF + html2canvas |
| **Excel** | SheetJS (xlsx) |
| **Auth** | JWT + bcrypt |
| **CI/CD** | GitHub Actions |
| **Hosting** | Vercel (Frontend) + Render (Backend/AI) |
| **Storage** | Supabase Storage / Cloudinary |
| **Email** | Resend |
| **Monitoring** | Sentry + UptimeRobot |

## 🚀 البدء السريع (Local Development)

### المتطلبات
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- npm or yarn

### 1. تثبيت الاعتمادات
```bash
cd D:\marketing-platform

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install

# AI Services
cd ../ai-services && pip install -r requirements.txt

# Dashboard
cd ../dashboard && npm install
```

### 2. إعداد متغيرات البيئة
```bash
# انسخ ملفات .env.example
cp backend/.env.example backend/.env
cp ai-services/.env.example ai-services/.env
cp frontend/.env.example frontend/.env
```

### 3. تشغيل المشروع
```bash
# من المجلد الرئيسي
npm run dev
```

## 🌐 النشر (Deployment)

انظر [دليل النشر الكامل](deployment/GUIDE.md) للرفع على:
- **Vercel** (Frontend) — مجاني
- **Render** (Backend) — مجاني
- **Supabase** (Database) — مجاني
- **Railway** (AI Services) — مجاني

## 📄 الترخيص
MIT

## 👥 المساهمة
نرحب بالمساهمات! الرجاء فتح Issue أو Pull Request.

---

**بُني بـ ❤️ للسوق العربي**
