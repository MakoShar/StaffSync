import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seeder.js';
import Employee from '../src/models/Employee.js';

describe('Employee & Manager Module Suite', () => {
  let app;
  let hrToken;
  let managerToken;
  let empToken;
  let alexEmployeeId;
  let elenaEmployeeId;

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

    // Login Employee (Alex Rivers)
    const empLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'employee@staffsync.internal', password: 'EmployeeStaffSync2026!' });
    empToken = empLogin.body.token;
    alexEmployeeId = empLogin.body.employee._id;

    // Find Elena's employee ID
    const elena = await Employee.findOne({ employeeId: 'EMP-004' });
    elenaEmployeeId = elena._id.toString();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('GET /api/v1/employees should allow HR to view paginated employees', async () => {
    const res = await request(app)
      .get('/api/v1/employees?page=1&limit=10')
      .set('Authorization', `Bearer ${hrToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);
    expect(res.body.total).toBeDefined();
  });

  it('GET /api/v1/employees should reject non-HR users with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/employees')
      .set('Authorization', `Bearer ${empToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/employees/directory should allow all authenticated users', async () => {
    const res = await request(app)
      .get('/api/v1/employees/directory')
      .set('Authorization', `Bearer ${empToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].firstName).toBeDefined();
  });

  it('POST /api/v1/employees should allow HR to create a new employee', async () => {
    const res = await request(app)
      .post('/api/v1/employees')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        email: 'newhire@staffsync.internal',
        password: 'NewHireStaffSync2026!',
        role: 'Employee',
        employeeId: 'EMP-999',
        firstName: 'Sam',
        lastName: 'Taylor',
        department: 'Sales',
        designation: 'Account Executive',
        phone: '+1 555-9999',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.employeeId).toBe('EMP-999');
    expect(res.body.data.user.email).toBe('newhire@staffsync.internal');
  });

  it('POST /api/v1/employees should forbid Employee from creating employees', async () => {
    const res = await request(app)
      .post('/api/v1/employees')
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        email: 'unauthorized@staffsync.internal',
        password: 'Pass12345!',
        employeeId: 'EMP-000',
        firstName: 'Hacker',
        lastName: 'Attempt',
        department: 'Engineering',
        designation: 'Engineer',
      });

    expect(res.status).toBe(403);
  });

  it('GET /api/v1/employees/:id should prevent employee from viewing other employee private profile', async () => {
    // Alex attempts to inspect Elena's full private profile
    const res = await request(app)
      .get(`/api/v1/employees/${elenaEmployeeId}`)
      .set('Authorization', `Bearer ${empToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden');
  });

  it('GET /api/v1/employees/:id should allow employee to view their own profile', async () => {
    const res = await request(app)
      .get(`/api/v1/employees/${alexEmployeeId}`)
      .set('Authorization', `Bearer ${empToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe('Alex');
  });

  it('PATCH /api/v1/employees/profile/me allows employee to update permitted contact fields only', async () => {
    const res = await request(app)
      .patch('/api/v1/employees/profile/me')
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        phone: '+1 555-8888',
        address: { street: '123 New Home Rd', city: 'San Francisco', state: 'CA', postalCode: '94110' },
        // Attempting to self-promote or change department should NOT work:
        department: 'Human Resources',
        designation: 'Chief Executive Officer',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.phone).toBe('+1 555-8888');
    expect(res.body.data.address.street).toBe('123 New Home Rd');
    // Designation remains unchanged
    expect(res.body.data.designation).toBe('Senior Full Stack Engineer');
    expect(res.body.data.department).toBe('Engineering');
  });

  it('GET /api/v1/managers/my-team should return direct reports for Manager', async () => {
    const res = await request(app)
      .get('/api/v1/managers/my-team')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(2); // Alex and Elena
  });
});
