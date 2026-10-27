import mongoose from 'mongoose';
import { ENV } from './env.js';
import { logger } from '../utils/logger.js';

let mongoMemoryServer = null;
let cachedConn = null;

export const connectDB = async () => {
  // If already connected (reused warm serverless instance on Vercel), return existing connection
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (cachedConn) {
    return cachedConn;
  }

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      bufferCommands: false,
    });
    cachedConn = conn;
    logger.info(`MongoDB Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    logger.warn(`Could not connect to external MongoDB at ${ENV.MONGODB_URI}: ${err.message}`);
    
    // In development or test environments, fallback to MongoMemoryServer for seamless local development
    if (ENV.NODE_ENV !== 'production') {
      try {
        logger.info('Starting embedded MongoDB Memory Server for local development/testing...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        logger.info(`Connected to embedded MongoDB at ${memUri}`);
        return conn;
      } catch (memErr) {
        logger.error(`Failed to start MongoDB Memory Server: ${memErr.message}`);
        throw memErr;
      }
    } else {
      throw err;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      logger.info('MongoDB Memory Server stopped.');
    }
  } catch (err) {
    logger.error(`Error disconnecting MongoDB: ${err.message}`);
  }
};
