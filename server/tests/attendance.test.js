import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seeder.js';
import Attendance from '../src/models/Attendance.js';
import Employee from '../src/models/Employee.js';

describe('Attendance Management Suite', () => {
  let app;
  let hrToken;
  let managerToken;
  let emp2Token;
  let emp2Employee;

  beforeAll(async () => {
    await connectDB();
    await seedDatabase();
    app = createApp();

    // Login HR
    const hrLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@staffsync.internal', password: 'AdminStaffSync2026!' });
    hrToken = hrLogin.body.token;

    // Login Manager
    const mgrLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'manager@staffsync.internal', password: 'ManagerStaffSync2026!' });
    managerToken = mgrLogin.body.token;

    // Login Elena (emp2) who has not checked in today yet
    const emp2Login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'employee2@staffsync.internal', password: 'EmployeeStaffSync2026!' });
    emp2Token = emp2Login.body.token;
    emp2Employee = emp2Login.body.employee;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('GET /api/v1/attendance/today should return checkedIn: false when not checked in', async () => {
    const res = await request(app)
      .get('/api/v1/attendance/today')
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(res.status).toBe(200);
    expect(res.body.checkedIn).toBe(false);
  });

  it('POST /api/v1/attendance/check-out should reject check-out before check-in', async () => {
    const res = await request(app)
      .post('/api/v1/attendance/check-out')
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('No check-in record found');
  });

  it('POST /api/v1/attendance/check-in should record daily check-in', async () => {
    const res = await request(app)
      .post('/api/v1/attendance/check-in')
      .set('Authorization', `Bearer ${emp2Token}`)
      .send({ remarks: 'Morning standup arrival' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.checkIn).toBeDefined();
    expect(res.body.data.employee.toString()).toBe(emp2Employee._id);
  });

  it('POST /api/v1/attendance/check-in should prevent duplicate check-in with 409', async () => {
    const res = await request(app)
      .post('/api/v1/attendance/check-in')
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already checked in');
  });

  it('POST /api/v1/attendance/check-out should record checkout and calculate work hours', async () => {
    const res = await request(app)
      .post('/api/v1/attendance/check-out')
      .set('Authorization', `Bearer ${emp2Token}`)
      .send({ remarks: 'Finished workday tasks' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.checkOut).toBeDefined();
    expect(res.body.data.workHours).toBeDefined();
  });

  it('POST /api/v1/attendance/check-out should prevent duplicate check-out with 400', async () => {
    const res = await request(app)
      .post('/api/v1/attendance/check-out')
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already checked out');
  });

  it('GET /api/v1/attendance/my-history should return personal attendance logs', async () => {
    const res = await request(app)
      .get('/api/v1/attendance/my-history')
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/attendance/team should allow Manager to view direct reports presence', async () => {
    const res = await request(app)
      .get('/api/v1/attendance/team')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/v1/attendance/all should allow HR to view organization-wide attendance', async () => {
    const res = await request(app)
      .get('/api/v1/attendance/all')
      .set('Authorization', `Bearer ${hrToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/v1/attendance/my-calendar should return 30-day matrix and summary', async () => {
    const res = await request(app)
      .get('/api/v1/attendance/my-calendar')
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.days.length).toBe(30);
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.totalDays).toBe(30);
    expect(res.body.summary.workingDays).toBeGreaterThan(0);
  });

  it('POST /api/v1/attendance/reset-today should clear today attendance for employee', async () => {
    // 1. Check in today
    await request(app)
      .post('/api/v1/attendance/check-in')
      .set('Authorization', `Bearer ${emp2Token}`)
      .send({ remarks: 'Checking in' });

    // 2. Reset today
    const resetRes = await request(app)
      .post('/api/v1/attendance/reset-today')
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // 3. Verify today status is cleared
    const statusRes = await request(app)
      .get('/api/v1/attendance/today')
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(statusRes.body.checkedIn).toBe(false);
  });

  it('GET /api/v1/attendance/all should forbid regular Employee with 403', async () => {
    const res = await request(app)
      .get('/api/v1/attendance/all')
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(res.status).toBe(403);
  });
});
