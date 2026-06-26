# 📧 إعداد خدمة البريد الإلكتروني - Resend
# Email Setup for Marketing Platform

## لماذا Resend؟ 🤔
- **100 إيميل/يوم مجاناً** ← كافي للتجربة الأولية
- SDK دعم ممتاز مع Node.js
- Delivery rate عالي
- بسيط وسهل الإعداد

## ✅ البدائل المجانية
| الخدمة | الحد المجاني | ملاحظات |
|--------|--------------|---------|
| **Resend** | 100/يوم | ⭐ الأفضل للتجربة |
| **Loops** | 1000/شهر | بسيط جداً |
| **SendGrid** | 100/يوم | من Twilio |
| **Mailgun** | 100/يوم | يحتاج verification |
| **Brevo (Sendinblue)** | 300/يوم | خطط مجانية سخية |

## 1️⃣ إنشاء حساب Resend
1. اذهب إلى https://resend.com
2. سجّل باستخدام GitHub أو Google
3. أكّد البريد الإلكتروني
4. اذهب إلى **API Keys** ← أنشئ مفتاح API جديد

## 2️⃣ إضافة API Key إلى متغيرات البيئة
```env
# backend/.env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@marketing-platform.com
```

## 3️⃣ تثبيت Resend SDK في Backend
```bash
cd backend
npm install resend
```

## 4️⃣ إنشاء خدمة البريد
```typescript
// backend/src/services/email.service.ts
import { Resend } from 'resend';
import { config } from '../config';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || 'noreply@marketing-platform.com',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('❌ Email send failed:', error);
      throw error;
    }

    console.log(`✅ Email sent to ${to}: ${data?.id}`);
    return data;
  } catch (error) {
    console.error('❌ Email service error:', error);
    throw error;
  }
}
```

## 5️⃣ قوالب الإيميلات

### 📩 ترحيب (Welcome)
```html
<h2>مرحباً بك في منصة التسويق الإلكتروني! 🚀</h2>
<p>شكراً لتسجيلك. ابدأ الآن في إنشاء حملاتك الإعلانية الأولى.</p>
<a href="{{loginUrl}}" style="background:#0070f3; color:white; padding:12px 24px; border-radius:6px; text-decoration:none;">
  ابدأ الآن
</a>
```

### 🔑 إعادة تعيين كلمة المرور (Password Reset)
```html
<h2>إعادة تعيين كلمة المرور</h2>
<p>لقد طلبت إعادة تعيين كلمة المرور. اضغط على الرابط أدناه:</p>
<a href="{{resetUrl}}" style="background:#0070f3; color:white; padding:12px 24px; border-radius:6px; text-decoration:none;">
  إعادة تعيين كلمة المرور
</a>
<p>ينتهي الرابط بعد ساعة واحدة.</p>
```

### 📊 تقرير الحملة (Campaign Report)
```html
<h2>تقرير حملتك: {{campaignName}}</h2>
<table>
  <tr><td>مرات الظهور</td><td>{{impressions}}</td></tr>
  <tr><td>النقرات</td><td>{{clicks}}</td></tr>
  <tr><td>التحويلات</td><td>{{conversions}}</td></tr>
  <tr><td>الإنفاق</td><td>\${{spend}}</td></tr>
  <tr><td>ROAS</td><td>{{roas}}x</td></tr>
</table>
<a href="{{reportUrl}}">عرض التقرير الكامل →</a>
```

### 💳 فاتورة (Invoice)
```html
<h2>فاتورة جديدة - {{invoiceNumber}}</h2>
<p>المبلغ: \${{amount}}</p>
<p>التاريخ: {{date}}</p>
<a href="{{invoiceUrl}}">عرض الفاتورة →</a>
```

## 6️⃣ إعداد Domain مخصص (للاستخدام الإنتاجي)
1. أضف TXT record في DNS لإثبات ملكية النطاق
2. Resend سيوفر MX و SPF records لتوصيل أفضل
3. الانتظار 24-48 ساعة لنشر DNS

## 7️⃣ بديل: Loops (للتجربة السريعة)
```typescript
// أبسط بديل - API واحد
const response = await fetch('https://app.loops.so/api/v1/transactional', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.LOOPS_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    transactionalId: 'your-template-id',
    email: 'user@example.com',
    dataVariables: { name: 'أحمد' },
  }),
});
```

## 🔐 مهم: حماية API Keys
- **لا تشارك** RESEND_API_KEY في GitHub
- استخدم GitHub Secrets في CI/CD
- فعّل Rate Limiting على SMTP endpoints
