# برومبيت شامل لتطوير موقع MARKETRON

## 1. 🛠 Fixes المطلوبة فوراً

### صفحات الهوية (Auth Pages)
- [ ] استخدام Next.js dynamic imports لـ `ParticlesBackground` — يمنع الـ JS bundle الكبير
- [ ] إضافة `<noscript>` fallback: رسالة تطلب تفعيل JavaScript
- [ ] استبدال framer-motion في `initial={{ opacity: 0 }}` بـ CSS animations أو إضافة `style={{ opacity: 1 }}` إجباري
- [ ] إضافة `loading="lazy"` لجميع الـ images
- [ ] Separate chunk لـ framer-motion عبر next/dynamic

### التوجيه والمسارات (Routing)
- [ ] إضافة loading states (Skeleton loaders) لكل page
- [ ] إضافة error boundaries لكل page group
- [ ] إضافة 404 page مخصصة

---

## 2. 🎨 الهوية البصرية — تطوير جذري

### النظام البصري الجديد
- [ ] **نظام ألوان متدرج (Gradient System)**: 5 تدرجات ثابتة (primary, secondary, accent, warm, cool) + animation smooth
- [ ] **Glass morphism موحد**: كل الكروت تستخدم نفس glass effect مع backdrop-blur ثابت
- [ ] **Neon glow system**: توحيد كل ظلال النيون في متغيرات CSS (`--glow-primary`, `--glow-accent`)
- [ ] **Animated icons**: تحويل الأيقونات المهمة إلى Lottie/JSON animations
- [ ] **3D elements**: إما Three.js أو CSS perspective transforms بشكل ثابت
- [ ] **Typography system**: توحيد hierarchy (h1→h6 مع line-height, letter-spacing, gradient)
- [ ] **Border animations**: أنيميشن دائرية على الكروت المميزة (conic-gradient)

### مكونات جديدة
- [ ] **Cursor custom**: مؤشر مخصص بنبضات نيون يتفاعل مع العناصر
- [ ] **Floating action button**: زر واتساب عائم يظهر عند التمرير
- [ ] **Scroll-triggered particle burst**: انفجار جزيئات عند الوصول لأقسام معينة
- [ ] **Parallax hero**: خلفية الهيرو تتحرك بسرعة مختلفة عن النص
- [ ] **Animated counters**: الأرقام (500+, 98%, 24/7) تتحرك عند الوصول لها
- [ ] **Mega menu**: قائمة منسدلة متقدمة بدلاً من الرابط البسيط
- [ ] **Breadcrumbs**: مسار التنقل في جميع الصفحات الداخلية

### الأقسام الجديدة
- [ ] **Brand showcase**: شريط عملاء أو مشاريع سابقة
- [ ] **FAQ section**: أسئلة متكررة مع accordion animated
- [ ] **Blog/Case studies**: قسم للمقالات ودراسات الحالة
- [ ] **Integrations page**: صفحة تعرض كل المنصات المتكاملة
- [ ] **Team section**: فريق العمل مع hover effects
- [ ] **Live demo**: نسخة تفاعلية تجريبية من dashboard

---

## 3. ⚡ تسريع الموقع — Performance

### Bundle Optimization
- [ ] `next/dynamic` + `ssr: false` لـ `ParticlesBackground`, جميع الرسوم الثقيلة
- [ ] Remove or lazy-load `framer-motion` من الصفحات التي لا تحتاجه
- [ ] `React.lazy()` لـ sections خارج الـ first fold
- [ ] Tree-shake Lucide icons: استيراد فردي `import { Menu, X } from 'lucide-react'`
- [ ] Split vendor chunks في `next.config.js`

### Image & Asset Optimization
- [ ] WebP/AVIF images مع next/image
- [ ] Preload للوجو والـ hero image
- [ ] SVG sprites للأيقونات المتكررة
- [ ] `priority` prop على فوق الـ fold images
- [ ] تحويل كل الصور الكبيرة (bg, gradients) إلى CSS خالص

### CSS & Font Optimization
- [ ] Remove Google Fonts واستضافة الخطوط محلياً (Cairo, Inter)
- [ ] `font-display: swap` أو `optional` لجميع الخطوط
- [ ] Purge unused CSS (Tailwind JIT already does this)
- [ ] `@layer` لفصل Tailwind عن CSS المخصص
- [ ] Remove `bg-grid` و `radial-glow` القديمة واستخدام CSS variables

### Caching & Network
- [ ] Service Worker للـ offline fallback
- [ ] `stale-while-revalidate` في next.config للـ pages
- [ ] CDN headers للـ static assets
- [ ] Preconnect لجميع origins (fonts.googleapis, js.puter.com)
- [ ] Remove `js.puter.com` script إذا لم يكن مستخدماً

### JavaScript Execution
- [ ] Defer third-party scripts
- [ ] Intersection Observer لتحميل المكونات عند الظهور
- [ ] `requestIdleCallback` للتحليلات والـ tracking
- [ ] Remove أو delay الـ mouse/touch event handlers
- [ ] استخدام `will-change` للـ animations بشكل محدود

---

## 4. ✅ التأكد من أن كل شيء شغال 100%

### Cross-platform Testing
- [ ] **Chrome, Firefox, Safari, Edge** — أحدث + إصدارين سابقين
- [ ] **iOS Safari 15+** و **Android Chrome 90+**
- [ ] **Screen sizes**: 320px (iPhone SE) حتى 2560px (Ultrawide)
- [ ] **Touch devices**: iPad, iPhone, Samsung Galaxy, Huawei
- [ ] **Network conditions**: 3G, 4G, 5G, Slow 3G (DevTools throttling)
- [ ] **Offline**: اختبار السلوك بدون إنترنت
- [ ] **Reduced motion**: اختبار مع `prefers-reduced-motion: reduce`

### Functional Testing
- [ ] **RTL/LTR**: اختبار كامل مع العربية والإنجليزية
- [ ] **Dark/Light mode**: اختبار الـ theme toggle في كل الصفحات
- [ ] **Forms**: تسجيل الدخول — تسجيل — forgot password — validation — errors
- [ ] **Pricing CTA**: كل 3 أزرار تفتح صفحة التسجيل سليمة
- [ ] **WhatsApp link**: يفتح واتساب صح
- [ ] **Language switcher**: كل اللغات تشتغل بدون أخطاء
- [ ] **Navigation**: الروابط الداخلية والخارجية
- [ ] **SEO meta tags**: title, description, OG tags في كل صفحة

### Performance Targets
- [ ] **Lighthouse Mobile**: ≥ 70 Performance, ≥ 90 Accessibility, ≥ 90 SEO
- [ ] **Lighthouse Desktop**: ≥ 85 Performance, ≥ 90 Accessibility, ≥ 90 SEO
- [ ] **First Contentful Paint (FCP)**: < 2s على 4G
- [ ] **Largest Contentful Paint (LCP)**: < 2.5s
- [ ] **Cumulative Layout Shift (CLS)**: < 0.1
- [ ] **Total Bundle Size**: < 200kB First Load JS
- [ ] **Time to Interactive (TTI)**: < 3s

### Monitoring
- [ ] Vercel Analytics (عدد الزوار، الـ pages الأكثر زيارة)
- [ ] Vercel Speed Insights (قياس Core Web Vitals يومياً)
- [ ] Error tracking (Sentry أو Vercel Error Monitoring)
- [ ] Uptime monitor (Better Uptime أو UptimeRobot)
- [ ] Console.error logging في production

---

## 5. 📁 بنية الملفات — Refactoring المقترح

```
frontend/src/
├── app/
│   └── [locale]/
│       ├── layout.tsx              ← Fix: separate i18n + dir logic
│       └── auth/
│           ├── login/page.tsx      ← Fix: remove motion opacity
│           └── register/page.tsx   ← Fix: remove motion opacity
│
├── components/
│   ├── ui/
│   │   ├── ParticlesBackground.tsx ← Fix: dynamic import, mobile detection
│   │   ├── ScrollProgress.tsx      ← NEW
│   │   ├── TestimonialsCarousel.tsx ← NEW (extract from LandingPage)
│   │   ├── FloatingCubes.tsx       ← NEW (extract from LandingPage)
│   │   └── GlowCard.tsx            ← NEW (reusable glass card)
│   └── landing/
│       ├── HeroSection.tsx         ← NEW (extract)
│       ├── FeaturesSection.tsx     ← NEW (extract)
│       ├── StepsSection.tsx        ← NEW (extract)
│       ├── PricingSection.tsx      ← NEW (extract)
│       ├── TestimonialsSection.tsx ← NEW (extract)
│       └── CTASection.tsx          ← NEW (extract)
│
├── lib/
│   ├── performance.ts             ← NEW (IntersectionObserver, lazy load)
│   └── analytics.ts               ← NEW (tracking wrapper)
│
└── styles/
    └── animations.css             ← NEW (separate animation keyframes)
```

---

## 6. 🎯 الأولويات — ترتيب التنفيذ

| الأولوية | المهمة | الوقت المتوقع |
|----------|--------|---------------|
| 🔴 1 | إصلاح الـ opacity في صفحات الـ auth | 30 دقيقة |
| 🔴 2 | Dynamic import لـ ParticlesBackground | 15 دقيقة |
| 🔴 3 | إزالة script غير المستخدم (puter.com) | 5 دقائق |
| 🟡 4 | استضافة الخطوط محلياً | 20 دقيقة |
| 🟡 5 | فصل LandingPage إلى مكونات صغيرة | 1 ساعة |
| 🟡 6 | Preload + WebP للمحتوى المرئي | 30 دقيقة |
| 🟢 7 | إضافة الـ sections الجديدة (FAQ, Team, etc.) | 3 ساعات |
| 🟢 8 | تطوير النظام البصري (glass, glow, 3D) | 4 ساعات |
| 🟢 9 | تحسينات CSS variables + theming | 1 ساعة |
| 🔵 10 | اختبارات cross-platform كاملة | 2 ساعات |
| 🔵 11 | تحليل Lighthouse وتحسين النتائج | 3 ساعات |
| 🔵 12 | إضافة monitoring + analytics | 1 ساعة |
