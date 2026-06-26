#!/bin/bash
# ============================================================
# سكريبت النشر اليدوي - Manual Deployment Script
# منصة التسويق الإلكتروني
# ============================================================
# الاستخدام:
#   ./deployment/deploy.sh [frontend|backend|ai|all]
# ============================================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀  نشر منصة التسويق الإلكتروني${NC}"
echo -e "${BLUE}========================================${NC}"

# ── تحقق من توكنات النشر ──────────────────────────────────
check_env_var() {
  if [ -z "${!1}" ]; then
    echo -e "${RED}❌  $1 غير معرف في البيئة${NC}"
    return 1
  fi
}

deploy_frontend() {
  echo ""
  echo -e "${YELLOW}🌐  نشر Frontend إلى Vercel...${NC}"

  if ! command -v vercel &> /dev/null; then
    echo -e "  ${BLUE}→ تثبيت Vercel CLI...${NC}"
    npm install -g vercel
  fi

  cd frontend
  echo -e "  ${BLUE}→ بناء التطبيق...${NC}"
  npm run build

  echo -e "  ${BLUE}→ رفع إلى Vercel...${NC}"
  vercel --prod
  cd ..
  echo -e "${GREEN}✅  Frontend منشور!${NC}"
}

deploy_backend() {
  echo ""
  echo -e "${YELLOW}⚙️  نشر Backend إلى Render...${NC}"

  if ! check_env_var "RENDER_API_KEY"; then
    echo "⚠️  استخدم Render Dashboard أو GitHub Actions للنشر التلقائي"
    echo "   أو ارجع إلى deployment/GUIDE.md"
    return
  fi

  echo -e "  ${BLUE}→ استخدام Render Deploy Hook...${NC}"
  RENDER_DEPLOY_HOOK="${RENDER_DEPLOY_HOOK:-}"
  if [ -n "$RENDER_DEPLOY_HOOK" ]; then
    curl -X POST "$RENDER_DEPLOY_HOOK"
    echo -e "${GREEN}✅  تم تفعيل النشر على Render!${NC}"
  else
    echo -e "${YELLOW}⚠️  لم يتم تعيين RENDER_DEPLOY_HOOK"
    echo -e "   أنشئ Deploy Hook من Render Dashboard واستخدمه كمتغير بيئة${NC}"
  fi
}

deploy_ai() {
  echo ""
  echo -e "${YELLOW}🤖  نشر AI Services إلى Railway...${NC}"

  if ! command -v railway &> /dev/null; then
    echo -e "  ${BLUE}→ تثبيت Railway CLI...${NC}"
    npm install -g @railway/cli
  fi

  if [ -z "$RAILWAY_TOKEN" ]; then
    echo -e "${RED}❌  RAILWAY_TOKEN غير معرف${NC}"
    echo "   قم بتشغيل: railway login"
    return
  fi

  cd ai-services
  echo -e "  ${BLUE}→ رفع إلى Railway...${NC}"
  railway up --detach
  cd ..
  echo -e "${GREEN}✅  AI Services منشورة!${NC}"
}

# ── الدخول الرئيسي ─────────────────────────────────────────
TARGET="${1:-all}"

case "$TARGET" in
  frontend)
    deploy_frontend
    ;;
  backend)
    deploy_backend
    ;;
  ai)
    deploy_ai
    ;;
  all)
    echo ""
    echo -e "${BLUE}🔄  نشر كل المكونات...${NC}"

    # Build all
    echo ""
    echo -e "${YELLOW}🔨  بناء جميع المكونات...${NC}"

    echo -e "  ${BLUE}→ بناء Backend...${NC}"
    cd backend && npm run build && cd ..

    echo -e "  ${BLUE}→ بناء Frontend...${NC}"
    cd frontend && npm run build && cd ..

    # Deploy all sequentially
    deploy_frontend
    deploy_backend
    deploy_ai
    ;;
  *)
    echo "الاستخدام: $0 [frontend|backend|ai|all]"
    echo ""
    echo "  frontend  - نشر الواجهة الأمامية (Vercel)"
    echo "  backend   - نشر الخلفية (Render)"
    echo "  ai        - نشر خدمات AI (Railway)"
    echo "  all       - نشر كل المكونات (افتراضي)"
    exit 1
    ;;
esac

echo ""
echo "========================================"
echo -e "${GREEN}✅  تم النشر بنجاح!${NC}"
echo "========================================"
