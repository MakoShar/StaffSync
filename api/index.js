import { createApp } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';
import User from '../server/src/models/User.js';
import { seedDatabase } from '../server/src/utils/seeder.js';

let app = null;

export default async function handler(req, res) {
  try {
    // 1. Establish/reuse cached MongoDB connection
    await connectDB();

    // 2. Auto-seed initial demo accounts if DB is empty
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        await seedDatabase();
      }
    } catch (seedErr) {
      // Avoid blocking requests if seeding hits concurrency in serverless
      console.warn('Seeding check note:', seedErr.message);
    }

    // 3. Initialize Express app instance
    if (!app) {
      app = createApp();
    }

    // 4. Delegate to Express
    return app(req, res);
  } catch (error) {
    console.error('Vercel Serverless Function Handler Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Serverless execution error',
      error: error.message,
    });
  }
}
