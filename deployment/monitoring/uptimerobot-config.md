# ⏱ مراقبة uptime باستخدام UptimeRobot
# UptimeRobot Configuration

## لماذا UptimeRobot؟ 🤔
- **50 monitor مجاناً** (فحص كل 5 دقائق)
- تنبيهات عبر Email (أو Telegram/Slack في الخطة المدفوعة)
- بسيط وسريع الإعداد
- يدعم HTTP(s), Ping, Port, Keyword

## 1️⃣ إنشاء حساب
1. اذهب إلى https://uptimerobot.com
2. سجّل مجاناً
3. بعد الدخول، اذهب إلى Dashboard ← "Add New Monitor"

## 2️⃣ إضافة المراقبات (Monitors)

### ✅ Monitor 1: Frontend
| الإعداد | القيمة |
|---------|--------|
| **Monitor Type** | HTTP(s) |
| **Friendly Name** | Marketing Platform - Frontend |
| **URL** | `https://marketing-platform.vercel.app` |
| **Monitoring Interval** | Every 5 minutes |
| **Port** | 443 |
| **Timeout** | 30 seconds |

### ✅ Monitor 2: Backend API
| الإعداد | القيمة |
|---------|--------|
| **Monitor Type** | HTTP(s) |
| **Friendly Name** | Marketing Platform - Backend API |
| **URL** | `https://marketing-platform-api.onrender.com/api/v1/health` |
| **Monitoring Interval** | Every 5 minutes |
| **Timeout** | 30 seconds |

### ✅ Monitor 3: AI Services
| الإعداد | القيمة |
|---------|--------|
| **Monitor Type** | HTTP(s) |
| **Friendly Name** | Marketing Platform - AI Services |
| **URL** | `https://marketing-ai-services.up.railway.app/health` |
| **Monitoring Interval** | Every 5 minutes |
| **Timeout** | 45 seconds (AI services may be slower) |

### ✅ Monitor 4: Database (Supabase)
| الإعداد | القيمة |
|---------|--------|
| **Monitor Type** | HTTP(s) |
| **Friendly Name** | Supabase Database |
| **URL** | `https://[project].supabase.co/rest/v1/` |
| **Monitoring Interval** | Every 5 minutes |
| **Timeout** | 30 seconds |

### ✅ Monitor 5: SSL Certificate
| الإعداد | القيمة |
|---------|--------|
| **Monitor Type** | SSL |
| **Friendly Name** | SSL Certificate |
| **URL** | `https://marketing-platform.vercel.app` |
| **Monitoring Interval** | Every 30 minutes |
| **Alert if expires in** | 14 days |

## 3️⃣ Keyword Monitoring (اختياري)
تأكد أن الـ API يرجع `"status": "healthy"`:

| الإعداد | القيمة |
|---------|--------|
| **Monitor Type** | Keyword HTTP(s) |
| **Friendly Name** | Backend Health Check |
| **URL** | `https://marketing-platform-api.onrender.com/api/v1/health` |
| **Keyword** | `"healthy"` |
| **Exists/Not Exists** | Exists |

## 4️⃣ تنبيهات (Alerts) عبر Telegram
1. اذهب إلى Settings → My Settings → Alert Contacts
2. أضف Telegram
3. اتبع التعليمات لربط بوت UptimeRobot
4. استلم إشعارات مباشرة عند أي downtime

## 5️⃣ Status Page (اختياري)
UptimeRobot يوفر صفحة حالة عامة:
1. اذهب إلى My Settings → Status Pages
2. أنشئ صفحة جديدة
3. اختر الـ Monitors اللي تظهر
4. شارك الرابط مع فريقك: `https://stats.uptimerobot.com/xxxxx`

## 💡 نصائح مهمة
- الـ Free Tier يفحص كل 5 دقائق - مقبول للتجربة
- لو احتجت فحص أسرع (كل دقيقة)، ارتقِ للخطة المدفوعة ($7/شهر)
- ضع monitors فرعية للـ API endpoints الحساسة (مثل /api/v1/auth/login)
- استخدم Status Page لتواصل الشفافية مع العملاء
- UptimeRobot + Sentry = تغطية كاملة (Uptime للموقع، Sentry للأخطاء)
