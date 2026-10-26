import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seeder.js';

describe('Reports & Dashboard Analytics Suite', () => {
  let app;
  let hrToken;
  let managerToken;
  let empToken;

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

    // Login Employee (Alex)
    const empLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'employee@staffsync.internal', password: 'EmployeeStaffSync2026!' });
    empToken = empLogin.body.token;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('GET /api/v1/reports/hr-dashboard should return aggregated metrics for HR', async () => {
    const res = await request(app)
      .get('/api/v1/reports/hr-dashboard')
      .set('Authorization', `Bearer ${hrToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics.totalEmployees).toBeGreaterThanOrEqual(4);
    expect(res.body.data.departmentDistribution.length).toBeGreaterThan(0);
    expect(res.body.data.metrics.attendanceRate).toBeDefined();
  });

  it('GET /api/v1/reports/hr-dashboard should forbid non-HR with 403', async () => {
    const res = await request(app)
      .get('/api/v1/reports/hr-dashboard')
      .set('Authorization', `Bearer ${empToken}`);

    expect(res.status).toBe(403);
  });

  it('GET /api/v1/reports/manager-dashboard should return team metrics for Manager', async () => {
    const res = await request(app)
      .get('/api/v1/reports/manager-dashboard')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.teamSize).toBeGreaterThanOrEqual(2);
    expect(res.body.data.directReports.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.pendingApprovalsCount).toBeDefined();
  });

  it('GET /api/v1/reports/manager-dashboard should forbid regular Employee with 403', async () => {
    const res = await request(app)
      .get('/api/v1/reports/manager-dashboard')
      .set('Authorization', `Bearer ${empToken}`);

    expect(res.status).toBe(403);
  });

  it('GET /api/v1/reports/employee-dashboard should return personal summary for Employee', async () => {
    const res = await request(app)
      .get('/api/v1/reports/employee-dashboard')
      .set('Authorization', `Bearer ${empToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.todayAttendance).toBeDefined();
    expect(res.body.data.monthlyStats.daysPresent).toBeGreaterThanOrEqual(1);
    expect(res.body.data.recentAnnouncements).toBeDefined();
  });
});
