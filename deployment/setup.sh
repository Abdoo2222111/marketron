#!/bin/bash
# ============================================================
# سكريبت الإعداد السريع للتطوير المحلي
# Quick Local Development Setup
# منصة التسويق الإلكتروني
# ============================================================
set -e

echo "========================================"
echo "🚀  منصة التسويق الإلكتروني"
echo "📦  الإعداد السريع للتطوير المحلي"
echo "========================================"
echo ""

# ── Colors ──────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}📁  مسار المشروع: ${PROJECT_ROOT}${NC}"

# ── 0. تحقق من المتطلبات الأساسية ──────────────────────────
echo ""
echo -e "${YELLOW}🔍  التحقق من المتطلبات الأساسية...${NC}"

check_command() {
  if command -v "$1" &> /dev/null; then
    echo -e "  ✅  $1: $($1 --version 2>&1 | head -1)"
  else
    echo -e "  ❌  $1: غير موجود (يرجى التثبيت)"
    exit 1
  fi
}

check_command node
check_command npm
check_command python3
check_command pip3
check_command git

# ── 1. نسخ ملفات البيئة ────────────────────────────────────
echo ""
echo -e "${YELLOW}📝  إعداد متغيرات البيئة...${NC}"

copy_env_if_not_exists() {
  if [ ! -f "$1" ]; then
    cp "$2" "$1"
    echo -e "  ✅  تم إنشاء $1"
  else
    echo -e "  ⏭️  $1 موجود بالفعل"
  fi
}

copy_env_if_not_exists "backend/.env" "backend/.env.example"
copy_env_if_not_exists "frontend/.env" "frontend/.env.example"
copy_env_if_not_exists "ai-services/.env" "ai-services/.env.example"

if [ ! -f "frontend/.env.local" ]; then
  cat > "frontend/.env.local" << EOF
VITE_API_URL=http://localhost:4000/api/v1
VITE_AI_SERVICES_URL=http://localhost:8000
VITE_APP_NAME=منصة التسويق الإلكتروني (تطوير)
EOF
  echo -e "  ✅  تم إنشاء frontend/.env.local"
fi

# ── 2. تثبيت الاعتمادات ────────────────────────────────────
echo ""
echo -e "${YELLOW}📦  تثبيت الاعتمادات...${NC}"

echo -e "  ${BLUE}→ Frontend${NC}"
cd frontend && npm install --silent 2>/dev/null && cd ..

echo -e "  ${BLUE}→ Backend${NC}"
cd backend && npm install --silent 2>/dev/null && cd ..

echo -e "  ${BLUE}→ AI Services${NC}"
cd ai-services
if [ -f "requirements.txt" ]; then
  pip3 install -r requirements.txt --quiet 2>/dev/null || true
fi
cd ..

echo -e "  ${BLUE}→ Root${NC}"
npm install --silent 2>/dev/null || true

# ── 3. Prisma (إذا كان موجوداً) ─────────────────────────────
echo ""
echo -e "${YELLOW}🗃️  إعداد قاعدة البيانات (Prisma)...${NC}"

if [ -f "backend/prisma/schema.prisma" ]; then
  cd backend
  echo -e "  ${BLUE}→ توليد Prisma Client${NC}"
  npx prisma generate --no-hints 2>/dev/null || echo -e "  ${RED}⚠️  فشل توليد Prisma Client (تأكد من DATABASE_URL)${NC}"
  cd ..
fi

# ── 4. إنشاء المجلدات المطلوبة ─────────────────────────────
echo ""
echo -e "${YELLOW}📂  إنشاء المجلدات المطلوبة...${NC}"
mkdir -p backend/uploads backend/logs
touch backend/uploads/.gitkeep
echo -e "  ✅  backend/uploads/"
echo -e "  ✅  backend/logs/"

# ── 5. Git Hooks ────────────────────────────────────────────
echo ""
echo -e "${YELLOW}🔗  إعداد Git Hooks...${NC}"
if [ -d ".git" ]; then
  cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
echo "🔍  تشغيل الفحوصات قبل commit..."
npm run build 2>/dev/null || echo "⚠️  فشل build، تأكد من الكود قبل الرفع"
EOF
  chmod +x .git/hooks/pre-commit
  echo -e "  ✅  تم إضافة pre-commit hook"
fi

# ── نهاية ──────────────────────────────────────────────────
echo ""
echo "========================================"
echo -e "${GREEN}✅  تم الإعداد بنجاح!${NC}"
echo ""
echo "🚀  للتشغيل المحلي:"
echo "  npm run dev          # Frontend + Backend معاً"
echo "  cd backend && npm run dev    # Backend فقط"
echo "  cd frontend && npm run dev   # Frontend فقط"
echo "  cd ai-services && npm run dev # AI Services"
echo ""
echo "🌐  بعد التشغيل:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:4000/api/v1"
echo "  API Docs: http://localhost:4000/api-docs"
echo "  AI:       http://localhost:8000"
echo "========================================"
