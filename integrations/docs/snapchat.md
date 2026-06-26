# توثيق تكامل Snapchat Ads

## نظرة عامة
تكامل Snapchat Ads يسمح للمنصة بالاتصال بحسابات إعلانات Snapchat عبر Snapchat Marketing API.

**إصدار API**: v1  
**الرابط الأساسي**: `https://adsapi.snapchat.com/v1/`  
**رابط OAuth**: `https://accounts.snapchat.com/login/oauth2/authorize`  
**نوع المصادقة**: OAuth 2.0

## خطوات ربط الحساب

### 1. إنشاء تطبيق Snapchat
1. اذهب إلى [Snapchat Kit Developer Portal](https://kit.snapchat.com/portal)
2. أنشئ تطبيق جديد (Marketing API type)
3. سجّل Client ID و Client Secret

### 2. تكوين OAuth
```
1. أضف redirect URI: {BASE_URL}/api/v1/platforms/callback/snapchat
2. فعّل OAuth 2.0 في إعدادات التطبيق
3. اختر الصلاحيات المطلوبة
```

### 3. الصلاحيات المطلوبة
| الصلاحية | الوصف |
|---------|-------|
| `snapchat-marketing-api` | الوصول الكامل إلى Marketing API |
| `snapchat-ads-api` | إدارة الإعلانات |
| `user.display_name` | اسم المستخدم |
| `user.organization_name` | اسم المنظمة |

## الـ Endpoints المستخدمة

### المصادقة
| الغرض | الـ Endpoint |
|-------|-------------|
| رابط OAuth | `https://accounts.snapchat.com/login/oauth2/authorize` |
| استبدال الكود بالتوكن | `POST /login/oauth2/access_token` |
| تحديث التوكن | `POST /login/oauth2/access_token` |

### المنظمات والحسابات
| العملية | الـ Endpoint |
|---------|-------------|
| قائمة المنظمات | `GET /me/organizations` |
| معلومات المستخدم | `GET /me` |
| حسابات الإعلانات | `GET /organizations/{org_id}/adaccounts` |

### الحملات
| العملية | الـ Endpoint |
|---------|-------------|
| قراءة الحملات | `GET /adaccounts/{ad_account_id}/campaigns` |
| إنشاء حملة | `POST /adaccounts/{ad_account_id}/campaigns` |
| تحديث حملة | `PUT /campaigns/{campaign_id}` |
| إيقاف حملة | `POST /campaigns/{campaign_id}/status` |

### المجموعات الإعلانية
| العملية | الـ Endpoint |
|---------|-------------|
| قراءة Ad Squads | `GET /campaigns/{campaign_id}/adsquads` |
| إنشاء Ad Squad | `POST /campaigns/{campaign_id}/adsquads` |
| تحديث Ad Squad | `PUT /adsquads/{adsquad_id}` |

### الإعلانات
| العملية | الـ Endpoint |
|---------|-------------|
| قراءة الإعلانات | `GET /adsquads/{adsquad_id}/ads` |
| إنشاء إعلان | `POST /adsquads/{adsquad_id}/ads` |
| تحديث إعلان | `PUT /ads/{ad_id}` |
| المحتوى الإبداعي | `GET /adaccounts/{ad_account_id}/creatives` |

### التحليلات
| المقياس | الـ Endpoint |
|---------|-------------|
| إحصائيات الحملة | `GET /adaccounts/{ad_account_id}/stats` |
| إحصائيات Ad Squad | `GET /adaccounts/{ad_account_id}/stats` |
| إحصائيات الإعلان | `GET /adaccounts/{ad_account_id}/stats` |

**المقاييس المدعومة:** `impressions, swipes, spend, ctr, swipe_up_rate, video_views, conversions, conversion_purchases, conversion_add_cart, conversion_start_checkout, conversion_save, view_attachment, screen_time_ms, quartile_1, quartile_2, quartile_3, quartile_4`

## هيكل البيانات

### Campaign (خام)
```typescript
{
  id: string;
  name: string;
  ad_account_id: string;
  status: string;         // ACTIVE, PAUSED, ARCHIVED
  objective: string;      // APP_INSTALLS, AWARENESS, CONSIDERATION, CONVERSIONS, ...
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  daily_budget_micro: number;     // بالميكرو دولار
  lifetime_budget_micro: number;  // بالميكرو دولار
}
```

### التحليلات (موحدة)
```typescript
{
  impressions: number;
  reach: number;          // غير متوفر في Snapchat API
  frequency: number;      // غير متوفر في Snapchat API
  clicks: number;         // swipes في Snapchat
  ctr: number;            // %
  cpc: number | null;
  cpm: number | null;
  spend: number;          // بالميكرو دولار
  currency: string;
  conversions: number;
  conversionRate: number;
  costPerConversion: number;
  videoViews: number;
  videoViewRate: number;
  swipeUps: number;
  engagement: number;
}
```

## معالجة الأخطاء

### رموز الأخطاء الشائعة
| الرمز | الرسالة (عربي) | قابلية إعادة المحاولة |
|-------|----------------|----------------------|
| `E100` | معامل غير صالح | لا |
| `E200` | انتهت صلاحية رمز الوصول | لا |
| `E201` | رمز التحديث غير صالح | لا |
| `E202` | تم تجاوز حد الطلبات المسموح به | نعم |
| `E203` | تم تجاوز حد الإنفاق | لا |
| `E300` | المورد غير موجود | لا |
| `E301` | الحملة غير موجودة | لا |
| `E302` | الإعلان غير موجود | لا |
| `E400` | رصيد غير كافٍ | لا |
| `E401` | المحتوى مخالف للسياسات | لا |
| `E500` | خطأ داخلي في Snapchat | نعم |

## Rate Limits
- **200 طلب/دقيقة** لكل رمز وصول
- **10,000 طلب/يوم** لكل تطبيق
- يتم إعادة المحاولة تلقائياً مع تأخير تصاعدي
- الحد الأقصى للتأخير: 30 ثانية

## Refresh Token
- رمز الوصول صالح لمدة ساعة واحدة
- رمز التحديث صالح لمدة سنة كاملة
- يتم تحديث الرمز تلقائياً قبل انتهائه بـ 5 دقائق
- يتطلب Client ID و Client Secret لعملية التحديث

## ملاحظات مهمة
- Snapchat يستخدم **micro-dollars** بدلاً من السنت لتمثيل المبالغ
  - `$1.00 = 1,000,000 micro-dollars`
  - لتحويل: `amount / 1,000,000 = $`
- Snapchat يسمى Ad Set بـ "Ad Squad"
- جميع التواريخ بصيغة ISO 8601
- يجب الحصول على "Organization ID" قبل الوصول إلى حسابات الإعلانات
- Snapchat Marketing API يستخدم Basic Auth لتبادل الرمز (Client ID:Client Secret)
- للإعلانات المصورة: 1080x1920 بكسل (9:16)
- للإعلانات بالفيديو: 1080x1920 بكسل، 3-180 ثانية
