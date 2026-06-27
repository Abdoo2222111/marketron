# 🚀 نشر MARKETRON V2 — دليل كامل مجاني

## المتطلبات

- حساب Vercel (مجاني Hobby)
- حساب Railway (مجاني $5 credit/شهر)
- حساب Supabase (مجاني 500MB)
- مفتاح DeepSeek API (تسعير منخفض)
- الدومين `azizmedia.site` (مملوك مسبقاً)

## 1. نشر الفرونت إند (Vercel)

```bash
cd frontend
npx vercel --prod
```

**الإعدادات:**
- Framework: Next.js
- Root Directory: `frontend/`
- Build Command: `npm run build`
- Output: `.next`

**Variables البيئة:**
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_APP_NAME=MARKETRON
```

**الربط مع azizmedia.site:**
1. Vercel Dashboard → Project → Domains
2. أضف `app.azizmedia.site`
3. Vercel يعطي `cname.vercel-dns.com`
4. في DNS الخاص بـ azizmedia.site: أضف CNAME `app → cname.vercel-dns.com`

## 2. نشر الباك إند (Railway)

```bash
cd backend
# ادفع الكود إلى GitHub متصل بـ Railway
```

**Variables البيئة المطلوبة:**
```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=<random 64 char>
JWT_REFRESH_SECRET=<random 64 char>
FRONTEND_URL=https://app.azizmedia.site
CORS_ORIGIN=https://app.azizmedia.site
DEEPSEEK_API_KEY=<your-key>
WHATSAPP_EVOLUTION_API_URL=https://evolution-api.your-railway.app
WHATSAPP_EVOLUTION_API_KEY=<your-key>
```

**PostgreSQL:** استخدم Railway PostgreSQL plugin

## 3. نشر Evolution API (واتساب)

```bash
# في Railway مشروع منفصل
# استخدم Docker Image: evolution/evolution-api
# إعدادات: PORT=8080
# أضف PostgreSQL و Redis داخلياً
```

## 4. Supabase (تخزين الملفات)

```bash
# حساب مجاني 1GB
# أنشئ Buckets: assets, avatars, campaign-creatives
```

## 5. حدود الفريميوم (مهم!)

| الخدمة | الحد المجاني | عند الوصول |
|--------|-------------|------------|
| Vercel Hobby | 100GB bandwidth, 6000 build mins | ادعم أو ارفع لـ Pro ($20) |
| Railway Starter | $5 credit/شهر | أضف بطاقة ائتمان |
| Supabase Free | 500MB DB, 1GB Storage, 2GB bandwidth | امسح بيانات قديمة أو ارفع |
| DeepSeek API | Pay-per-use ~$0.14/1M tokens | ضع ceiling على API key |

## فحص التشغيل

```bash
# Backend health
curl https://your-backend.railway.app/api/v1/health

# Frontend
open https://app.azizmedia.site

# Evolution API
curl https://your-evolution.railway.app/manager/
```
