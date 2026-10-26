import Employee from '../models/Employee.js';

// @desc    Get list of all managers (for assignment dropdowns)
// @route   GET /api/v1/managers
// @access  Private (HR only)
export const getManagers = async (req, res, next) => {
  try {
    const managers = await Employee.find({ status: 'Active' })
      .populate({
        path: 'user',
        match: { role: { $in: ['Manager', 'HR'] } },
        select: 'email role',
      })
      .sort({ firstName: 1 });

    // Filter out records where user did not match the role
    const filtered = managers.filter((m) => m.user !== null);

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get direct reports of authenticated manager
// @route   GET /api/v1/managers/my-team
// @access  Private (Manager only)
export const getMyTeam = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to current user',
      });
    }

    const team = await Employee.find({
      manager: req.employee._id,
      status: { $ne: 'Terminated' },
    })
      .populate('user', 'email role lastLogin isActive')
      .sort({ firstName: 1 });

    res.status(200).json({
      success: true,
      count: team.length,
      data: team,
    });
  } catch (err) {
    next(err);
  }
};
