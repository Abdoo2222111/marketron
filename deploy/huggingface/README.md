# 🚀 HG (Взلом) — Permanent Server on Hugging Face

Complete setup for a permanent, always-on server on Hugging Face Spaces with auto-restart and cron job monitoring.

---

## 🌐 روابط

- **Hugging Face Space**: [Your Space URL]
- **API Health**: `/health`
- **Status Page**: `/`

---

## 📋 مكونات التطبيق

### الملفات الرئيسية
- **app.py** — نقطة الدخول لتطبيق Hugging Face
- **server.py** — تطبيق الخادم الرئيسي
- **keep_alive.py** — سكريبت الحفاظ على الخادم
- **start.sh** — سكريبت تشغيل الخادم
- **setup_hf.py** — سكريبت رفع المشروع على HF

### ملفات التكوين
- **Dockerfile** — تكوين Docker
- **requirements.txt** — متطلب Python
- **.gitignore** — استثناءات Git

---

## 🚀 خطوات الإعداد السريع

### 1. إنشاء Space على Hugging Face

1. اذهب إلى [Hugging Face Spaces](https://huggingface.co/spaces)
2. انقر على "Create new Space"
3. اختر "Docker" كـ SDK
4. املأ المعلومات:
   - **Space name**: hg-hack-server
   - **License**: MIT
   - **Hardware**: CPU Basic (مجاني)

### 2. رفع الملفات

#### الطريقة 1: Git
```bash
git clone https://huggingface.co/spaces/YOUR_USERNAME/hg-hack-server
cd hg-hack-server
cp -r ../deploy/huggingface/* .
git add .
git commit -m "Initial deployment"
git push
```

#### الطريقة 2: GitHub Actions (أوتوماتيكي)
1. انقر على "Files" → "Upload files"
2. ارفع جميع ملفات المشروع
3. أو استخدم سكريبت الرفع (انظر أدناه)

### 3. التحقق من التشغيل

```bash
# عبر الواجهة
https://YOUR_USERNAME-hf-hack-server.hf.space

# عبر API
https://YOUR_USERNAME-hf-hack-server.hf.space/health
```

---

## 🔄 الإعداد الدائم

### إعداد Cron داخل HF Space

يتم تفعيل Cron تلقائيا عبر `keep_alive.py`:

- يفحص الخادم كل 60 ثانية
- يعيد تشغيله في حال توقف
- يسجل جميع الأحداث في `logs/`

### متغيرات البيئة (اختياري)

يمكنك إضافة هذه المتغيرات في إعدادات Space:

```
PORT=7860
LOG_LEVEL=info
NODE_ENV=production
```

---

## 🛡️ مميزات النظام الدائم

- ✅ **تشغيل تلقائي**: يبدأ الخادم تلقائيا عند إعادة تشغيل النظام
- ✅ **مراقبة الحالة**: يتحقق من حالة الخادم كل 60 ثانية
- ✅ **إعادة التشغيل التلقائي**: إعادة تشغيل الخادم في حال توقفه
- ✅ **سجلات مفصلة**: تسجيل جميع الأحداث والأخطاء
- ✅ **تحقق صحّى**: endpoint للتحقق من حالة الخادم

---

## 📊 المراقبة

### عرض السجلات
```bash
# عبر Hugging Face Logs
# Space → Logs tab

# أو عبر API
curl https://YOUR_SPACE.hf.space/logs
```

### إعادة تشغيل يدوي
```bash
# عبر HF Dashboard
# Space → Factory Reset (ملاحظة: يحذف البيانات)
```

---

## 📝 ملاحظات مهمة

### حدود Hugging Face Free Tier
- **CPU**: 2 vCPU
- **RAM**: 16 GB
- **Storage**: 50 GB
- **Uptime**: دائم (مع Factory Reset كل 72 ساعة = يحذف البيانات)

### الحلول لاحتفاظ البيانات
> ⚠️ Hugging Face Spaces يحذف البيانات عند Factory Reset

 استخدم قاعدة بيانات خارجية:
  - **Supabase** (مجاني 500MB)
  - **Railway** PostgreSQL
  - **MongoDB Atlas**
  - أو أي قاعدة بيانات سحابية

---

## 🆘 الدعم

- **مشاكل التشغيل**: تحقق من Logs tab في HF
- **الخادم لا يعمل**: استخدم Factory Reset (يحذف البيانات)
- **تغييرات غير محفوظة**: استخدم قاعدة بيانات خارجية

---

## 🎉 الحالة النهائية

| المهمة | الحالة |
|--------|--------|
| Docker Config | ✅ تم |
| Keep Alive | ✅ تم |
| Health Check | ✅ تم |
| Auto Restart | ✅ تم |
| Logging | ✅ تم |

</cursor> تم إعداد كل شيء ليكون الخادم **دائم ولا يتوقف أبدا**! 🚀
