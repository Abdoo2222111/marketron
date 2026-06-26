# 🚀 دليل نشر منصة التسويق الإلكتروني

> دليل خطوة بخطوة لنشر المنصة مجاناً على Vercel + Render + Supabase

---

## 🏗️ معمارية النشر

```
[المستخدم] → [Vercel (Frontend)] → [Render (Backend API)] → [Supabase (PostgreSQL)]
                                       ↕
                                 [Railway (AI Services)]
```

---

## 1️⃣ قاعدة البيانات - Supabase (مجاناً)

### الخطوات:
1. **إنشاء حساب** على [supabase.com](https://supabase.com) (استخدم GitHub)
2. **إنشاء مشروع جديد**:
   - الاسم: `marketing-platform`
   - كلمة مرور قاعدة البيانات (احفظها)
   - المنطقة: `South East Asia (Singapore)` أو `Middle East (Bahrain)` للسرعة الأقل
3. **انتظر** حتى ينتهي التجهيز (2-3 دقائق)
4. **اذهب لـ Project Settings → Database** وانسخ `Connection String`
5. **اذهب لـ SQL Editor**، الصق محتوى `deployment/database/schema.sql` وشغّله

### متغيرات البيئة:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```

---

## 2️⃣ Frontend - Vercel (مجاناً)

### الخطوات:
1. **ارفع الكود** على GitHub:
   ```bash
   cd D:\marketing-platform
   git init
   git add .
   git commit -m "Initial commit"
   # أنشئ repo على GitHub واربطه
   git remote add origin https://github.com/YOUR_USER/marketing-platform.git
   git push -u origin main
   ```

2. **اربط مع Vercel**:
   - اذهب إلى [vercel.com](https://vercel.com)
   - سجل الدخول بـ GitHub
   - Import Repository: `marketing-platform`
   - إعدادات المشروع:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL=https://your-backend.onrender.com/api/v1`
   - انقر **Deploy** ✅

3. **بعد النشر**:
   - ستحصل على رابط مثل: `https://marketing-platform.vercel.app`
   - هذا الرابط ستدخله في CORS بـ Backend

---

## 3️⃣ Backend API - Render (مجاناً)

### الخطوات:
1. **اذهب إلى** [render.com](https://render.com) وسجل بـ GitHub
2. **اختار New + Web Service**:
   - Connect Repository: `marketing-platform`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

3. **Environment Variables** (مهم جداً):
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<من Supabase>
   JWT_SECRET=<جملة عشوائية طويلة>
   JWT_REFRESH_SECRET=<جملة عشوائية طويلة>
   FRONTEND_URL=https://marketing-platform.vercel.app
   CORS_ORIGINS=https://marketing-platform.vercel.app,http://localhost:5173
   OPENAI_API_KEY=<اختياري>
   ANTHROPIC_API_KEY=<اختياري>
   REDIS_URL=<اختياري>
   ```

4. **انقر Create Web Service** (ينتظر 3-5 دقائق للبناء)
5. **سجل الرابط**: `https://your-app.onrender.com`

---

## 4️⃣ AI Services - Railway (مجاناً)

### الخطوات:
1. **اذهب إلى** [railway.app](https://railway.app) وسجل بـ GitHub
2. **New Project → Deploy from GitHub repo**
3. **حدد Root Directory**: `ai-services`
4. **إعدادات النشر** (في `railway.json`):
   - **Build**: `pip install -r requirements.txt`
   - **Start**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

5. **Environment Variables**:
   ```
   OPENAI_API_KEY=<مفتاح OpenAI>
   ANTHROPIC_API_KEY=<مفتاح Anthropic>
   BACKEND_URL=https://your-backend.onrender.com
   ```

6. **انقر Deploy**

---

## 5️⃣ ربط كل الخدمات مع بعضها

بعد نشر كل الخدمات:

1. **في Vercel** (Frontend):
   ```
   VITE_API_URL=https://your-backend.onrender.com/api/v1
   ```

2. **في Render** (Backend):
   ```
   FRONTEND_URL=https://marketing-platform.vercel.app
   AI_SERVICE_URL=https://your-ai-service.up.railway.app
   ```

3. **في Railway** (AI):
   ```
   CORS_ORIGINS=https://marketing-platform.vercel.app,https://your-backend.onrender.com
   ```

---

## 6️⃣ Domain مخصص (اختياري)

- **Vercel**: Settings → Domains → أضف `marketing-platform.com`
- **Render**: Settings → Custom Domain
- **SSL**: تلقائي عبر Vercel/Render

---

## 7️⃣ CI/CD (نشر تلقائي)

كل ما تعمل `git push`:
- **Frontend**: GitHub Action ينشر على Vercel تلقائياً
- **Backend**: GitHub Action ينشر على Render تلقائياً
- **AI**: GitHub Action ينشر على Railway تلقائياً

انظر ملفات:
- `.github/workflows/frontend.yml`
- `.github/workflows/backend.yml`
- `.github/workflows/ai-services.yml`

---

## 8️⃣ اختبار أن كل شيء شغال

```bash
# Frontend
curl https://marketing-platform.vercel.app

# Backend Health Check
curl https://your-backend.onrender.com/api/v1/health

# AI Services
curl https://your-ai-service.up.railway.app/health

# API Docs (Swagger)
https://your-backend.onrender.com/api-docs
```

---

## 9️⃣ ترقية من Free Tier

| الخدمة | Free Limit | أول ترقية |
|--------|-----------|-----------|
| **Vercel** | 100 GB bandwidth, 6000 build mins | Pro $20/شهر |
| **Render** | 750 hours/شهر, 512 MB RAM | Starter $7/شهر |
| **Supabase** | 500 MB DB, 1 GB storage | Pro $25/شهر |
| **Railway** | $5 credit/شهر | Developer $20/شهر |

---

## 📱 متغيرات البيئة الكاملة

```env
# Backend
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://marketing-platform.vercel.app
CORS_ORIGINS=https://marketing-platform.vercel.app,http://localhost:5173
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=redis://...
STORAGE_TYPE=supabase
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SENTRY_DSN=https://...
RESEND_API_KEY=re_...

# Frontend
VITE_API_URL=https://your-backend.onrender.com/api/v1
VITE_AI_URL=https://your-ai-service.up.railway.app
VITE_APP_NAME=منصة التسويق الإلكتروني

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
BACKEND_URL=https://your-backend.onrender.com
CORS_ORIGINS=https://marketing-platform.vercel.app,https://your-backend.onrender.com
```

---

## 🐛 مشاكل وحلول شائعة

| المشكلة | الحل |
|---------|------|
| CORS Error | تأكد من وجود `FRONTEND_URL` الصحيح في Backend |
| Database Connection Refused | شيك على Supabase IP allow list أو Restart project |
| Build Fail on Render | تأكد من `Root Directory` = `backend` |
| 404 on API Routes | تأكد من الـ routes تبدأ بـ `/api/v1/` |
| Images not loading | استخدم Cloudinary أو Supabase Storage URL |
| AI returns English | تأكد من أن الـ system prompts بالعربية |

---

**تم بناء المنصة بدقة واحترافية** — أي مشكلة، افتح Issue أو راجع `deployment/` للمزيد من التفاصيل. 🚀
