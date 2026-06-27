import express, { Express, Request, Response } from 'express';

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { globalRateLimiter, authRateLimiter, aiRateLimiter, registerRateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { csrfProtection } from './middleware/csrf';
import logger from './utils/logger';

import authRoutes from './routes/auth.routes';
import campaignRoutes from './routes/campaign.routes';
import analyticsRoutes from './routes/analytics.routes';
import contentRoutes from './routes/content.routes';
import competitorRoutes from './routes/competitor.routes';
import marketResearchRoutes from './routes/marketResearch.routes';
import aiRoutes from './routes/ai.routes';
import teamRoutes from './routes/team.routes';
import notificationRoutes from './routes/notification.routes';
import settingsRoutes from './routes/settings.routes';
import adminRoutes from './routes/admin.routes';
import socialRoutes from './routes/social.routes';
import aiAgentRoutes from './routes/aiAgent.routes';
import workspaceRoutes from './routes/workspace.routes';
import platformRoutes from './routes/platform.routes';

const app: Express = express();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", config.frontendUrl, config.corsOrigin, '*'],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
}));

app.use(cors({
  origin: [
    config.frontendUrl,
    'http://localhost:3000',
    'http://localhost:5173',
    'https://frontend-one-virid-95.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-csrf-token'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.disable('x-powered-by');

if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (message: string) => logger.http(message.trim()) },
    })
  );
}

app.use(globalRateLimiter);

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'الخادم يعمل بشكل طبيعي',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    name: 'MARKETRON Backend API',
    version: '1.0.0',
    message: 'مرحباً بك في واجهة MARKETRON الخلفية',
    documentation: '/api-docs',
    health: '/api/v1/health',
    frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
  });
});

app.get('/favicon.ico', (_req: Request, res: Response) => {
  res.status(204).end();
});

app.use('/api/v1/auth', authRateLimiter, authRoutes);
app.use('/api/v1/campaigns', authRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/competitors', competitorRoutes);
app.use('/api/v1/market-research', marketResearchRoutes);
app.use('/api/v1/ai', aiRateLimiter, aiRoutes);
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/social', socialRoutes);
app.use('/api/v1/ai-agents', aiAgentRoutes);
app.use('/api/v1/workspace', workspaceRoutes);
app.use('/api/v1/platforms', platformRoutes);

app.use(express.static('public'));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
