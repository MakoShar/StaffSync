import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/staffsync',
  JWT_SECRET: process.env.JWT_SECRET || 'staffsync_dev_jwt_secret_key_change_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  SEED_HR_EMAIL: process.env.SEED_HR_EMAIL || 'admin@staffsync.internal',
  SEED_HR_PASSWORD: process.env.SEED_HR_PASSWORD || 'AdminStaffSync2026!',
  SEED_HR_FIRSTNAME: process.env.SEED_HR_FIRSTNAME || 'System',
  SEED_HR_LASTNAME: process.env.SEED_HR_LASTNAME || 'Administrator',
};
