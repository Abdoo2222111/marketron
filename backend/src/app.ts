// ============================================================
// Express Application Setup
// ============================================================

import express, { Express, Request, Response } from 'express';

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { globalRateLimiter, authRateLimiter, aiRateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './utils/logger';

// ── Import all route modules ─────────────────────────────────
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

// ── Security Headers ───────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ── CORS ───────────────────────────────────────────────────
app.use(
  cors({
    origin: [config.frontendUrl, 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

// ── Body Parsing ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Request Logging ───────────────────────────────────────
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (message: string) => logger.http(message.trim()) },
    }),
  );
}

// ── Rate Limiting ──────────────────────────────────────────
app.use(globalRateLimiter);

// ── Health Check ───────────────────────────────────────────
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'الخادم يعمل بشكل طبيعي',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Root endpoint (avoid 404) ──────────────────────────────
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

// ── Favicon (avoid 404) ─────────────────────────────────────
app.get('/favicon.ico', (_req: Request, res: Response) => {
  res.status(204).end();
});

// ── API Routes ─────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/competitors', competitorRoutes);
app.use('/api/v1/market-research', marketResearchRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/social', socialRoutes);
app.use('/api/v1/ai-agents', aiAgentRoutes);
app.use('/api/v1/workspace', workspaceRoutes);
app.use('/api/v1/platforms', platformRoutes);

// ── Static Files (uploads) ─────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ── Error Handling ─────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
