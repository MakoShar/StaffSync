import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';

// Helper to normalize a date to UTC start-of-day (00:00:00.000)
const getNormalizedDate = (d = new Date()) => {
  const normalized = new Date(d);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
};

// @desc    Record employee daily check-in
// @route   POST /api/v1/attendance/check-in
// @access  Private (All authenticated employees)
export const checkIn = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to current user',
      });
    }

    const todayDate = getNormalizedDate();
    const existing = await Attendance.findOne({
      employee: req.employee._id,
      date: todayDate,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already checked in today',
        data: existing,
      });
    }

    const now = new Date();
    // Check if late (e.g. after 09:30 local/UTC time)
    const isLate = now.getUTCHours() > 9 || (now.getUTCHours() === 9 && now.getUTCMinutes() > 30);
    const status = isLate ? 'Late' : 'Present';

    const attendance = await Attendance.create({
      employee: req.employee._id,
      date: todayDate,
      checkIn: now,
      status,
      remarks: req.body.remarks || '',
    });

    res.status(201).json({
      success: true,
      message: 'Check-in recorded successfully',
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record employee daily check-out & calculate work hours
// @route   POST /api/v1/attendance/check-out
// @access  Private (All authenticated employees)
export const checkOut = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to current user',
      });
    }

    const todayDate = getNormalizedDate();
    const attendance = await Attendance.findOne({
      employee: req.employee._id,
      date: todayDate,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today. Please check in first.',
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today',
        data: attendance,
      });
    }

    const now = new Date();
    attendance.checkOut = now;

    // Calculate elapsed hours
    const diffMs = now.getTime() - new Date(attendance.checkIn).getTime();
    const hours = Math.max(0, diffMs / (1000 * 60 * 60));
    attendance.workHours = parseFloat(hours.toFixed(2));

    // If worked less than 4 hours, mark as Half Day
    if (attendance.workHours < 4 && attendance.status !== 'Late') {
      attendance.status = 'Half Day';
    }

    if (req.body.remarks) {
      attendance.remarks = attendance.remarks
        ? `${attendance.remarks} | ${req.body.remarks}`
        : req.body.remarks;
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Check-out recorded successfully',
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get today's check-in status for authenticated user
// @route   GET /api/v1/attendance/today
// @access  Private (Self)
export const getTodayStatus = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(200).json({
        success: true,
        checkedIn: false,
        data: null,
      });
    }

    const todayDate = getNormalizedDate();
    const attendance = await Attendance.findOne({
      employee: req.employee._id,
      date: todayDate,
    });

    res.status(200).json({
      success: true,
      checkedIn: !!attendance,
      checkedOut: !!(attendance && attendance.checkOut),
      data: attendance || null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get personal attendance history with date range filtering
// @route   GET /api/v1/attendance/my-history
// @access  Private (Self)
export const getMyHistory = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to current user',
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const query = { employee: req.employee._id };

    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: getNormalizedDate(req.query.startDate),
        $lte: getNormalizedDate(req.query.endDate),
      };
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: records,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get team attendance for a given date
// @route   GET /api/v1/attendance/team
// @access  Private (Manager only)
export const getTeamAttendance = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to current user',
      });
    }

    const targetDate = req.query.date ? getNormalizedDate(req.query.date) : getNormalizedDate();

    // Fetch direct reports
    const directReports = await Employee.find({
      manager: req.employee._id,
      status: { $ne: 'Terminated' },
    }).select('_id firstName lastName employeeId department designation');

    const reportIds = directReports.map((r) => r._id);

    // Fetch attendance for direct reports on this date
    const attendanceRecords = await Attendance.find({
      employee: { $in: reportIds },
      date: targetDate,
    }).populate('employee', 'firstName lastName employeeId department designation');

    // Build comprehensive list including who has not checked in
    const recordsByEmpId = new Map();
    attendanceRecords.forEach((rec) => {
      recordsByEmpId.set(rec.employee._id.toString(), rec);
    });

    const teamStatus = directReports.map((emp) => {
      const record = recordsByEmpId.get(emp._id.toString());
      return {
        employee: emp,
        attendance: record || null,
        status: record ? record.status : 'Absent/Not Checked In',
      };
    });

    res.status(200).json({
      success: true,
      date: targetDate,
      count: teamStatus.length,
      data: teamStatus,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get organization-wide attendance records with filtering
// @route   GET /api/v1/attendance/all
// @access  Private (HR only)
export const getAllAttendance = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.date) {
      query.date = getNormalizedDate(req.query.date);
    } else if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: getNormalizedDate(req.query.startDate),
        $lte: getNormalizedDate(req.query.endDate),
      };
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by employee ID or name
    let employeeQuery = {};
    if (req.query.department) {
      employeeQuery.department = req.query.department;
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      employeeQuery.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeId: searchRegex },
      ];
    }

    if (Object.keys(employeeQuery).length > 0) {
      const matchingEmployees = await Employee.find(employeeQuery).select('_id');
      const matchingIds = matchingEmployees.map((e) => e._id);
      query.employee = { $in: matchingIds };
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId department designation')
      .sort({ date: -1, checkIn: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: records,
    });
  } catch (err) {
    next(err);
  }
};
