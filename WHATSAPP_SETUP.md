# 📱 MARKETRON — دليل ربط واتساب عبر Evolution API

## 🎯 المكونات

```
Evolution API (Docker on Railway) ←→ WhatsApp Servers
       ↓ Webhook
Backend API (Railway)
       ↓
   AiAgent Service (Auto-Reply)
```

## ✅ الخطوات

### 1. تأكد من تشغيل Evolution API

```bash
# تحقق من حالة الخدمة
railway service status --service evolution-api
# ← Expected: Status: SUCCESS

# اختبر الـ Manager
curl https://evolution-api-production-5e16.up.railway.app/manager/
# ← يجب أن يعيد صفحة HTML (مدير Evolution API)
```

### 2. أنشئ Instance واتساب

```bash
curl -X POST "https://evolution-api-production-5e16.up.railway.app/instance/create" \
  -H "apikey: eko_jefap16lt9u52cw3dovn7xgirhzbm0qs4k8y" \
  -H "Content-Type: application/json" \
  -d '{"instanceName":"marketron","qrcode":true,"integration":"WHATSAPP-BAILEYS"}'

# ← سيعيد JSON فيه QR code base64 + pairing code
```

### 3. امسح QR code

1. افتح واتساب على هاتفك
2. الإعدادات → الأجهزة المرتبطة → ربط جهاز
3. امسح الـ QR code الظاهر (استخدم `qrcode.base64` وحوله لصورة أو اطّلع على رابط)
4. أو استخدم `pairingCode` (رمز الاقتران) في بعض النسخ

بعد المسح: يتغير الـ status من `connecting` → `connected`

### 4. ربط Webhook

```bash
curl -X POST "https://evolution-api-production-5e16.up.railway.app/webhook/set" \
  -H "apikey: eko_jefap16lt9u52cw3dovn7xgirhzbm0qs4k8y" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook":{
      "url":"https://marketron-backend-production.up.railway.app/api/v1/social/webhook/evolution",
      "events":["MESSAGES_UPSERT","QRCODE_UPDATED","CONNECTION_UPDATE"]
    }
  }'
```

الـ webhook سيرسل events إلى:

| Event | الوصف |
|-------|-------|
| `MESSAGES_UPSERT` | رسالة واردة جديدة |
| `QRCODE_UPDATED` | تحديث QR code |
| `CONNECTION_UPDATE` | تغير حالة الاتصال |

### 5. اختبر الإرسال

```bash
# إرسال رسالة نصية
curl -X POST "https://evolution-api-production-5e16.up.railway.app/message/sendText/marketron" \
  -H "apikey: eko_jefap16lt9u52cw3dovn7xgirhzbm0qs4k8y" \
  -H "Content-Type: application/json" \
  -d '{"number":"9665XXXXXXXXX","text":"مرحباً! هذه رسالة اختبار من MARKETRON 🤖","delay":1200}'
```

### 6. الرد الآلي

في واجهة MARKETRON:
1. اذهب إلى AI Agents → أنشئ وكيل جديد
2. ضبط إعدادات الرد:
   - **الوضع:** تلقائي / اقتراح فقط
   - **اللغة:** العربية
   - **قواعد الرد:** (اختياري) كلمات مفتاحية تحفّز الرد التلقائي
3. حفظ

كل رسالة واردة ستمر عبر:
```
Evolution API → Webhook → Backend → AiAgent → AI Reply
```

## 🔄 حالات الـ Instance

| الحالة | المعنى |
|--------|--------|
| `connecting` | في انتظار مسح QR |
| `connected` | الرقم متصل وجاهز |
| `disconnected` | انقطع الاتصال (يحتاج إعادة مسح QR) |
| `expired` | انتهت صلاحية QR |

## ⚙️ ضبط متقدم

```bash
# تغيير اسم الـ instance
curl -X POST "https://evolution-api-production-5e16.up.railway.app/instance/settings/marketron" \
  -H "apikey: eko_jefap16lt9u52cw3dovn7xgirhzbm0qs4k8y" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectCall": false,
    "msgCall": "",
    "groupsIgnore": false,
    "alwaysOnline": false,
    "readMessages": true,
    "readStatus": false,
    "syncFullHistory": true
  }'

# إعادة تشغيل الـ instance
curl -X POST "https://evolution-api-production-5e16.up.railway.app/instance/restart/marketron" \
  -H "apikey: eko_jefap16lt9u52cw3dovn7xgirhzbm0qs4k8y"

# جلب QR code جديد
curl -X GET "https://evolution-api-production-5e16.up.railway.app/instance/qrcode/marketron" \
  -H "apikey: eko_jefap16lt9u52cw3dovn7xgirhzbm0qs4k8y"
```

## ❌ استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| QR code لا يظهر | تأكد من أن `instance` في حالة `connecting` |
| Webhook لا يستقبل رسائل | تحقق من أن الـ Webhook URL صحيح وأن الـ backend يعمل |
| الإرسال يفشل (403) | مفتاح API غير صحيح — تحقق من `apikey` في الهيدر |
| الرد الآلي لا يعمل | تحقق من تفعيل Auto-Reply في AI Agents في الإعدادات |
| الاتصال ينقطع | فعّل `alwaysOnline: true` في إعدادات الـ instance |
