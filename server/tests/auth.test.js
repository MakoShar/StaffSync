import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seeder.js';
import User from '../src/models/User.js';

describe('Authentication & Authorization Suite', () => {
  let app;

  beforeAll(async () => {
    await connectDB();
    await seedDatabase();
    app = createApp();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('POST /api/v1/auth/login should authenticate HR admin with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@staffsync.internal',
        password: 'AdminStaffSync2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('HR');
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.employee).toBeDefined();
    expect(res.body.employee.firstName).toBe('System');
  });

  it('POST /api/v1/auth/login should authenticate Manager and Employee', async () => {
    const mgrRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'manager@staffsync.internal',
        password: 'ManagerStaffSync2026!',
      });
    expect(mgrRes.status).toBe(200);
    expect(mgrRes.body.user.role).toBe('Manager');

    const empRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'employee@staffsync.internal',
        password: 'EmployeeStaffSync2026!',
      });
    expect(empRes.status).toBe(200);
    expect(empRes.body.user.role).toBe('Employee');
  });

  it('POST /api/v1/auth/login should reject incorrect password with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@staffsync.internal',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.token).toBeUndefined();
  });

  it('POST /api/v1/auth/login should reject non-existent email with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@staffsync.internal',
        password: 'AnyPassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login should return 400 when missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@staffsync.internal' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me should return current user when token is provided', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'employee@staffsync.internal',
        password: 'EmployeeStaffSync2026!',
      });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('employee@staffsync.internal');
    expect(meRes.body.employee.designation).toBe('Senior Full Stack Engineer');
  });

  it('GET /api/v1/auth/me should reject request without token with 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me should reject request with invalid token with 401', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid_garbage_token');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login should reject deactivated user with 403', async () => {
    await User.updateOne({ email: 'employee2@staffsync.internal' }, { isActive: false });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'employee2@staffsync.internal',
        password: 'EmployeeStaffSync2026!',
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('deactivated');
  });
});
