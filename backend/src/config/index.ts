import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envLocalPath = path.resolve(__dirname, '../../.env.local');
const envPath = path.resolve(__dirname, '../../.env');

// Prefer .env.local (secrets) over .env
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config({ path: envPath });
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: '/api/v1',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Upload
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  // Bcrypt
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },

  // Logging
  log: {
    level: process.env.LOG_LEVEL || 'debug',
    dir: process.env.LOG_DIR || './logs',
  },

  // Swagger
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    title: process.env.SWAGGER_TITLE || 'منصة التسويق الإلكتروني - API',
    version: process.env.SWAGGER_VERSION || '1.0.0',
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
  },

  // Meta / Facebook / Instagram / Messenger
  meta: {
    pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '',
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || '',
    webhookVerifyToken: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || '',
    apiVersion: process.env.FACEBOOK_API_VERSION || 'v18.0',
    instagramBusinessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '',
  },

  // WhatsApp (Evolution API)
  whatsapp: {
    evolutionApiUrl: process.env.WHATSAPP_EVOLUTION_API_URL || '',
    evolutionApiKey: process.env.WHATSAPP_EVOLUTION_API_KEY || '',
    defaultInstance: process.env.WHATSAPP_DEFAULT_INSTANCE || 'marketron',
  },

  // TikTok
  tiktok: {
    appId: process.env.TIKTOK_APP_ID || '',
    appSecret: process.env.TIKTOK_APP_SECRET || '',
  },

  // Snapchat
  snapchat: {
    appId: process.env.SNAPCHAT_APP_ID || '',
    appSecret: process.env.SNAPCHAT_APP_SECRET || '',
  },

  // Telegram
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  },

  // Twitter / X
  twitter: {
    apiKey: process.env.TWITTER_API_KEY || '',
    apiSecret: process.env.TWITTER_API_SECRET || '',
    bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
  },

  // ── AI Providers (Multi-Provider Support) ───────────────
  ai: {
    defaultProvider: process.env.AI_DEFAULT_PROVIDER || 'openai',
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        defaultModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
        defaultModel: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      },
      gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        baseUrl: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
        defaultModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      },
      groq: {
        apiKey: process.env.GROQ_API_KEY || '',
        baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
        defaultModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      },
      mistral: {
        apiKey: process.env.MISTRAL_API_KEY || '',
        baseUrl: process.env.MISTRAL_BASE_URL || 'https://api.mistral.ai/v1',
        defaultModel: process.env.MISTRAL_MODEL || 'mistral-large-latest',
      },
      cohere: {
        apiKey: process.env.COHERE_API_KEY || '',
        baseUrl: process.env.COHERE_BASE_URL || 'https://api.cohere.com/v2',
        defaultModel: process.env.COHERE_MODEL || 'command-r-plus',
      },
      deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
        defaultModel: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      },
      perplexity: {
        apiKey: process.env.PERPLEXITY_API_KEY || '',
        baseUrl: process.env.PERPLEXITY_BASE_URL || 'https://api.perplexity.ai',
        defaultModel: process.env.PERPLEXITY_MODEL || 'llama-3.1-sonar-large-128k-online',
      },
    },
  },

  // ── Google OAuth ────────────────────────────────────────
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/ar/auth/google/callback`,
  },

  // ── Stripe (Payments) ───────────────────────────────────
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    currency: process.env.STRIPE_CURRENCY || 'usd',
  },

  // ── SMTP / Email ────────────────────────────────────────
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@marketron.io',
  },

  // ── Storage ──────────────────────────────────────────────
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
  },

  // ── Webhook ──────────────────────────────────────────────
  webhook: {
    baseUrl: process.env.WEBHOOK_BASE_URL || '',
  },

  // ── Credits & Tokens ────────────────────────────────────
  credits: {
    freeTierCredits: parseInt(process.env.FREE_TIER_CREDITS || '100', 10),
    aiCreditCost: parseInt(process.env.AI_CREDIT_COST || '1', 10),
    refillPricePer100: parseFloat(process.env.CREDIT_REFILL_PRICE || '5'),
  },
};

// Named exports for backward compatibility
export const NODE_ENV = config.env;
export const PORT = config.port;
export const FRONTEND_URL = config.frontendUrl;
export const CORS_ORIGIN = config.corsOrigin;
export const DATABASE_URL = config.database.url;
export const JWT_ACCESS_SECRET = config.jwt.accessSecret;
export const JWT_REFRESH_SECRET = config.jwt.refreshSecret;
export const OPENAI_API_KEY = config.openai.apiKey;
export const OPENAI_MODEL = config.openai.model;
export const META_PAGE_ACCESS_TOKEN = config.meta.pageAccessToken;
export const META_APP_ID = config.meta.appId;
export const META_APP_SECRET = config.meta.appSecret;
export const META_WEBHOOK_VERIFY_TOKEN = config.meta.webhookVerifyToken;
export const META_API_VERSION = config.meta.apiVersion;
export const INSTAGRAM_BUSINESS_ACCOUNT_ID = config.meta.instagramBusinessAccountId;
export const WHATSAPP_EVOLUTION_API_URL = config.whatsapp.evolutionApiUrl;
export const WHATSAPP_EVOLUTION_API_KEY = config.whatsapp.evolutionApiKey;
export const WHATSAPP_DEFAULT_INSTANCE = config.whatsapp.defaultInstance;
export const GOOGLE_CLIENT_ID = config.google.clientId;
export const GOOGLE_CLIENT_SECRET = config.google.clientSecret;
export const STRIPE_SECRET_KEY = config.stripe.secretKey;
export const SMTP_HOST = config.smtp.host;
export const SMTP_PORT = config.smtp.port;
export const SMTP_USER = config.smtp.user;
export const SMTP_PASS = config.smtp.pass;
