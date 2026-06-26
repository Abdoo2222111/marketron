import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4001', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    primaryModel: process.env.PRIMARY_MODEL || 'gpt-4o',
    fallbackModel: process.env.FALLBACK_MODEL || 'gpt-4o-mini',
    embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  },

  image: {
    model: process.env.IMAGE_MODEL || 'dall-e-3',
    size: process.env.IMAGE_SIZE || '1024x1024',
    quality: process.env.IMAGE_QUALITY || 'standard',
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '500', 10),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  scraper: {
    userAgent: process.env.SCRAPER_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    rateLimit: parseInt(process.env.SCRAPER_RATE_LIMIT || '1000', 10),
    timeout: parseInt(process.env.SCRAPER_TIMEOUT || '10000', 10),
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};

export default config;
