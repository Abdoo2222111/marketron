#!/bin/bash
# ============================================================
# سكريبت فحص صحة الخدمات - Health Check
# منصة التسويق الإلكتروني
# ============================================================
# الاستخدام:
#   ./deployment/health-check.sh            # فحص كل الخدمات
#   ./deployment/health-check.sh [url]      # فحص خدمة محددة
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ── الإعدادات الافتراضية ────────────────────────────────────
# غيّر هذه الروابط بعد النشر الفعلي
FRONTEND_URL="https://marketing-platform.vercel.app"
BACKEND_URL="https://marketing-platform-api.onrender.com/api/v1/health"
AI_URL="https://marketing-ai-services.up.railway.app/health"
SUPABASE_URL="https://[your-project].supabase.co"

# ── دالة فحص خدمة ────────────────────────────────────────────
check_service() {
  local name="$1"
  local url="$2"
  local expected_keyword="$3"

  echo -ne "  ⏳  ${name}... "

  local start_time=$(date +%s%N)

  # استخدم curl مع timeout
  response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$url" 2>/dev/null) || response="000"

  local end_time=$(date +%s%N)
  local duration_ms=$(( (end_time - start_time) / 1000000 ))

  if [ "$response" = "200" ] || [ "$response" = "302" ]; then
    echo -e "${GREEN}✅ ${response} (${duration_ms}ms)${NC}"
    return 0
  else
    echo -e "${RED}❌ ${response} (${duration_ms}ms)${NC}"
    return 1
  fi
}

# ── فحص AI Services مع التحقق من JSON ────────────────────────
check_ai_service() {
  local name="$1"
  local url="$2"

  echo -ne "  ⏳  ${name}... "

  local start_time=$(date +%s%N)

  # تحقق من أن الـ JSON يحتوي "healthy"
  response=$(curl -s --max-time 20 "$url" 2>/dev/null)
  local http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 "$url" 2>/dev/null)

  local end_time=$(date +%s%N)
  local duration_ms=$(( (end_time - start_time) / 1000000 ))

  if echo "$response" | grep -q '"healthy"'; then
    echo -e "${GREEN}✅ ${http_code} (${duration_ms}ms)${NC}"
    return 0
  else
    echo -e "${YELLOW}⚠️  ${http_code} (${duration_ms}ms) - استجابة غير متوقعة${NC}"
    return 1
  fi
}

# ── الفحص الرئيسي ────────────────────────────────────────────
echo ""
echo "========================================"
echo "🩺  فحص صحة الخدمات"
echo "منصة التسويق الإلكتروني"
echo "========================================"
echo ""

if [ -n "$1" ]; then
  # فحص رابط مخصص
  check_service "خدمة مخصصة" "$1" ""
  echo ""
  exit 0
fi

failed=0

echo -e "${YELLOW}🌐  الخدمات الخارجية:${NC}"
check_service "Frontend (Vercel)" "$FRONTEND_URL" || failed=$((failed + 1))
check_service "Backend API" "$BACKEND_URL" "healthy" || failed=$((failed + 1))
check_ai_service "AI Services (FastAPI)" "$AI_URL" || failed=$((failed + 1))
check_service "Supabase" "$SUPABASE_URL" || failed=$((failed + 1))

echo ""
echo -e "${YELLOW}🖥️  الخدمات المحلية:${NC}"
check_service "Local Backend" "http://localhost:4000/api/v1/health" "healthy" || true
check_service "Local AI" "http://localhost:8000/health" "healthy" || true

echo ""
echo "========================================"

if [ "$failed" -eq 0 ]; then
  echo -e "${GREEN}✅  جميع الخدمات تعمل بشكل طبيعي!${NC}"
else
  echo -e "${RED}❌  $failed خدمة/خدمات معطلة - راجع UptimeRobot للتفاصيل${NC}"
fi
echo "========================================"
echo ""
