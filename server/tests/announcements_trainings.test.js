import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seeder.js';
import Training from '../src/models/Training.js';

describe('Announcements, Training & Notifications Suite', () => {
  let app;
  let hrToken;
  let managerToken;
  let emp2Token; // Elena
  let sampleTrainingId;

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

    // Login Elena (Employee)
    const emp2Login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'employee2@staffsync.internal', password: 'EmployeeStaffSync2026!' });
    emp2Token = emp2Login.body.token;

    const training = await Training.findOne({ title: /TypeScript/ });
    sampleTrainingId = training._id.toString();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('POST /api/v1/announcements should allow HR to publish announcement', async () => {
    const res = await request(app)
      .post('/api/v1/announcements')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        title: 'Annual Company Offsite Announced',
        content: 'Join us for our annual strategy conference in Lake Tahoe this autumn.',
        targetAudience: 'All',
        priority: 'High',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toContain('Annual Company Offsite');
  });

  it('POST /api/v1/announcements should reject Employee with 403', async () => {
    const res = await request(app)
      .post('/api/v1/announcements')
      .set('Authorization', `Bearer ${emp2Token}`)
      .send({
        title: 'Unauthorized announcement',
        content: 'Should fail',
      });

    expect(res.status).toBe(403);
  });

  it('GET /api/v1/announcements should return visible announcements to employee', async () => {
    const res = await request(app)
      .get('/api/v1/announcements')
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/trainings should allow Manager to create training program', async () => {
    const res = await request(app)
      .post('/api/v1/trainings')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Microservices with Node.js & Docker',
        description: 'Hands-on workshop on event-driven architectures.',
        instructor: 'Sarah Connor',
        startDate: '2026-11-20',
        endDate: '2026-11-22',
        capacity: 20,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.capacity).toBe(20);
  });

  it('POST /api/v1/trainings/:id/enroll should allow Employee to enroll in training', async () => {
    const res = await request(app)
      .post(`/api/v1/trainings/${sampleTrainingId}/enroll`)
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('enrolled');
  });

  it('POST /api/v1/trainings/:id/enroll should prevent duplicate enrollment with 400', async () => {
    const res = await request(app)
      .post(`/api/v1/trainings/${sampleTrainingId}/enroll`)
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already enrolled');
  });

  it('POST /api/v1/trainings/:id/withdraw should allow Employee to withdraw', async () => {
    const res = await request(app)
      .post(`/api/v1/trainings/${sampleTrainingId}/withdraw`)
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/notifications should fetch user notifications and unread count', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.unreadCount).toBeGreaterThanOrEqual(1);

    // Test mark as read
    const firstNotifId = res.body.data[0]._id;
    const readRes = await request(app)
      .patch(`/api/v1/notifications/${firstNotifId}/read`)
      .set('Authorization', `Bearer ${emp2Token}`);

    expect(readRes.status).toBe(200);
    expect(readRes.body.data.isRead).toBe(true);
  });
});
