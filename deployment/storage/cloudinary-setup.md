# إعداد Cloudinary للتخزين (بديل Supabase Storage)
# Cloudinary Storage Setup (Alternative to Supabase Storage)

## لماذا Cloudinary؟ 🤔
- **حد مجاني**: 25GB تخزين + 25GB تحويل/شهر + 25GB باندwidth
- **معالجة صور**: تحويل تلقائي للأحجام، ضغط، Watermark
- **CDN**: توصيل سريع عالمياً
- **بديل ممتاز**: إذا نفد مساحة Supabase Storage

## 1️⃣ إنشاء حساب Cloudinary
1. اذهب إلى https://cloudinary.com
2. سجّل مجاناً (لا يحتاج بطاقة ائتمان)
3. بعد التسجيل، ستجد:
   - `CLOUDINARY_CLOUD_NAME` - اسم السحابة
   - `CLOUDINARY_API_KEY` - مفتاح API
   - `CLOUDINARY_API_SECRET` - السر

## 2️⃣ إضافة Cloudinary SDK للـ Backend
```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

## 3️⃣ إعداد Cloudinary في Backend
```typescript
// backend/src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const campaignImagesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'marketing-platform/campaign-images',
    allowed_formats: ['jpg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  },
});

export const brandLogosStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'marketing-platform/brand-logos',
    allowed_formats: ['jpg', 'png', 'svg', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fit', quality: 'auto' }],
  },
});

export default cloudinary;
```

## 4️⃣ رفع الملفات باستخدام Cloudinary
```typescript
// backend/src/api/routes/upload.ts
import { Router } from 'express';
import multer from 'multer';
import { campaignImagesStorage } from '../../config/cloudinary';

const router = Router();
const upload = multer({ storage: campaignImagesStorage });

router.post('/upload/campaign-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم رفع ملف' });
  }

  // req.file.path يحتوي على رابط Cloudinary
  res.json({
    url: req.file.path,
    publicId: (req.file as any).filename,
  });
});

export default router;
```

## 5️⃣ متغيرات البيئة
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abc123def456
```

## 6️⃣ تحويل الصور
```

## 6️⃣ تحويل الصور عبر URL (Image Transformations)
Cloudinary يتيح تحويل الصور أثناء التحميل عبر URL:
```html
<!-- تصغير الصورة -->
<img src="https://res.cloudinary.com/CLOUD_NAME/image/upload/w_300,h_300,c_fill/v123/photo.jpg" />

<!-- إضافة واجهة عربية -->
<img src="https://res.cloudinary.com/CLOUD_NAME/image/upload/ar_1/v123/photo.jpg" />

<!-- ضغط تلقائي -->
<img src="https://res.cloudinary.com/CLOUD_NAME/image/upload/q_auto/v123/photo.jpg" />
```

## مقارنة: Cloudinary vs Supabase Storage

| الميزة | Cloudinary | Supabase Storage |
|--------|------------|------------------|
| **الحد المجاني للتخزين** | 25GB | 1GB |
| **معالجة الصور** | ممتازة (تحويل، ضغط، Watermark) | محدودة |
| **CDN** | عالمي | محدود |
| **RLS / Permissions** | لا يدعم | يدعم RLS كامل |
| **التكامل مع Supabase Auth** | لا | نعم (سهل جداً) |

## 💡 نصيحة:
استخدم **Supabase Storage** للحماية (ملفات المستخدمين) و **Cloudinary** كبديل/مكمل للملفات العامة ومعالجة الصور.
