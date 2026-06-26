import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ],
});

// Logging queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    logger.debug(`Query: ${e.query} - Params: ${e.params}`);
  });
}

prisma.$on('info', (e: any) => {
  logger.info(`Prisma: ${e.message}`);
});

prisma.$on('warn', (e: any) => {
  logger.warn(`Prisma: ${e.message}`);
});

prisma.$on('error', (e: any) => {
  logger.error(`Prisma: ${e.message}`);
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
};

// Legacy compatibility export for old services
export const query = async (_sql: string, _params?: any[]) => {
  throw new Error('Raw SQL query() is not implemented. Use Prisma client instead.');
};

export default prisma;
