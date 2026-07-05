# برومبيت V2 — تطوير شامل للمنصة وإزالة البيانات الوهمية

## 1. 🎯 إزالة البيانات الوهمية — Refactoring جذري

### مشکوک فیه: ملفات الخدمات في backend
| الملف | المشكلة | الحل |
|-------|---------|------|
| `services/ai.service.ts` | `generateImage()` → يرجع placeholder | **تم** |
| `services/facebookMarketing.service.ts` | mock data للـ insights | ربط مع Facebook API الحقيقي |
| `services/creativeGeneration.service.ts` | fallbacks وهمية | ربط مع Pollinations الفعلي |
| `controllers/ai.controller.ts` | error handling ضعيف | إضافة try/catch كامل |

### مشکوک فیه: مواقع في frontend
| الملف | المشكلة | الحل |
|-------|---------|------|
| `ContentStudioPage.tsx` | shared `useCustomModel` | **تم** (فصل لـ text/image) |
| `useDashboardData.ts` | mock fallback عند فشل API | إظهار خطأ واضح بدلاً من data وهمية |
| `CampaignListPage.tsx` | hardcoded mock campaigns | API calls حقيقية |
| `AnalyticsPage.tsx` | sample charts data | بيانات من Prisma |
| `SocialInboxPage.tsx` | محادثات وهمية | API من قاعدة البيانات |
| `AiAgentsPage.tsx` | agents وهمية | CRUD حقيقي |

### إجراءات أساسية
- [ ] إزالة كل `generateMockPerformanceData` و `mockFallback`
- [ ] ربط كل dashboard charts بـ API endpoints حقيقية
- [ ] إضافة loading states بدلاً من البيانات الوهمية
- [ ] إضافة empty states عند عدم وجود بيانات
- [ ] إضافة error boundaries لكل feature
- [ ] استخدام React Query/SWR لكل الـ data fetching

---

## 2. 🔧 إصلاحات البنية التحتية

### Railway Deployment
- [ ] **تشغيل Railway agent**: `railway setup agent` لحل مشكلة الـ deploy الفاشل
- [ ] فحص Dockerfile الـ CMD: تحويله لـ JSON args (`["node", "dist/index.js"]`)
- [ ] إضافة PORT env var: التأكد من أن Railway يمرر PORT
- [ ] تغيير build strategy: استخدام GitHub Actions بدلاً من Railway auto-deploy
- [ ] إضافة healthcheck endpoint: `/api/v1/health` ✅ موجود

### Vercel Configuration
- [ ] إضافة `BACKEND_API_URL` كـ Environment Variable في Vercel (حالياً يستخدم fallback)
- [ ] التأكد من rewrite rules في next.config.js
- [ ] Edge caching للـ static pages
- [ ] Incremental Static Regeneration (ISR) لـ `/services`

### Environment Variables المفقودة
- [ ] `BACKEND_API_URL` على Vercel (يحل محل fallback)
- [ ] `NEXT_PUBLIC_API_URL` على Vercel ✅ موجود
- [ ] `AI_DEFAULT_PROVIDER` على Railway
- [ ] `TELEGRAM_BOT_TOKEN` على Railway
- [ ] `WHATSAPP_EVOLUTION_API_KEY` و `WHATSAPP_EVOLUTION_API_URL`

---

## 3. ⚡ Content Studio — Fixes + تحسينات

### Fixes Immediate
| # | المشكلة | الحالة |
|---|---------|--------|
| 1 | Image generation → placeholder / broken | **تم** |
| 2 | Custom model image → calls text endpoint | **تم** |
| 3 | Shared `useCustomModel` state | **تم** |
| 4 | `/creatures/generate-ad` غير مربوط بالـ UI | قيد العمل |
| 5 | Credit deduction غير متسق بين endpoints | مطلوب |
| 6 | Video tab موجود في الكود لكن مش في الـ UI | مطلوب |

### إضافات Content Studio
- [ ] ربط `/creatives/generate-ad` مع واجهة Content Studio
- [ ] إضافة معرض الصور المولّدة (gallery)
- [ ] إضافة video generation tab (يستخدم pollinationsApi.generateVideo)
- [ ] إضافة AI generation history في tab منفصل
- [ ] Batch generation (توليد 3-5 نصوص/صور مرة واحدة)
- [ ] Save generated content (حفظ المحتوى في قاعدة البيانات)

---

## 4. 📱 Mobile — Responsive Fixes

### الصفحات المتأثرة
| الصفحة | المشكلة | الحل |
|--------|---------|------|
| `/auth/login` | `motion.div opacity: 0` يخفي المحتوى | **تم** (استخدام `<div>` بدلاً من motion) |
| `/auth/register` | `motion.div opacity: 0` يخفي المحتوى | **تم** |
| `/auth/forgot-password` | نفس المشكلة | تحويل من motion لـ div |
| `/dashboard` | grid غير responsive | إضافة `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| Landing Page | Floating cubes تسبب layout issues | **تم** (hidden md:block) |
| Landing Page | Gradient orbs كبيرة جداً على الموبايل | **تم** |

### تحسينات عامة
- [ ] Touch targets: كل الأزرار ≥ 44px
- [ ] Horizontal scroll: منع overflow في كل الصفحات
- [ ] Font sizes: `text-base` (16px) كحد أدنى للمحتوى
- [ ] Safe areas: padding لـ notch/rounded corners (iOS)
- [ ] Bottom navigation للـ dashboard على الموبايل
- [ ] Pull-to-refresh للـ lists

---

## 5. 🔵 Lighthouse Performance — خطة رفع النتائج

### الهدف: Mobile ≥ 80 / Desktop ≥ 90

| المقياس | الحالي | المستهدف |
|---------|-------|---------|
| Performance (Mobile) | ~55 | ≥ 80 |
| Performance (Desktop) | ~75 | ≥ 90 |
| First Contentful Paint | ~2.8s | < 1.8s |
| Largest Contentful Paint | ~4.5s | < 2.5s |
| Cumulative Layout Shift | ~0.15 | < 0.1 |
| Time to Interactive | ~5s | < 3s |

### التحسينات المطلوبة
- [ ] **Images**: next/image مع WebP + lazy loading
- [ ] **Fonts**: next/font/google ✅ (تم — لكن build يفشل في تحميل الخطوط أحياناً)
- [ ] **Bundle**: 
  - `next/dynamic` لـ ParticlesBackground ✅ (تم)
  - Split framer-motion إلى chunk منفصل
  - Tree-shake lucide-react icons
  - Lazy load sections في LandingPage
- [ ] **CSS**: Purge unused CSS (Tailwind JIT ✅)
- [ ] **JS**: Defer puter.com script + preconnect
- [ ] **Caching**: `Cache-Control` headers للـ static assets
- [ ] **Images**: Preload للـ logo ✅ (تم)
- [ ] **Optimization**: `priority` prop على فوق الـ fold images
- [ ] **Analytics**: Vercel Speed Insights + Web Vitals

---

## 6. ✅ خطة الضمان — كل حاجة شغالة 100%

### اختبارات يدوية (قبل النشر)
- [ ] Landing page: كل الأقسام (Hero, Features, Steps, Pricing, Testimonials, FAQ, Team, CTA, Footer)
- [ ] Auth: Login → Register → Forgot Password → Google OAuth
- [ ] Content Studio: Text Generation (مع وبدون custom model), Image Generation, Analysis, Recommendations
- [ ] Dashboard: Overview, Campaigns, Analytics, Social, Settings
- [ ] AI Features: Chat, Agents, Model Selector
- [ ] كل الأزرار تشتغل (WhatsApp, language switcher, theme toggle, scroll links)
- [ ] RTL/LTR: اختبار بالعربية والإنجليزية
- [ ] Dark/Light mode: اختبار في كل صفحة
- [ ] Mobile: 320px, 375px, 414px, 768px
- [ ] Console: لا يوجد JavaScript Errors
- [ ] Network: كل API calls ترجع 200

### اختبارات آلية (مستقبلية)
- [ ] Accessibility audit (axe-core)
- [ ] API endpoint tests (Jest/Supertest)
- [ ] E2E tests (Playwright/Cypress)
- [ ] Visual regression tests

---

## 7. 📁 توزيع المهام — ترتيب التنفيذ

| الأولوية | المهمة | الزمن | يعتمد على |
|----------|--------|-------|-----------|
| 🔴 1 | إزالة mock data من كل services | 3 ساعات | — |
| 🔴 2 | Fix Railway deployment | 1 ساعة | — |
| 🔴 3 | Content Studio — ربط creatives routes | 2 ساعات | #2 |
| 🟡 4 | Mobile responsive لكل dashboard | 3 ساعات | — |
| 🟡 5 | Lighthouse optimization (images, lazy, bundle) | 4 ساعات | #1 |
| 🟢 6 | إضافة Environment Variables المفقودة | 30 دقيقة | #2 |
| 🟢 7 | Touch targets + safe areas للموبايل | 1 ساعة | — |
| 🔵 8 | اختبار 100% لكل الميزات | 2 ساعات | #1-#7 |
| 🔵 9 | Accessibility audit | 1 ساعة | — |
| 🔵 10 | E2E tests (Playwright) | 4 ساعات | #1-#7 |
