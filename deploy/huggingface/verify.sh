#!/bin/bash
# ============================================================
# HG (Взлом) — Verification & Status Script
# Checks if the permanent server is running properly
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================"
echo "🔍 HG (Взлом) — System Verification"
echo "========================================"
echo ""

# Check Docker container
echo -e "${BLUE}🐳 Checking Docker container...${NC}"
if docker ps -q -f name=hg_hack_server > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Container is running${NC}"
    docker ps -f name=hg_hack_server --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
else
    echo -e "${RED}❌ Container is not running${NC}"
    echo -e "${YELLOW}💡 Starting container...${NC}"
    docker start hg_hack_server > /dev/null 2>&1 || echo -e "${RED}❌ Failed to start container${NC}"
fi
echo ""

# Check server availability
echo -e "${BLUE}🌐 Checking server availability...${NC}"
if curl -f -s http://localhost:8000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is responding on http://localhost:8000${NC}"
else
    echo -e "${RED}❌ Server is not responding${NC}"
fi
echo ""

# Check cron job
echo -e "${BLUE}📅 Checking cron job...${NC}"
if crontab -l 2>/dev/null | grep -q "hg_hack_server"; then
    echo -e "${GREEN}✅ Cron job is installed${NC}"
    echo -e "${BLUE}   Schedule:${NC}"
    crontab -l | grep "hg_hack_server"
else
    echo -e "${RED}❌ Cron job is not installed${NC}"
fi
echo ""

# Check logs
echo -e "${BLUE}📊 Checking recent logs...${NC}"
if [ -f "logs/server.log" ]; then
    echo -e "${GREEN}✅ Server log exists${NC}"
    tail -n 5 logs/server.log
else
    echo -e "${YELLOW}⚠️ No logs found yet${NC}"
fi
echo ""

echo "========================================"
echo "✅ Verification Complete"
echo "========================================"
