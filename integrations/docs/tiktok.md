# توثيق تكامل TikTok Ads

## نظرة عامة
تكامل TikTok Ads يسمح للمنصة بالاتصال بحسابات إعلانات TikTok عبر TikTok Business API.

**إصدار API**: v1.3  
**الرابط الأساسي**: `https://ads.tiktok.com/open_api/v1.3/`  
**رابط OAuth**: `https://ads.tiktok.com/marketing_api/auth/`  
**نوع المصادقة**: OAuth 2.0 + PKCE

## خطوات ربط الحساب

### 1. إنشاء تطبيق TikTok
1. اذهب إلى [TikTok for Developers](https://developers.tiktok.com)
2. أنشئ تطبيق جديد (Business App)
3. فعّل "Marketing API" و "Business API"
4. سجّل App ID و App Secret

### 2. تكوين OAuth مع PKCE
TikTok يدعم PKCE (Proof Key for Code Exchange) لزيادة أمان OAuth:
```
1. أضف redirect URI: {BASE_URL}/api/v1/platforms/callback/tiktok
2. فعّل OAuth 2.0 في إعدادات التطبيق
3. حدد الصلاحيات المطلوبة
```

### 3. الصلاحيات المطلوبة
| الصلاحية | الوصف |
|---------|-------|
| `user.info.basic` | المعلومات الأساسية للمستخدم |
| `user.info.profile` | معلومات الملف الشخصي |
| `ad.management` | إدارة الحملات والإعلانات |
| `business.management` | إدارة أعمال TikTok |
| `audience.management` | إدارة الجماهير |
| `creative.management` | إدارة المحتوى الإبداعي |

## الـ Endpoints المستخدمة

### المصادقة
| الغرض | الـ Endpoint |
|-------|-------------|
| رابط OAuth | `https://ads.tiktok.com/marketing_api/auth/` |
| استبدال الكود بالتوكن | `POST /oauth2/access_token/` |
| تحديث التوكن | `POST /oauth2/refresh_token/` |

### الحملات
| العملية | الـ Endpoint |
|---------|-------------|
| قراءة الحملات | `POST /campaign/get/` |
| إنشاء حملة | `POST /campaign/create/` |
| تحديث حملة | `POST /campaign/update/` |
| إيقاف/تفعيل | `POST /campaign/update/status/` |

### المجموعات الإعلانية
| العملية | الـ Endpoint |
|---------|-------------|
| قراءة المجموعات | `POST /adgroup/get/` |
| إنشاء مجموعة | `POST /adgroup/create/` |
| تحديث مجموعة | `POST /adgroup/update/` |

### الإعلانات
| العملية | الـ Endpoint |
|---------|-------------|
| قراءة الإعلانات | `POST /ad/get/` |
| إنشاء إعلان | `POST /ad/create/` |
| تحديث إعلان | `POST /ad/update/` |

### التحليلات
| المقياس | الـ Endpoint |
|---------|-------------|
| تقرير شامل | `POST /report/integrated/get/` |
| تقرير حسب اليوم | `POST /report/integrated/get/?dimensions=day` |
| تقرير الحملات | `POST /report/campaign/get/` |

**المقاييس المدعومة:** `impressions, clicks, spend, ctr, cpc, conversion, conversion_rate, cost_per_conversion, reach, frequency, cpm, video_views, video_views_rate, video_views_3s, video_watched_2s, video_watched_6s, video_watched_full, total_page_view`

### المحتوى الإبداعي (Creative)
| العملية | الـ Endpoint |
|---------|-------------|
| رفع صورة | `POST /file/image/upload/` |
| رفع فيديو | `POST /file/video/upload/` |
| قائمة الصور | `GET /file/image/get/` |
| قائمة الفيديوهات | `GET /file/video/get/` |
| إنشاء إعلان إبداعي | `POST /creative/create/` |
| تحديث إعلان إبداعي | `POST /creative/update/` |
| حذف إعلان إبداعي | `POST /creative/delete/` |
| قائمة الإعلانات الإبداعية | `POST /creative/get/` |

### الجمهور
| العملية | الـ Endpoint |
|---------|-------------|
| البحث عن استهداف | `POST /targeting/search/` |
| قائمة الجماهير | `POST /audience/list/` |
| إنشاء جمهور | `POST /audience/create/` |

### الهوية
| العملية | الـ Endpoint |
|---------|-------------|
| قائمة الهويات | `GET /identity/get/` |

## هيكل البيانات

### Campaign (خام)
```typescript
{
  campaign_id: string;
  campaign_name: string;
  objective: string;         // CONVERSIONS, REACH, TRAFFIC, VIDEO_VIEWS, ...
  status: string;            // CAMPAIGN_STATUS_ENABLE, CAMPAIGN_STATUS_DISABLE
  budget: number;
  budget_mode: string;       // BUDGET_MODE_DAY, BUDGET_MODE_TOTAL
  create_time: string;
  modify_time: string;
}
```

### التحليلات (موحدة → نفس Facebook CampaignInsights)
```typescript
{
  impressions: number;
  clicks: number;
  spend: number;           // بالسنت
  ctr: number;             // %
  cpc: number;             // بالسنت
  cpm: number;             // بالسنت
  conversions: number;
  conversionRate: number;
  costPerConversion: number;
  videoViews: number;
  videoViewRate: number;
  reach: number;
  frequency: number;
}
```

## معالجة الأخطاء

### رموز الأخطاء الشائعة
| الرمز | الرسالة (عربي) | قابلية إعادة المحاولة |
|-------|----------------|----------------------|
| `40001` | معامل غير صالح | لا |
| `40002` | انتهت صلاحية رمز الوصول | لا |
| `40003` | رمز الوصول غير صالح | لا |
| `40004` | تم تجاوز حد الطلبات (100 طلب/دقيقة) | نعم |
| `40005` | المعلن غير موجود | لا |
| `40006` | الحملة غير موجودة | لا |
| `40007` | رصيد غير كافٍ للإعلان | لا |
| `40008` | المحتوى الإبداعي مخالف للسياسات | لا |
| `50000` | خطأ داخلي في TikTok | نعم |
| `50001` | الخدمة غير متاحة حالياً | نعم |

## Rate Limits
- **100 طلب/دقيقة** لكل رمز وصول
- **2000 طلب/يوم** لكل رمز وصول
- يتم إعادة المحاولة تلقائياً مع تأخير تصاعدي (exponential backoff)
- الحد الأقصى للتأخير: 60 ثانية

## Refresh Token
- رمز الوصول صالح لمدة 24 ساعة
- رمز التحديث صالح لمدة 30 يوماً
- يتطلب التطبيق App Secret لعملية التحديث
- يجب تخزين `advertiser_id` لربط API calls

## ملاحظات إضافية
- كل الطلبات إلى TikTok API هي POST method
- يجب تضمين `advertiser_id` في كل طلب
- TikTok يدعم PKCE في OAuth - هذا إجباري للحسابات الجديدة
- Spark Ads تسمح باستخدام محتوى من منشئي المحتوى
- فيديوهات TikTok يجب أن تكون عمودية (9:16)
- الحد الأدنى لعمر الحساب الإعلاني للوصول الكامل: 30 يوماً
