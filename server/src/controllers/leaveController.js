import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Helper to normalize date to UTC midnight
const getNormalizedDate = (d) => {
  const normalized = new Date(d);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
};

// @desc    Submit a new leave application
// @route   POST /api/v1/leaves
// @access  Private (All authenticated employees)
export const applyLeave = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to current user',
      });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: leaveType, startDate, endDate, and reason',
      });
    }

    const start = getNormalizedDate(startDate);
    const end = getNormalizedDate(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start or end date format',
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be prior to start date',
      });
    }

    // Calculate days count (inclusive)
    const diffTime = Math.abs(end - start);
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping leaves for this employee that are Pending or Approved
    const overlap = await Leave.findOne({
      employee: req.employee._id,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlap) {
      return res.status(409).json({
        success: false,
        message: `You already have a ${overlap.status.toLowerCase()} leave request overlapping the requested date range (${overlap.startDate.toISOString().split('T')[0]} to ${overlap.endDate.toISOString().split('T')[0]})`,
      });
    }

    const leave = await Leave.create({
      employee: req.employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      reason: reason.trim(),
      status: 'Pending',
    });

    // Notify Manager or HR
    const currentEmp = await Employee.findById(req.employee._id).populate('manager');
    let recipientUserId = null;

    if (currentEmp.manager) {
      const managerUser = await User.findOne({ _id: currentEmp.manager.user });
      if (managerUser) recipientUserId = managerUser._id;
    }

    if (!recipientUserId) {
      // Find an HR user if no direct manager
      const hrUser = await User.findOne({ role: 'HR', isActive: true });
      if (hrUser) recipientUserId = hrUser._id;
    }

    if (recipientUserId) {
      await Notification.create({
        recipient: recipientUserId,
        title: `New Leave Request: ${currentEmp.firstName} ${currentEmp.lastName}`,
        message: `${currentEmp.firstName} ${currentEmp.lastName} applied for ${daysCount} day(s) of ${leaveType} leave starting ${start.toISOString().split('T')[0]}.`,
        type: 'Leave',
        relatedId: leave._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get authenticated employee's leave requests
// @route   GET /api/v1/leaves/my-leaves
// @access  Private (Self)
export const getMyLeaves = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to current user',
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { employee: req.employee._id };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('reviewer', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: leaves.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: leaves,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get leave requests of team members for review
// @route   GET /api/v1/leaves/team-leaves
// @access  Private (Manager only)
export const getTeamLeaves = async (req, res, next) => {
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

    // Find direct reports
    const directReports = await Employee.find({ manager: req.employee._id }).select('_id');
    const reportIds = directReports.map((r) => r._id);

    const query = { employee: { $in: reportIds } };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId department designation')
      .populate('reviewer', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: leaves.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: leaves,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all organization leave requests
// @route   GET /api/v1/leaves/all
// @access  Private (HR only)
export const getAllLeaves = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.leaveType) {
      query.leaveType = req.query.leaveType;
    }

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId department designation')
      .populate('reviewer', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: leaves.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: leaves,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject a leave application
// @route   PATCH /api/v1/leaves/:id/review
// @access  Private (Manager or HR)
export const reviewLeave = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Rejected',
      });
    }

    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This leave request has already been ${leave.status.toLowerCase()}`,
      });
    }

    // Prevention of self-approval
    if (req.employee && leave.employee._id.toString() === req.employee._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot approve or reject your own leave request',
      });
    }

    // Manager boundary check: can only approve direct reports
    if (req.user.role === 'Manager') {
      const isDirectReport =
        leave.employee.manager &&
        req.employee &&
        leave.employee.manager.toString() === req.employee._id.toString();

      if (!isDirectReport) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only review leave requests for your direct reports',
        });
      }
    }

    leave.status = status;
    leave.reviewer = req.employee ? req.employee._id : null;
    leave.reviewedAt = new Date();
    leave.reviewRemarks = remarks || '';
    await leave.save();

    // Notify the employee applicant
    const applicantUser = await User.findById(leave.employee.user);
    if (applicantUser) {
      await Notification.create({
        recipient: applicantUser._id,
        title: `Leave Request ${status}`,
        message: `Your ${leave.leaveType} leave request for ${leave.startDate.toISOString().split('T')[0]} has been ${status.toLowerCase()}.${remarks ? ` Remarks: ${remarks}` : ''}`,
        type: 'Leave',
        relatedId: leave._id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()}`,
      data: leave,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a pending leave application
// @route   DELETE /api/v1/leaves/:id
// @access  Private (Self only)
export const cancelLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }

    if (leave.employee.toString() !== req.employee._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only cancel your own leave requests',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a leave request that is already ${leave.status.toLowerCase()}`,
      });
    }

    leave.status = 'Cancelled';
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
      data: leave,
    });
  } catch (err) {
    next(err);
  }
};
