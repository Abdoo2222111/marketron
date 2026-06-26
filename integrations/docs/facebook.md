# توثيق تكامل Facebook Ads

## نظرة عامة
تكامل Facebook Ads يسمح للمنصة بالاتصال بحسابات إعلانات Facebook وإدارة الحملات والإعلانات وسحب التحليلات.

**إصدار API**: v20.0  
**الرابط الأساسي**: `https://graph.facebook.com/v20.0`  
**نوع المصادقة**: OAuth 2.0 (Facebook Login)

## خطوات ربط الحساب

### 1. إنشاء تطبيق Facebook
1. اذهب إلى [Facebook Developers](https://developers.facebook.com)
2. أنشئ تطبيق جديد (Business type)
3. أضف منتج "Facebook Login" و "Marketing API"
4. سجّل App ID و App Secret

### 2. تكوين OAuth
```
1. أضف redirect URI: {BASE_URL}/api/v1/platforms/callback/facebook
2. أضف Facebook Login → Settings → Valid OAuth Redirect URIs
3. فعّل "Use Strict Mode for Redirect URIs" (اختياري)
4. احصل على App ID و App Secret
```

### 3. الصلاحيات المطلوبة (Permissions)
| الصلاحية | الوصف |
|---------|---------|
| `ads_read` | قراءة بيانات الحملات والإعلانات |
| `ads_management` | إنشاء وتعديل الحملات والإعلانات |
| `pages_read_engagement` | قراءة تفاعلات الصفحات |
| `pages_manage_ads` | إدارة إعلانات الصفحة |
| `public_profile` | المعلومات الأساسية للمستخدم |
| `email` | البريد الإلكتروني للمستخدم |

### 4. نظام التقسيم (Pagination)
Facebook API يستخدم cursor-based pagination. يمكن التعامل معها كالتالي:
```typescript
// قراءة الصفحة التالية
const response = await apiClient.get(url, { params: { after: paging.cursors.after } });
```

**مفاتيح التقسيم:**
- `paging.cursors.before` → cursor للصفحة السابقة
- `paging.cursors.after` → cursor للصفحة التالية
- `paging.next` → رابط كامل للصفحة التالية
- `paging.previous` → رابط كامل للصفحة السابقة

## الـ Endpoints المستخدمة

### المصادقة
| الغرض | الـ Endpoint |
|-------|-------------|
| رابط تسجيل الدخول | `https://www.facebook.com/v20.0/dialog/oauth` |
| استبدال الكود بالتوكن | `https://graph.facebook.com/v20.0/oauth/access_token` |
| تمديد التوكن | `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token` |
| فحص التوكن | `https://graph.facebook.com/v20.0/debug_token` |
| معلومات المستخدم | `https://graph.facebook.com/v20.0/me` |

### الحملات
| العملية | الـ Endpoint |
|---------|-------------|
| قراءة الحملات | `GET /act_{account_id}/campaigns` |
| إنشاء حملة | `POST /act_{account_id}/campaigns` |
| تحديث حملة | `POST /{campaign_id}` |
| حذف حملة | `POST /{campaign_id}?status=DELETED` |

### التحليلات
| المقياس | الـ Endpoint |
|---------|-------------|
| تحليلات الحملة | `GET /{campaign_id}/insights` |
| تحليلات الحساب | `GET /act_{account_id}/insights` |
| تحليلات الجمهور | `GET /act_{account_id}/audience_insights` |

**حقول التحليلات:** `impressions, clicks, spend, ctr, cpc, cpm, actions, conversions, reach, frequency, cost_per_action_type`

### الجمهور
| العملية | الـ Endpoint |
|---------|-------------|
| الجماهير المخصصة | `GET /act_{account_id}/customaudiences` |
| إنشاء جمهور | `POST /act_{account_id}/customaudiences` |
| إضافة مستخدمين | `POST /{audience_id}/users` |
| الجماهير المشابهة | `GET /act_{account_id}/customaudiences?filtering=...` |

### الصفحات
| العملية | الـ Endpoint |
|---------|-------------|
| قائمة الصفحات | `GET /me/accounts` |
| معلومات الصفحة | `GET /{page_id}` |
| نشر منشور | `POST /{page_id}/feed` |
| رفع صورة | `POST /{page_id}/photos` |
| تحليلات الصفحة | `GET /{page_id}/insights` |

## هيكل البيانات المرتجعة

### Campaign (موحدة)
```typescript
{
  id: string;
  platform: 'facebook';
  name: string;
  objective: string;        // CONVERSIONS, REACH, TRAFFIC, BRAND_AWARENESS, ...
  status: CampaignStatus;   // ACTIVE, PAUSED, DELETED, ARCHIVED
  budget: {
    amount: number;         // بالسنت
    currency: string;       // USD, EGP, ...
    type: 'DAILY' | 'LIFETIME';
  } | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
  raw: any;
}
```

### Insights (موحدة)
```typescript
{
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  ctr: number;            // Click-Through Rate %
  cpc: number | null;     // Cost Per Click
  cpm: number | null;     // Cost Per 1000 Impressions
  cpa: number | null;     // Cost Per Action
  spend: number;          // بالسنت
  currency: string;
  conversions: number;
  conversionRate: number | null;
  costPerConversion: number | null;
  roas: number | null;    // Return on Ad Spend
  videoViews: number | null;
  videoViewRate: number | null;
  engagement: number | null;
}
```

## معالجة الأخطاء
الـ error handler يحول أخطاء Facebook API إلى رسائل عربية.

### رموز الأخطاء الشائعة
| الرمز | الرسالة (عربي) | قابلية إعادة المحاولة |
|-------|----------------|----------------------|
| `1` | حدث خطأ داخلي في Facebook | لا |
| `2` | انتهت صلاحية رمز الوصول | لا |
| `3` | تم تجاوز حد الطلبات المسموح به | نعم |
| `4` | تم تجاوز حد الطلبات للتطبيق | نعم |
| `10` | ليس لديك صلاحية للوصول إلى هذه البيانات | لا |
| `100` | معامل غير صالح | لا |
| `200` | صلاحية الإعلان منتهية | لا |
| `269` | تم تجاوز حد الإنفاق اليومي | لا |
| `80004` | تم تجاوز حد الطلبات - يرجى المحاولة لاحقاً | نعم |

## Rate Limits
- **حد الطلبات على مستوى المستخدم**: 200 طلب/ساعة
- **حد الطلبات على مستوى التطبيق**: يعتمد على حجم التطبيق
- عندما تصل إلى الـ rate limit، الـ API يرجع كود 429

## معالجة الرمز المنتهي
- الرموز قصيرة العمر (short-lived) صالحة لمدة ساعتين
- الرموز طويلة العمر (long-lived) صالحة لمدة 60 يوماً
- يمكن تمديد الرمز طويل العمر مرة واحدة فقط كل 60 يوماً
- يتم تمديد الرمز تلقائياً قبل انتهائه بـ 5 دقائق

## ملاحظات إضافية
- يجب توفير `App Secret` للمصادقة الآمنة
- الرمز الممتد غير متاح للحسابات الشخصية فقط (Pages)
- يمكن استخدام Sandbox Mode للتجربة بدون إنفاق حقيقي
- يجب استخدام `Business Manager` للحسابات الإعلانية الكبيرة
