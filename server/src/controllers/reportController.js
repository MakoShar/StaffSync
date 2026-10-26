import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Training from '../models/Training.js';
import Announcement from '../models/Announcement.js';

// Helper to normalize date to UTC start of day
const getNormalizedDate = (d = new Date()) => {
  const normalized = new Date(d);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
};

// @desc    Get real-time HR organization-wide dashboard metrics
// @route   GET /api/v1/reports/hr-dashboard
// @access  Private (HR only)
export const getHrDashboard = async (req, res, next) => {
  try {
    const today = getNormalizedDate();

    // 1. Employee headcount metrics
    const totalEmployees = await Employee.countDocuments({});
    const activeEmployees = await Employee.countDocuments({ status: 'Active' });
    const onLeaveEmployees = await Employee.countDocuments({ status: 'On Leave' });

    // 2. Department distribution
    const departmentDistribution = await Employee.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 3. Today's attendance statistics
    const todayAttendanceCount = await Attendance.countDocuments({ date: today });
    const todayPresent = await Attendance.countDocuments({ date: today, status: { $in: ['Present', 'Half Day'] } });
    const todayLate = await Attendance.countDocuments({ date: today, status: 'Late' });

    const attendanceRate = activeEmployees > 0
      ? Math.round((todayAttendanceCount / activeEmployees) * 100)
      : 0;

    // 4. Leave request metrics
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const approvedLeavesThisMonth = await Leave.countDocuments({
      status: 'Approved',
      startDate: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    // 5. Training programs
    const scheduledTrainings = await Training.countDocuments({ status: 'Scheduled' });

    // 6. Recent leave requests
    const recentLeaves = await Leave.find({})
      .populate('employee', 'firstName lastName employeeId department designation')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalEmployees,
          activeEmployees,
          onLeaveEmployees,
          todayAttendanceCount,
          todayPresent,
          todayLate,
          attendanceRate,
          pendingLeaves,
          approvedLeavesThisMonth,
          scheduledTrainings,
        },
        departmentDistribution: departmentDistribution.map((d) => ({
          department: d._id,
          count: d.count,
        })),
        recentLeaves,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get manager team-scoped dashboard metrics
// @route   GET /api/v1/reports/manager-dashboard
// @access  Private (Manager only)
export const getManagerDashboard = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to current user',
      });
    }

    const today = getNormalizedDate();

    // 1. Direct reports
    const directReports = await Employee.find({
      manager: req.employee._id,
      status: { $ne: 'Terminated' },
    }).select('_id firstName lastName employeeId department designation status');

    const reportIds = directReports.map((r) => r._id);
    const teamSize = directReports.length;

    // 2. Team attendance today
    const teamAttendanceToday = await Attendance.find({
      employee: { $in: reportIds },
      date: today,
    });

    const presentCount = teamAttendanceToday.length;
    const teamAttendanceRate = teamSize > 0
      ? Math.round((presentCount / teamSize) * 100)
      : 0;

    // 3. Pending leave requests from direct reports
    const pendingApprovalsCount = await Leave.countDocuments({
      employee: { $in: reportIds },
      status: 'Pending',
    });

    const pendingApprovals = await Leave.find({
      employee: { $in: reportIds },
      status: 'Pending',
    })
      .populate('employee', 'firstName lastName employeeId department')
      .sort({ createdAt: -1 });

    // 4. Upcoming training sessions for the team's department
    const upcomingTrainings = await Training.find({
      status: 'Scheduled',
      startDate: { $gte: new Date() },
    })
      .sort({ startDate: 1 })
      .limit(3);

    res.status(200).json({
      success: true,
      data: {
        teamSize,
        presentCount,
        teamAttendanceRate,
        pendingApprovalsCount,
        directReports,
        pendingApprovals,
        upcomingTrainings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get employee personal dashboard summary
// @route   GET /api/v1/reports/employee-dashboard
// @access  Private (Self)
export const getEmployeeDashboard = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to current user',
      });
    }

    const today = getNormalizedDate();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Today's attendance
    const todayAttendance = await Attendance.findOne({
      employee: req.employee._id,
      date: today,
    });

    // 2. Monthly attendance stats
    const monthlyRecords = await Attendance.find({
      employee: req.employee._id,
      date: { $gte: firstDayOfMonth },
    });

    const monthlyDaysPresent = monthlyRecords.length;
    const totalHoursWorked = monthlyRecords.reduce((acc, curr) => acc + (curr.workHours || 0), 0);

    // 3. Personal leave stats
    const pendingLeavesCount = await Leave.countDocuments({
      employee: req.employee._id,
      status: 'Pending',
    });

    const approvedLeavesCount = await Leave.countDocuments({
      employee: req.employee._id,
      status: 'Approved',
    });

    // 4. Enrolled trainings
    const enrolledTrainings = await Training.find({
      enrolledEmployees: req.employee._id,
      status: { $in: ['Scheduled', 'In Progress'] },
    }).sort({ startDate: 1 });

    // 5. Recent company announcements
    const recentAnnouncements = await Announcement.find({
      isPublished: true,
      $or: [
        { targetAudience: 'All' },
        { targetAudience: 'Department', targetDepartment: req.employee.department },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      data: {
        todayAttendance: {
          checkedIn: !!todayAttendance,
          checkedOut: !!(todayAttendance && todayAttendance.checkOut),
          checkInTime: todayAttendance ? todayAttendance.checkIn : null,
          checkOutTime: todayAttendance ? todayAttendance.checkOut : null,
          status: todayAttendance ? todayAttendance.status : 'Not Checked In',
        },
        monthlyStats: {
          daysPresent: monthlyDaysPresent,
          totalHours: parseFloat(totalHoursWorked.toFixed(2)),
          pendingLeaves: pendingLeavesCount,
          approvedLeaves: approvedLeavesCount,
          enrolledTrainingsCount: enrolledTrainings.length,
        },
        enrolledTrainings,
        recentAnnouncements,
      },
    });
  } catch (err) {
    next(err);
  }
};
