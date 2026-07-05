#!/bin/bash
# ============================================================
# MARKETRON AI Suite — Hugging Face Start Script
# Starts all services via Supervisor
# ============================================================

set -e

echo "========================================"
echo "🚀 MARKETRON AI Suite — Starting on Hugging Face"
echo "========================================"

# Create necessary directories
mkdir -p logs data backend/logs backend/uploads

echo "📂 Directories created"

# Start Supervisor (manages all services)
echo "📋 Starting Supervisor..."
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

echo "✅ All services started"
echo "  - Backend API:     :4000"
echo "  - AI Services:     :8000"
echo "  - Integrations:    :3003"
echo "  - HF Web Server:   :7860"
echo "  - Keep-Alive:      60s interval"

# Keep running
tail -f /dev/null
