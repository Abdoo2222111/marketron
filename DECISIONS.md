# 📋 MARKETRON — Decisions Log

## Technical Decisions Outside Default Recommendations

### 1. Express Backend vs Next.js API Routes
**Decision:** Separate Express backend (not Next.js full-stack)
**Why:** WhatsApp Evolution API requires WebSocket connections and long-running processes. Next.js serverless functions on Vercel have a 10s timeout limit, which is insufficient for AI generation, campaign analysis, and WhatsApp message processing. Express runs as a persistent process on Railway free tier.
**Trade-off:** Extra network hop between frontend and backend, but avoids timeout issues and allows WebSocket support.

### 2. Railway over Vercel for Backend
**Decision:** Backend on Railway (not Vercel serverless functions)
**Why:** Railway provides persistent Docker containers, PostgreSQL, and Redis in one project. Free tier includes $5/month credit (enough for Postgres + Redis + web service). Vercel serverless functions would time out on AI/campaign operations.
**Trade-off:** Slightly more complex deployment config, but significantly more reliable for compute-heavy operations.

### 3. Evolution API Docker on Railway (not external service)
**Decision:** Evolution API deployed on Railway as a Docker service
**Why:** Free tier supports Docker containers. Internal networking (`*.railway.internal`) allows zero-cost communication between services. No separate VPS needed.
**Trade-off:** Railway free tier has cold starts. But WhatsApp connectivity is session-based and reconnects automatically.

### 4. PostgreSQL on Railway (not Supabase for DB)
**Decision:** Railway PostgreSQL (not Supabase for primary database)
**Why:** Prisma schema has 30+ models with complex relations. Railway PostgreSQL is standard Postgres 15 with SSL. Supabase Auth layer would add unnecessary abstraction since we have custom JWT auth.
**Supabase is used for:** File storage only (free 1GB tier, S3-compatible API).
**Trade-off:** We manage migrations ourselves (Prisma Migrate), but gain full control over the schema.

### 5. BullMQ Reserved — Inline Processing First
**Decision:** No BullMQ queue in current deployment
**Why:** Vercel frontend has no Redis. Railway backend could support Queue but free tier memory limits make it risky. Current operations complete within acceptable timeframes.
**Future:** Add BullMQ when moving to paid hosting or when AI generation volume exceeds synchronous limits.

### 6. No Tests in Backend/Frontend Packages
**Decision:** Tests exist only in `integrations/` package
**Why:** Initial development prioritized shipping features. Test infrastructure (Jest config) exists but test files are empty.
**Action Required:** QA agent to write tests covering Auth, Campaigns, Messages, and AI endpoints.

### 7. Dual AI Service Architecture (Python + Node.js)
**Decision:** Keep both Python (FastAPI) and Node.js (Express) AI services
**Why:** Python excels at Arabic NLP (Farasa, CAMeL Tools) and ML operations. Node.js handles real-time generation and integrates natively with the backend. Both exist but the main backend's `ai.service.ts` should route through the Node.js integration layer (`integrations/aiService.ts`) which supports 8 providers.
**Consolidation:** The main flow should be: Frontend → Backend API → `aiIntegrationService` (multi-provider) → LLM. The Python service is optional for advanced NLP features.

### 8. Frontend Uses React Context + Zustand
**Decision:** Dual state management (Context for auth/theme, Zustand for stores)
**Why:** Auth state requires React Context for provider pattern (ProtectedRoute, etc.). Zustand is simpler for global stores (settings, filters) without boilerplate.
**Trade-off:** Two patterns to maintain, but each serves its purpose well.

### 9. Campaign Routes Bug Fix
**Decision:** Fixed `app.ts` line 117 where campaigns were incorrectly routed to auth controller.
**Impact:** This was blocking all campaign functionality — creating, listing, and analyzing campaigns would have returned auth responses instead.

### 10. AI Service Refactor Required
**Decision:** `services/ai.service.ts` uses hardcoded mock data instead of calling the multi-provider `integrations/aiService.ts`. This must be refactored to use real LLM calls.
**Current State:** `generateText()`, `analyzeCampaign()`, `getRecommendations()`, `whyNotSelling()` all return hardcoded data labeled "In production, call OpenAI / Claude API".
**Fix:** Wire each method through `integrations/aiService.generateText()` with structured prompts and JSON parsing.
