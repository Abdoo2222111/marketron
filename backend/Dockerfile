FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY setup-environment.js ./
RUN npm ci --ignore-scripts && npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-slim

WORKDIR /app
RUN apt-get update -qq && apt-get install -y -qq postgresql-client > /dev/null 2>&1 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./
COPY prisma ./prisma
COPY .env.example ./.env

EXPOSE 4000
CMD npx prisma generate && npx prisma db push --accept-data-loss && node dist/index.js
