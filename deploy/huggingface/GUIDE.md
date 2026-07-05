# 🚀 HG (Взлом) — Permanent Server on Hugging Face

Complete setup for a permanent, always-on server on Hugging Face Spaces with auto-restart and cron job monitoring.

---

## 📋 مكونات التطبيق

### الملفات الرئيسية
- **Dockerfile** — تكوين Docker الأساسي
- **server.py** — تطبيق الخادم الرئيسي
- **app.py** — نقطة الدخول لتطبيق Hugging Face
- **start.sh** — سكريبت تشغيل الخادم
- **setup.sh** — سكريبت الإعداد الشامل
- **verify.sh** — سكريبت التحق苡ة والمراقبة

### ملفات التكوين
- **docker-compose.yml** — تكوين Docker Compose
- **huggingface.yaml** — تكوين Hugging Face Spaces
- **crontab.txt** — مهمة Cron الدائمة
- **keep-alive.sh** — سكريبت الحفاظ على الخادم

### المجلدات
- **logs/** — سجلات التشغيل
- **data/** — البيانات المخزنة
- **uploads/** — الملفات المرفوعة

---

## 🚀 خطوات التشغيل

### 1. الإعداد السريع (Quick Setup)

```bash
npm run setup
# أو
bash deploy/huggingface/setup.sh
```

### 2. التشغيل اليدوي

```bash
# بناء وتشغيل الوعاء (Container)
docker build -t hg-hack-server .
docker run -d --name hg_hack_server --restart always -p 8000:8000 hg-hack-server

# أو عبر Docker Compose
docker-compose up -d
```

### 3. إعداد مهمة Cron (للتشغيل الدائم)

تم إعداد مهمة Cron تلقائيا لتشغيل كل 5 دقائق:

```bash
# التحقق من وجود مهمة Cron
crontab -l | grep hg_hack_server

# إضافة مهمة يدويا (إذا لزم الأمر)
(crontab -l 2>/dev/null; echo "*/5 * * * * docker ps -q -f name=hg_hack_server > /dev/null || docker start hg_hack_server") | crontab -
```

---

## 📡 التأكد من تشغيل الخادم

### التحقق من حالة الخادم
```bash
# عبر سكريبت التحقق
bash deploy/huggingface/verify.sh

# أو أدواع التحقق المباشرة
curl http://localhost:8000
docker ps -f name=hg_hack_server
docker logs -f hg_hack_server
```

### إعادة تشغيل الخادم
```bash
docker restart hg_hack_server
```

---

## 📄 عرض السجلات

```bash
# سجلات الخادم
tail -f deploy/huggingface/logs/server.log

# سجلات Docker
docker logs -f --tail 100 hg_hack_server
```

---

## 📚 التوثيق

- **[DEPLOYMENT.md](../DEPLOYMENT.md)** — دليل النشر الكامل
- **[README.md](../README.md)** — تعليمات المشروع العامة

---

## 🛡️ مميزات النظام الدائم

- ✅ **تشغيل تلقائي**: يبدأ الخادم تلقائيا عند إعادة تشغيل النظام
- ✅ **مراقبة Cron**: تحقق من حالة الخادم كل 5 دقائق
- ✅ **إعادة التشغيل التلقائي**: إعادة تشغيل الخادم في حال توقفه
- ✅ **سجلات مفصلة**: تسجيل جميع الأحداث والأخطاء
- ✅ **تحقق صحّة**: endpoint للتحقق من حالة الخادم

---

## 🌐 الوصول

- **URL**: http://localhost:8000
- **API Health**: http://localhost:8000/health
- **Docker**: docker exec -it hg_hack_server /bin/bash

---

## 📝 ملاحظات

- تأكد من أن Docker يعمل بصلاحيات المسؤ privileges admin.
- في Windows، قد تحتاج إلى تشغيل الطلبيات في PowerShell مع صلاحيات المسؤول.
- لتعديل جدول Cron، استخدم: `crontab -e`
- لإيقاف الخادم نهائيا: `docker stop hg_hack_server && docker rm hg_hack_server`
