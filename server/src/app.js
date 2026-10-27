import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import trainingRoutes from './routes/trainingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

export const createApp = () => {
  const app = express();

  // Security HTTP headers
  app.use(helmet());

  // CORS configuration supporting local dev and Vercel cloud domains
  const allowedOrigins = [
    ENV.CORS_ORIGIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow mobile apps, curl, server-to-server or no-origin requests
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          ENV.CORS_ORIGIN === '*' ||
          origin.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Auth rate limiting (100 requests per 15 mins for login)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Health check endpoint
  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
      success: true,
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'StaffSync HRMS API',
      version: '1.0.0',
    });
  });

  // Apply rate limiter to auth login
  app.use('/api/v1/auth/login', authLimiter);

  // API Domain Routers
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/employees', employeeRoutes);
  app.use('/api/v1/managers', managerRoutes);
  app.use('/api/v1/attendance', attendanceRoutes);
  app.use('/api/v1/leaves', leaveRoutes);
  app.use('/api/v1/announcements', announcementRoutes);
  app.use('/api/v1/trainings', trainingRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/reports', reportRoutes);

  // 404 & Centralized Error Handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
