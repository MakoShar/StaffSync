import { createApp } from './src/app.js';
import { connectDB, disconnectDB } from './src/config/db.js';
import { ENV } from './src/config/env.js';
import { logger } from './src/utils/logger.js';

const startServer = async () => {
  try {
    await connectDB();
    const app = createApp();

    const server = app.listen(ENV.PORT, () => {
      logger.info(`StaffSync API Server is running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
      logger.info(`Health check available at http://localhost:${ENV.PORT}/api/v1/health`);
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} signal received: closing HTTP server...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
