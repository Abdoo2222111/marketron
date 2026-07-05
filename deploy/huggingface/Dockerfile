# ============================================================
# MARKETRON AI Suite — Hugging Face Space Dockerfile
# ============================================================
# Runs: Backend (:4000) + AI Services (:8000) + Integrations (:3003)
# Monitoring: Keep-Alive checks every 60s
# ============================================================

# ── Stage 0: Base ──────────────────────────────────────────
FROM debian:bookworm-slim AS base

# Install system dependencies
RUN apt-get update -qq && apt-get install -y -qq --no-install-recommends \
    curl \
    wget \
    gnupg \
    supervisor \
    cron \
    net-tools \
    procps \
    ca-certificates \
    postgresql-client \
    redis-tools \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y -qq nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python 3 + pip
RUN apt-get update -qq && apt-get install -y -qq --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/* \
    && python3 --version && node --version && npm --version

WORKDIR /app

# ── Stage 1: Build Backend ─────────────────────────────────
FROM base AS backend-builder

COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/
COPY backend/setup-environment.js ./backend/
RUN cd backend && npm ci --ignore-scripts && npx prisma generate

COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src/
RUN cd backend && npm run build

# ── Stage 2: Build AI Services ─────────────────────────────
FROM base AS ai-builder

COPY ai-services/package*.json ./ai-services/
RUN cd ai-services && npm ci

COPY ai-services/ ./
RUN cd ai-services && npm run build

# ── Stage 3: Build Integrations ────────────────────────────
FROM base AS integrations-builder

COPY integrations/package*.json ./integrations/
RUN cd integrations && npm ci

COPY integrations/tsconfig.json ./integrations/
COPY integrations/ ./integrations/
RUN cd integrations && npm run build

# ── Stage 4: Final Image ───────────────────────────────────
FROM base

WORKDIR /app

# Copy built artifacts from builders
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/prisma ./backend/prisma/

COPY --from=ai-builder /app/ai-services/node_modules ./ai-services/node_modules
COPY --from=ai-builder /app/ai-services/dist ./ai-services/dist
COPY --from=ai-builder /app/ai-services/package*.json ./ai-services/

COPY --from=integrations-builder /app/integrations/node_modules ./integrations/node_modules
COPY --from=integrations-builder /app/integrations/dist ./integrations/dist
COPY --from=integrations-builder /app/integrations/package*.json ./integrations/

# Install Python AI dependencies
COPY ai-services/requirements.txt ./ai-services/
RUN pip3 install --no-cache-dir -r ai-services/requirements.txt 2>/dev/null || true

# Copy HF deployment files
COPY deploy/huggingface/ ./

# Create necessary directories
RUN mkdir -p logs data backend/logs backend/uploads

# Supervisor configuration
RUN mkdir -p /etc/supervisor/conf.d/
COPY deploy/huggingface/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Make scripts executable
RUN chmod +x *.sh

# Setup cron for permanent running
RUN crontab crontab.txt

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:4000/api/v1/health || exit 1

EXPOSE 4000 8000 3003 7860

# Start supervisor (manages all services)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
