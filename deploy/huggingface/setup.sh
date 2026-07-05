#!/bin/bash
# ============================================================
# HG (Взлом) — Complete Setup for Permanent Server
# This script sets up everything needed for Hugging Face
# and creates a permanent cron job on the local system
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
echo ""

# Function to print status
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# 1. Check prerequisites
print_status "📦 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi
print_success "Docker is installed"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python3 is not installed. Please install Python3 first."
    exit 1
fi
print_success "Python3 is installed"

# 2. Create necessary directories
print_status "📂 Creating necessary directories..."
mkdir -p logs
mkdir -p data
mkdir -p uploads
print_success "Directories created"

# 3. Install Python dependencies
print_status "📦 Installing Python dependencies..."
pip3 install -q fastapi uvicorn uvicorn[standard] || true
print_success "Python dependencies installed"

# 4. Build and run the Docker container
print_status "🔨 Building Docker image..."
docker build -t hg-hack-server .

print_status "🚀 Starting permanent server..."
docker run -d \\
    --name hg_hack_server \\
    --restart always \\
    -p 8000:8000 \\
    -v $(pwd)/data:/app/data \\
    -v $(pwd)/logs:/app/logs \\
    -e PORT=8000 \\
    -e NODE_ENV=production \\
    hg-hack-server

print_success "Docker container is running"

# 5. Setup local cron job
print_status "📅 Setting up permanent cron job..."

CRON_CMD="*/5 * * * * docker ps -q -f name=hg_hack_server > /dev/null || docker start hg_hack_server"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "hg_hack_server"; then
    print_warning "Cron job already exists. Updating..."
fi

# Add cron job
(crontab -l 2>/dev/null | grep -v "hg_hack_server"; echo "$CRON_CMD") | crontab -

print_success "Cron job installed (checks every 5 minutes)"

# 6. Setup health check
print_status "🏥 Setting up health check..."
HEALTH_CHECK="#!/bin/bash
# Health check for HG (Взлом) Server
# This script checks if the server is running and restarts it if necessary

SERVER_URL=\"http://localhost:8000\"
CONTAINER_NAME=\"hg_hack_server\"

if ! curl -f -s \"$SERVER_URL\" > /dev/null 2>&1; then
    echo \"$(date): Server is down. Restarting...\" >> logs/health.log
    docker restart \"$CONTAINER_NAME\" > /dev/null 2>&1
    echo \"$(date): Server restarted\" >> logs/health.log
fi
"

echo "$HEALTH_CHECK" > health-check.sh
chmod +x health-check.sh
print_success "Health check script created"

# 7. Show final status
echo ""
echo "========================================"
print_success "Permanent server setup complete!"
echo "========================================"
echo ""
echo "📊 Server Status:"
if docker ps -q -f name=hg_hack_server > /dev/null 2>&1; then
    docker ps -f name=hg_hack_server --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
else
    print_error "Container is not running"
fi
echo ""
echo "📁 Project Structure:"
echo "  logs/       - Server logs"
echo "  data/       - Data storage"
echo "  uploads/    - File uploads"
echo ""
echo "🌐 Access URLs:"
echo "  http://localhost:8000"
echo ""
echo "📅 Cron Job:"
echo "  Runs: Every 5 minutes"
echo "  Command: docker ps -q -f name=hg_hack_server > /dev/null || docker start hg_hack_server"
echo ""
echo "🔄 To stop: docker stop hg_hack_server"
echo "🚀 To start: docker start hg_hack_server"
echo "📊 To view logs: docker logs -f hg_hack_server"
echo "========================================"
