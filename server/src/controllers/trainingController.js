import Training from '../models/Training.js';
import Notification from '../models/Notification.js';

// @desc    Get training programs
// @route   GET /api/v1/trainings
// @access  Private (All authenticated users)
export const getTrainings = async (req, res, next) => {
  try {
    const query = {};

    if (req.query.department) {
      query.$or = [{ department: null }, { department: req.query.department }];
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const trainings = await Training.find(query)
      .populate('enrolledEmployees', 'firstName lastName employeeId department designation')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new training session
// @route   POST /api/v1/trainings
// @access  Private (Manager or HR)
export const createTraining = async (req, res, next) => {
  try {
    const {
      title,
      description,
      instructor,
      department,
      startDate,
      endDate,
      capacity = 30,
    } = req.body;

    if (!title || !description || !instructor || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, description, instructor, startDate, endDate)',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be prior to start date',
      });
    }

    const training = await Training.create({
      title: title.trim(),
      description: description.trim(),
      instructor: instructor.trim(),
      department: department || null,
      startDate: start,
      endDate: end,
      capacity: parseInt(capacity, 10) || 30,
      enrolledEmployees: [],
      status: 'Scheduled',
    });

    res.status(201).json({
      success: true,
      message: 'Training program scheduled successfully',
      data: training,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Enroll authenticated employee into training
// @route   POST /api/v1/trainings/:id/enroll
// @access  Private (All authenticated employees)
export const enrollTraining = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to current user',
      });
    }

    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    if (training.status === 'Cancelled' || training.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot enroll in a program that is ${training.status.toLowerCase()}`,
      });
    }

    // Check duplicate enrollment
    const isEnrolled = training.enrolledEmployees.some(
      (id) => id.toString() === req.employee._id.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this training program',
      });
    }

    // Check capacity
    if (training.enrolledEmployees.length >= training.capacity) {
      return res.status(400).json({
        success: false,
        message: 'This training session has reached maximum capacity',
      });
    }

    training.enrolledEmployees.push(req.employee._id);
    await training.save();

    // Trigger notification to employee
    await Notification.create({
      recipient: req.user._id,
      title: 'Training Enrollment Confirmed',
      message: `You are confirmed for "${training.title}" starting on ${training.startDate.toISOString().split('T')[0]}.`,
      type: 'Training',
      relatedId: training._id,
    });

    const updated = await Training.findById(training._id).populate(
      'enrolledEmployees',
      'firstName lastName employeeId department'
    );

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in training program',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Withdraw employee from training
// @route   POST /api/v1/trainings/:id/withdraw
// @access  Private (Self)
export const withdrawTraining = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to current user',
      });
    }

    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    training.enrolledEmployees = training.enrolledEmployees.filter(
      (id) => id.toString() !== req.employee._id.toString()
    );

    await training.save();

    res.status(200).json({
      success: true,
      message: 'Successfully withdrawn from training program',
      data: training,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update training details or status
// @route   PUT /api/v1/trainings/:id
// @access  Private (Manager or HR)
export const updateTraining = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    const {
      title,
      description,
      instructor,
      department,
      startDate,
      endDate,
      capacity,
      status,
    } = req.body;

    if (title) training.title = title.trim();
    if (description) training.description = description.trim();
    if (instructor) training.instructor = instructor.trim();
    if (department !== undefined) training.department = department;
    if (startDate) training.startDate = new Date(startDate);
    if (endDate) training.endDate = new Date(endDate);
    if (capacity) training.capacity = parseInt(capacity, 10);
    if (status) training.status = status;

    await training.save();

    res.status(200).json({
      success: true,
      message: 'Training program updated successfully',
      data: training,
    });
  } catch (err) {
    next(err);
  }
};
