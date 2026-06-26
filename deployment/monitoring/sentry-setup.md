# 🔍 ربط Sentry للمراقبة (Monitoring)
# Sentry Setup - Frontend + Backend

## لماذا Sentry؟ 🤔
- **5000 حدث/شهر مجاناً** ← يكفي للتجربة
- تتبع الأخطاء مع Stack Traces كاملة
- أداء (Performance Tracing)
- دعم React و Node.js مباشر

## 1️⃣ إنشاء حساب Sentry
1. اذهب إلى https://sentry.io
2. سجّل (GitHub/Google/Email)
3. بعد الدخول، أنشئ مشروع جديد:
   - اختر **React** للـ Frontend
   - اختر **Node.js** للـ Backend
4. سيظهر لك DSN (رابط المشروع)

## 2️⃣ Frontend: ربط Sentry

### تثبيت الحزمة
```bash
cd frontend
npm install @sentry/react @sentry/tracing
```

### الإعداد في main.tsx
```typescript
// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import App from './App';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  integrations: [new BrowserTracing()],
  tracesSampleRate: 0.2, // 20% من الـ sessions
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,

  // تجاهل أخطاء معينة
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Network request failed',
  ],
});
```

### إنشاء Error Boundary
```typescript
// frontend/src/components/ErrorBoundary.tsx
import * as Sentry from '@sentry/react';

const MyFallback = ({ error, componentStack, resetError }) => (
  <div className="error-fallback">
    <h2>عذراً، حدث خطأ غير متوقع 😥</h2>
    <p>{error.toString()}</p>
    <button onClick={resetError}>حاول مرة أخرى</button>
  </div>
);

// استخدمه في App.tsx
// <Sentry.ErrorBoundary fallback={MyFallback}>
//   <App />
// </Sentry.ErrorBoundary>
```

## 3️⃣ Backend: ربط Sentry

### تثبيت الحزمة
```bash
cd backend
npm install @sentry/node @sentry/profiling-node
```

### الإعداد في app.ts
```typescript
// backend/src/app.ts
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.2,
  profilesSampleRate: 0.2,
  integrations: [new ProfilingIntegration()],
  enabled: process.env.NODE_ENV === 'production',
});

// يجب أن يكون قبل باقي middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// بعد الـ routes (آخر middleware)
app.use(Sentry.Handlers.errorHandler());
```

### تتبع أداء قاعدة البيانات
```typescript
// backend/src/config/database.ts
import * as Sentry from '@sentry/node';

export async function connectWithRetry(maxRetries: number, delay: number) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect();
      return;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { retry: String(i + 1), maxRetries: String(maxRetries) },
      });
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Failed to connect to database');
}
```

## 4️⃣ إضافة Source Maps (لـ Error Stack Traces مفيدة)
```bash
# Frontend - Vite يضيف source maps تلقائياً في production
# لكن عطلها من الظهور للعامة:
```

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: process.env.SENTRY_AUTH_TOKEN ? 'hidden' : false,
  },
});
```

```bash
# ارفع source maps إلى Sentry أثناء CI/CD:
npx sentry-cli sourcemaps inject --release "$SENTRY_RELEASE" ./dist
npx sentry-cli sourcemaps upload --release "$SENTRY_RELEASE" ./dist
```

## 5️⃣ GitHub Actions + Sentry Release
أضف هذه الخطوة في CI/CD:
```yaml
- name: Create Sentry release
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
    SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
  run: |
    npx sentry-cli releases new ${{ github.sha }}
    npx sentry-cli releases set-commits ${{ github.sha }} --auto
    npx sentry-cli releases finalize ${{ github.sha }}
```

## 6️⃣ متغيرات البيئة المطلوبة
```env
# Frontend (.env.production)
VITE_SENTRY_DSN=https://xxx@sentry.io/123

# Backend (.env)
SENTRY_DSN=https://xxx@sentry.io/123
SENTRY_ENVIRONMENT=production
```

## 💡 نصائح مهمة
- لا تضع DSN في الكود مباشرة - استخدم env vars
- في بيئة التطوير، عطّل Sentry عشان ما تستهلك الـ quota عالفاضي
- استخدم tags لتصنيف الأخطاء (مثلاً: platform: facebook)
- استخدم breadcrumbs لإضافة context قبل الحدث
