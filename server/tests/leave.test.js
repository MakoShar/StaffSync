import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seeder.js';
import Leave from '../src/models/Leave.js';
import Notification from '../src/models/Notification.js';

describe('Leave Management Suite', () => {
  let app;
  let hrToken;
  let managerToken;
  let empToken; // Alex Rivers (reports to Sarah Connor)
  let emp2Token; // Elena Rostova
  let pendingLeaveId;

  beforeAll(async () => {
    await connectDB();
    await seedDatabase();
    app = createApp();

    // Login HR
    const hrLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@staffsync.internal', password: 'AdminStaffSync2026!' });
    hrToken = hrLogin.body.token;

    // Login Manager (Sarah Connor)
    const mgrLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'manager@staffsync.internal', password: 'ManagerStaffSync2026!' });
    managerToken = mgrLogin.body.token;

    // Login Employee 1 (Alex Rivers)
    const empLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'employee@staffsync.internal', password: 'EmployeeStaffSync2026!' });
    empToken = empLogin.body.token;

    // Login Employee 2 (Elena Rostova)
    const emp2Login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'employee2@staffsync.internal', password: 'EmployeeStaffSync2026!' });
    emp2Token = emp2Login.body.token;

    // Grab seeded pending leave
    const leave = await Leave.findOne({ status: 'Pending' });
    pendingLeaveId = leave._id.toString();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('POST /api/v1/leaves should submit valid leave request', async () => {
    const res = await request(app)
      .post('/api/v1/leaves')
      .set('Authorization', `Bearer ${emp2Token}`)
      .send({
        leaveType: 'Casual',
        startDate: '2026-11-10',
        endDate: '2026-11-12',
        reason: 'Personal appointments',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.daysCount).toBe(3);
    expect(res.body.data.status).toBe('Pending');
  });

  it('POST /api/v1/leaves should reject inverted dates with 400', async () => {
    const res = await request(app)
      .post('/api/v1/leaves')
      .set('Authorization', `Bearer ${emp2Token}`)
      .send({
        leaveType: 'Sick',
        startDate: '2026-11-15',
        endDate: '2026-11-10',
        reason: 'Typo in dates',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('End date cannot be prior to start date');
  });

  it('POST /api/v1/leaves should reject overlapping leave request with 409', async () => {
    const res = await request(app)
      .post('/api/v1/leaves')
      .set('Authorization', `Bearer ${emp2Token}`)
      .send({
        leaveType: 'Casual',
        startDate: '2026-11-11',
        endDate: '2026-11-14',
        reason: 'Overlapping request test',
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('overlapping');
  });

  it('PATCH /api/v1/leaves/:id/review should prevent self-approval with 403', async () => {
    // Alex tries to review his own pending leave
    const res = await request(app)
      .patch(`/api/v1/leaves/${pendingLeaveId}/review`)
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        status: 'Approved',
        remarks: 'Self approval attempt',
      });

    // Role check or self-approval check denies access
    expect([403]).toContain(res.status);
  });

  it('PATCH /api/v1/leaves/:id/review should allow direct Manager to approve leave with remarks', async () => {
    const res = await request(app)
      .patch(`/api/v1/leaves/${pendingLeaveId}/review`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        status: 'Approved',
        remarks: 'Approved. Enjoy your vacation!',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Approved');
    expect(res.body.data.reviewRemarks).toBe('Approved. Enjoy your vacation!');

    // Verify notification was sent to applicant
    const notif = await Notification.findOne({
      title: 'Leave Request Approved',
      relatedId: pendingLeaveId,
    });
    expect(notif).toBeDefined();
    expect(notif.message).toContain('Enjoy your vacation');
  });

  it('DELETE /api/v1/leaves/:id should reject canceling already approved leave with 400', async () => {
    const res = await request(app)
      .delete(`/api/v1/leaves/${pendingLeaveId}`)
      .set('Authorization', `Bearer ${empToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Cannot cancel');
  });

  it('DELETE /api/v1/leaves/:id should cancel a pending leave request', async () => {
    // Create new pending leave
    const newLeave = await Leave.create({
      employee: (await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${empToken}`)).body.employee._id,
      leaveType: 'Sick',
      startDate: new Date('2026-12-01'),
      endDate: new Date('2026-12-02'),
      daysCount: 2,
      reason: 'Doctor consultation',
      status: 'Pending',
    });

    const res = await request(app)
      .delete(`/api/v1/leaves/${newLeave._id}`)
      .set('Authorization', `Bearer ${empToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Cancelled');
  });
});
