FROM node:20-slim AS builder

WORKDIR /app
COPY backend/package*.json ./
COPY backend/prisma ./prisma
COPY backend/setup-environment.js ./
RUN npm ci --ignore-scripts && npx prisma generate

COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

FROM node:20-slim

WORKDIR /app
RUN apt-get update -qq && apt-get install -y -qq postgresql-client > /dev/null 2>&1 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY backend/package*.json ./
COPY backend/prisma ./prisma
RUN mkdir -p ./logs

EXPOSE 4000
CMD npx prisma db push --accept-data-loss && node dist/index.js