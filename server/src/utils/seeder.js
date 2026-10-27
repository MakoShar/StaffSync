import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { ENV } from '../config/env.js';
import { logger } from './logger.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Announcement from '../models/Announcement.js';
import Training from '../models/Training.js';
import Notification from '../models/Notification.js';

export const seedDatabase = async () => {
  try {
    logger.info('Starting StaffSync Database Seeding...');

    // Clear existing data for fresh seed
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Announcement.deleteMany({});
    await Training.deleteMany({});
    await Notification.deleteMany({});

    logger.info('Cleared existing collections.');

    // 1. Create HR Admin User & Employee
    const hrUser = await User.create({
      email: ENV.SEED_HR_EMAIL,
      password: ENV.SEED_HR_PASSWORD,
      role: 'HR',
      isActive: true,
    });

    const hrEmployee = await Employee.create({
      user: hrUser._id,
      employeeId: 'EMP-001',
      firstName: ENV.SEED_HR_FIRSTNAME,
      lastName: ENV.SEED_HR_LASTNAME,
      phone: '+1 555-0101',
      department: 'Human Resources',
      designation: 'HR Director',
      joiningDate: new Date('2023-01-15'),
      address: {
        street: '100 Enterprise Way',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1 555-0102',
      },
      status: 'Active',
    });

    // 2. Create Manager User & Employee
    const managerUser = await User.create({
      email: 'manager@staffsync.internal',
      password: 'ManagerStaffSync2026!',
      role: 'Manager',
      isActive: true,
    });

    const managerEmployee = await Employee.create({
      user: managerUser._id,
      employeeId: 'EMP-002',
      firstName: 'Sarah',
      lastName: 'Connor',
      phone: '+1 555-0201',
      department: 'Engineering',
      designation: 'Engineering Manager',
      joiningDate: new Date('2023-03-01'),
      manager: hrEmployee._id,
      address: {
        street: '250 Innovation Blvd',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94107',
      },
      emergencyContact: {
        name: 'John Connor',
        relationship: 'Son',
        phone: '+1 555-0202',
      },
      status: 'Active',
    });

    // 3. Create Employee 1 (Direct report to Manager)
    const emp1User = await User.create({
      email: 'employee@staffsync.internal',
      password: 'EmployeeStaffSync2026!',
      role: 'Employee',
      isActive: true,
    });

    const emp1Employee = await Employee.create({
      user: emp1User._id,
      employeeId: 'EMP-003',
      firstName: 'Alex',
      lastName: 'Rivers',
      phone: '+1 555-0301',
      department: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      joiningDate: new Date('2023-06-10'),
      manager: managerEmployee._id,
      address: {
        street: '42 Silicon Avenue',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94103',
      },
      emergencyContact: {
        name: 'Morgan Rivers',
        relationship: 'Sibling',
        phone: '+1 555-0302',
      },
      status: 'Active',
    });

    // 4. Create Employee 2 (Direct report to Manager)
    const emp2User = await User.create({
      email: 'employee2@staffsync.internal',
      password: 'EmployeeStaffSync2026!',
      role: 'Employee',
      isActive: true,
    });

    const emp2Employee = await Employee.create({
      user: emp2User._id,
      employeeId: 'EMP-004',
      firstName: 'Elena',
      lastName: 'Rostova',
      phone: '+1 555-0401',
      department: 'Engineering',
      designation: 'Frontend Engineer',
      joiningDate: new Date('2024-01-15'),
      manager: managerEmployee._id,
      address: {
        street: '88 Market St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
      },
      emergencyContact: {
        name: 'Dmitri Rostov',
        relationship: 'Parent',
        phone: '+1 555-0402',
      },
      status: 'Active',
    });

    logger.info('Users and Employees seeded successfully.');

    // 5. Seed 30-Day Historical Attendance (Leave Today Open for Interactive Testing)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Seed past 29 days of realistic attendance history for Alex Rivers (EMP-003)
    const attendanceRecords = [];
    for (let i = 29; i >= 1; i--) {
      const pastDate = new Date(today);
      pastDate.setUTCDate(pastDate.getUTCDate() - i);
      const dayOfWeek = pastDate.getUTCDay();

      // Skip Sundays (0) and Saturdays (6)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const inTime = new Date(pastDate);
        inTime.setUTCHours(9, 0, 0, 0);
        const outTime = new Date(pastDate);
        outTime.setUTCHours(17, 30, 0, 0);

        // Mix in a late day and a half day for visual variety
        let status = 'Present';
        let workHours = 8.5;
        let remarks = 'Regular workday';

        if (i === 7) {
          status = 'Late';
          inTime.setUTCHours(10, 15, 0, 0);
          workHours = 7.25;
          remarks = 'Traffic delay';
        } else if (i === 15) {
          status = 'Half Day';
          outTime.setUTCHours(13, 0, 0, 0);
          workHours = 4.0;
          remarks = 'Personal emergency afternoon';
        }

        attendanceRecords.push({
          employee: emp1Employee._id,
          date: pastDate,
          checkIn: inTime,
          checkOut: outTime,
          workHours,
          status,
          remarks,
        });
      }
    }

    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
    }

    logger.info(`Seeded ${attendanceRecords.length} historical attendance days for Alex Rivers.`);

    // 6. Seed Leaves
    const leaveStart = new Date(today);
    leaveStart.setUTCDate(leaveStart.getUTCDate() + 5);
    const leaveEnd = new Date(today);
    leaveEnd.setUTCDate(leaveEnd.getUTCDate() + 7);

    // Pending leave for Alex Rivers
    const pendingLeave = await Leave.create({
      employee: emp1Employee._id,
      leaveType: 'Annual',
      startDate: leaveStart,
      endDate: leaveEnd,
      daysCount: 3,
      reason: 'Family vacation and personal travel',
      status: 'Pending',
    });

    // Approved leave in the past for Elena
    const pastLeaveStart = new Date(today);
    pastLeaveStart.setUTCDate(pastLeaveStart.getUTCDate() - 14);
    const pastLeaveEnd = new Date(today);
    pastLeaveEnd.setUTCDate(pastLeaveEnd.getUTCDate() - 13);
    await Leave.create({
      employee: emp2Employee._id,
      leaveType: 'Sick',
      startDate: pastLeaveStart,
      endDate: pastLeaveEnd,
      daysCount: 2,
      reason: 'Flu symptoms and medical checkup',
      status: 'Approved',
      reviewer: managerEmployee._id,
      reviewedAt: pastLeaveStart,
      reviewRemarks: 'Approved. Get well soon!',
    });

    logger.info('Sample leaves seeded.');

    // 7. Seed Announcements
    await Announcement.create([
      {
        title: 'Welcome to StaffSync HRMS Platform',
        content:
          'We are excited to launch StaffSync across the entire organization. Please verify your profile information and familiarize yourself with the attendance marking and leave application features.',
        author: hrEmployee._id,
        targetAudience: 'All',
        priority: 'High',
        isPublished: true,
      },
      {
        title: 'Q4 Engineering Architecture Review',
        content:
          'All engineering team members are requested to review the updated microservices and API specifications before Friday.',
        author: managerEmployee._id,
        targetAudience: 'Department',
        targetDepartment: 'Engineering',
        priority: 'Medium',
        isPublished: true,
      },
    ]);

    logger.info('Sample announcements seeded.');

    // 8. Seed Trainings
    const trainStart = new Date(today);
    trainStart.setUTCDate(trainStart.getUTCDate() + 10);
    const trainEnd = new Date(today);
    trainEnd.setUTCDate(trainEnd.getUTCDate() + 12);

    await Training.create([
      {
        title: 'Full-Stack TypeScript & React 19 Mastery',
        description: 'Advanced modern front-end architectures, state machines, and performance optimizations.',
        instructor: 'Dr. Evelyn Carter',
        department: 'Engineering',
        startDate: trainStart,
        endDate: trainEnd,
        capacity: 25,
        enrolledEmployees: [emp1Employee._id],
        status: 'Scheduled',
      },
      {
        title: 'Inclusive Leadership & Agile Team Operations',
        description: 'Practices for leading cross-functional squads and fostering high-trust engineering teams.',
        instructor: 'Marcus Vance',
        department: 'General Management',
        startDate: trainStart,
        endDate: trainEnd,
        capacity: 15,
        enrolledEmployees: [managerEmployee._id],
        status: 'Scheduled',
      },
    ]);

    logger.info('Sample training programs seeded.');

    // 9. Seed Notifications
    await Notification.create([
      {
        recipient: managerUser._id,
        title: 'New Leave Request from Alex Rivers',
        message: 'Alex Rivers has requested 3 days of Annual Leave for review.',
        type: 'Leave',
        relatedId: pendingLeave._id,
        isRead: false,
      },
      {
        recipient: emp1User._id,
        title: 'Welcome to StaffSync',
        message: 'Your employee profile is active. You can mark attendance and apply for leaves.',
        type: 'System',
        isRead: true,
      },
    ]);

    logger.info('Sample notifications seeded.');
    logger.info('=============================================');
    logger.info('StaffSync Seed Complete! Demo Credentials:');
    logger.info(`- HR Admin:  ${ENV.SEED_HR_EMAIL} / ${ENV.SEED_HR_PASSWORD}`);
    logger.info('- Manager:   manager@staffsync.internal / ManagerStaffSync2026!');
    logger.info('- Employee:  employee@staffsync.internal / EmployeeStaffSync2026!');
    logger.info('=============================================');
  } catch (err) {
    logger.error('Seeding error:', err);
    throw err;
  }
};

// Execute if run directly from CLI
if (process.argv[1]?.endsWith('seeder.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  })();
}
