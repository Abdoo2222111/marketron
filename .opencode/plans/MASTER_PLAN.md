# 🚀 MASTER PLAN — MARKETRON AI Suite
## الخطة الشاملة للتطوير والرفع الدائم

> **تاريخ البدء:** 2026-07-03
> **الحالة:** 🏗️ قيد التنفيذ
> **آخر تحديث:** 2026-07-03

---

## 📋 الخدمات التي تحتاج Servers

| # | الخدمة | اللغة | البورت | المنصة |
|---|--------|-------|--------|--------|
| 1 | **Backend API** | Node.js (Express) | 4000 | Hugging Face Space |
| 2 | **AI Services** | Python (FastAPI) + Node | 8000 | Hugging Face Space |
| 3 | **Integrations** | Node.js (Express) | 3003 | Hugging Face Space |
| 4 | **Evolution API (WhatsApp)** | Node.js | 8080 | Hugging Face Space |
| 5 | **PostgreSQL** | — | 5432 | Supabase (مجاني) |
| 6 | **Redis** | — | 6379 | Upstash (مجاني) |
| 7 | **Frontend (Next.js)** | TypeScript/React | 3000 | Vercel (مجاني) |
| 8 | **Dashboard (Vite)** | TypeScript/React | 3001 | Vercel (مجاني) |

## 🛡️ أولويات الأمان

- [ ] إزالة الـ tokens المكشوفة من `.env.local` و `.env.vercel`
- [ ] إضافة `.env` files إلى `.gitignore` (مراجعة)
- [ ] إضافة GitHub Actions workflows
- [ ] تدوير (Rotate) كل الـ keys المكشوفة

## 🚀 خطة النشر على Hugging Face

- [ ] إنشاء Space على Hugging Face
- [ ] رفع Backend + AI + Integrations معاً
- [ ] رفع Evolution API
- [ ] تفعيل Keep-Alive الدائم
- [ ] اختبار التشغيل

## 🤖 نظام الرد الآلي

| المزود | الاستخدام | السعر |
|--------|-----------|-------|
| Gemini 2.0 Flash | محادثة سريعة | مجاني |
| DeepSeek Chat | ردود عميقة | $0.14/1M |
| Pollinations | صور + نصوص | مجاني |
| Groq | ردود سريعة | مجاني |

## 📊 خريطة الموقع — الصفحات المطلوبة

- [ ] /ar/dashboard/real-time — لوحة تحكم لحظية
- [ ] /ar/dashboard/ai-assistant — مساعد AI
- [ ] /ar/integrations — إدارة الاتصالات
- [ ] /ar/workflows — أتمتة المهام
- [ ] /ar/billing — الفواتير

## 💰 التكلفة = صفر ريال

| المنصة | الاستخدام |
|--------|-----------|
| Hugging Face Spaces | كل الـ Servers |
| Supabase | PostgreSQL |
| Upstash | Redis |
| Vercel | Frontend |
| Gemini API | AI مجاني |
