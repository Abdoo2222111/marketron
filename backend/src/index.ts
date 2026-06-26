import app from './app';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import logger from './utils/logger';

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    const server = app.listen(config.port, () => {
      logger.info(`
═════════════════════════════════════════════════
  🚀  MARKETRON Backend
  🌐  http://localhost:${config.port}
  📖  http://localhost:${config.port}/api-docs
  🔧  Environment: ${config.env}
═════════════════════════════════════════════════
      `);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection', { error: reason?.message || reason });
    });
  } catch (error: any) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();

export default app;
