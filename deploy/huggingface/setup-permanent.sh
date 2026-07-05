#!/bin/bash
# ============================================================
# HG (Взлом) — Setup Permanent Server on Hugging Face
# This script sets up everything needed for permanent operation
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================"
echo "🚀 HG (Взлом) — Permanent Server Setup"
echo "========================================"

# 1. Check if Docker is installed
echo -e "${BLUE}📦 Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is installed${NC}"

# 2. Build the Docker image
echo -e "${BLUE}🔨 Building Docker image...${NC}"
docker build -t hg-hack-server .

# 3. Run the container with auto-restart
echo -e "${BLUE}🚀 Starting permanent server...${NC}"
docker run -d \
    --name hg_hack_server \
    --restart always \
    -p 8000:8000 \
    -v $(pwd)/data:/app/data \
    -v $(pwd)/logs:/app/logs \
    hg-hack-server

# 4. Setup local cron job (if on Linux/Mac)
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${BLUE}📅 Setting up local cron job...${NC}"
    
    # Create cron job to monitor the container
    CRON_JOB="*/5 * * * * docker ps -q -f name=hg_hack_server > /dev/null || docker start hg_hack_server"
    
    # Add to crontab if not already exists
    (crontab -l 2>/dev/null | grep -v "hg_hack_server"; echo "$CRON_JOB") | crontab -
    
    echo -e "${GREEN}✅ Cron job installed${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}✅ Permanent server setup complete!${NC}"
echo ""
echo "📊 Server Status:"
docker ps -f name=hg_hack_server --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "📁 Logs: ./logs/"
echo "📁 Data: ./data/"
echo ""
echo "🌐 Access: http://localhost:8000"
echo "========================================"
