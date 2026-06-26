# توثيق تكامل Instagram

## نظرة عامة
تكامل Instagram يعمل عبر Facebook Graph API (نفس نظام المصادقة).
يتطلب حساب أعمال Instagram (Instagram Business Account) مرتبط بصفحة Facebook.

**إصدار API**: v20.0  
**الرابط الأساسي**: `https://graph.facebook.com/v20.0`  
**نوع المصادقة**: OAuth 2.0 عبر Facebook Login

## الفرق عن Facebook Ads
Instagram لا يحتوي على OAuth منفصل - يستخدم نفس رمز Facebook مع صلاحيات إضافية.

### صلاحيات إضافية مطلوبة
| الصلاحية | الوصف |
|---------|-------|
| `instagram_basic` | قراءة المعلومات الأساسية لحساب Instagram |
| `instagram_content_publish` | نشر المحتوى على Instagram |
| `instagram_manage_comments` | إدارة التعليقات |
| `instagram_manage_messages` | إدارة الرسائل |
| `pages_read_engagement` | قراءة تفاعلات الصفحة المرتبطة |

## خطوات ربط الحساب

### 1. ربط صفحة Facebook بحساب Instagram
1. اذهب إلى صفحة Facebook → Settings → Instagram
2. اربط حساب Instagram Business
3. تأكد من أن الحساب هو Business Account (وليس Personal)

### 2. تكوين التكامل
```
1. أكمل خطوات Facebook OAuth
2. استخدم Facebook token للوصول إلى Instagram API
3. احصل على Instagram Business Account ID من صفحة Facebook
```

## الـ Endpoints المستخدمة

### المصادقة (نفس Facebook)
| الغرض | الـ Endpoint |
|-------|-------------|
| الحصول على IG Business ID | `GET /{page_id}?fields=instagram_business_account` |

### المحتوى
| العملية | الـ Endpoint |
|---------|-------------|
| قراءة المنشورات | `GET /{ig-user-id}/media` |
| معلومات منشور | `GET /{media-id}` |
| إنشاء حاوية نشر | `POST /{ig-user-id}/media` |
| نشر الحاوية | `POST /{ig-user-id}/media_publish` |
| قراءة التعليقات | `GET /{media-id}/comments` |
| الرد على تعليق | `POST /{comment-id}/replies` |
| حذف تعليق | `DELETE /{comment-id}` |

### القصص (Stories)
| العملية | الـ Endpoint |
|---------|-------------|
| قراءة القصص النشطة | `GET /{ig-user-id}/stories` |
| معلومات قصة | `GET /{story-id}` |
| تحليلات القصة | `GET /{story-id}/insights` |
| الإبرازات (Highlights) | `GET /{ig-user-id}/highlights` |

### التحليلات
| العملية | الـ Endpoint |
|---------|-------------|
| تحليلات الحساب | `GET /{ig-user-id}/insights` |
| تحليلات المنشور | `GET /{media-id}/insights` |
| تحليلات القصة | `GET /{story-id}/insights` |
| الجمهور الديموغرافي | `GET /{ig-user-id}/insights?metric=audience_gender_age,audience_city,audience_country` |

**مقاييس تحليلات الحساب:** `impressions, reach, profile_views, follower_count`
**مقاييس تحليلات المنشور:** `engagement, impressions, reach, saved, video_views`

## حدود Rate Limits
- **حد الطلبات الأساسي**: 200 request/hour لكل مستخدم
- **نشر المحتوى**: 25 post/day لكل حساب
- **قراءة التحليلات**: 200 request/day لكل مستخدم

## هيكل البيانات

### Media Item
```typescript
{
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL';
  mediaUrl: string;
  permalink: string;
  caption?: string;
  thumbnailUrl?: string;
  timestamp: string;
  username: string;
  likeCount: number;
  commentsCount: number;
  isCommentEnabled: boolean;
}
```

## معالجة الأخطاء
انظر توثيق Facebook Ads - نفس رموز الأخطاء مع أخطاء إضافية:

| الرمز | الرسالة (عربي) |
|-------|----------------|
| `2207001` | لا يمكن نشر هذا المحتوى في الوقت الحالي |
| `2207002` | تم تجاوز حد النشر اليومي |

## ملاحظات مهمة
- يجب أن يكون حساب Instagram من نوع **Business Account**
- لا يمكن إنشاء إعلانات Instagram مباشرة - يجب استخدام Facebook Ads Manager
- Instagram Stories تنتهي بعد 24 ساعة
- الـ Reels يمكن مشاركتها إلى Facebook
- الصور يجب أن تكون بنسبة عرض إلى ارتفاع 1:1 أو 4:5 للفيد
- الحد الأقصى لحجم الفيديو: 100MB
- الحد الأقصى لطول الفيديو في القصة: 60 ثانية
