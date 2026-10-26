import Employee from '../models/Employee.js';
import User from '../models/User.js';

// @desc    Get paginated employees with search and department filtering
// @route   GET /api/v1/employees
// @access  Private (HR only)
export const getEmployees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.department) {
      query.department = req.query.department;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeId: searchRegex },
        { designation: searchRegex },
      ];
    }

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .populate('user', 'email role isActive lastLogin')
      .populate('manager', 'firstName lastName employeeId department designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: employees,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get company employee directory (public fields for all authenticated staff)
// @route   GET /api/v1/employees/directory
// @access  Private (All roles)
export const getDirectory = async (req, res, next) => {
  try {
    const query = { status: 'Active' };

    if (req.query.department) {
      query.department = req.query.department;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeId: searchRegex },
        { designation: searchRegex },
      ];
    }

    const directory = await Employee.find(query)
      .select('employeeId firstName lastName department designation phone user manager')
      .populate('user', 'email')
      .populate('manager', 'firstName lastName employeeId')
      .sort({ firstName: 1 });

    res.status(200).json({
      success: true,
      count: directory.length,
      data: directory,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single employee details
// @route   GET /api/v1/employees/:id
// @access  Private (Self, Direct Manager, or HR)
export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'email role isActive lastLogin')
      .populate('manager', 'firstName lastName employeeId department');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found',
      });
    }

    // Access Boundary Check:
    // HR can view all.
    // Employee can view self.
    // Manager can view their direct reports.
    const isHr = req.user.role === 'HR';
    const isSelf = req.employee && req.employee._id.toString() === employee._id.toString();
    const isManagerOfEmployee =
      req.user.role === 'Manager' &&
      employee.manager &&
      req.employee &&
      employee.manager._id.toString() === req.employee._id.toString();

    if (!isHr && !isSelf && !isManagerOfEmployee) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this employee profile',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new employee and linked user
// @route   POST /api/v1/employees
// @access  Private (HR only)
export const createEmployee = async (req, res, next) => {
  try {
    const {
      email,
      password,
      role = 'Employee',
      employeeId,
      firstName,
      lastName,
      phone,
      department,
      designation,
      joiningDate,
      manager,
      address,
      emergencyContact,
    } = req.body;

    if (!email || !password || !employeeId || !firstName || !lastName || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (email, password, employeeId, firstName, lastName, department, designation)',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user account with this email address already exists',
      });
    }

    const existingEmployeeId = await Employee.findOne({ employeeId: employeeId.trim().toUpperCase() });
    if (existingEmployeeId) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this Employee ID already exists',
      });
    }

    // Create User record
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      role,
      isActive: true,
    });

    // Create linked Employee record
    const employee = await Employee.create({
      user: user._id,
      employeeId: employeeId.trim().toUpperCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone || '',
      department,
      designation: designation.trim(),
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      manager: manager || null,
      address: address || {},
      emergencyContact: emergencyContact || {},
      status: 'Active',
    });

    const populated = await Employee.findById(employee._id)
      .populate('user', 'email role isActive')
      .populate('manager', 'firstName lastName employeeId department');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee operational details
// @route   PUT /api/v1/employees/:id
// @access  Private (HR only)
export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found',
      });
    }

    const {
      firstName,
      lastName,
      phone,
      department,
      designation,
      joiningDate,
      manager,
      address,
      emergencyContact,
      status,
      role,
    } = req.body;

    if (firstName) employee.firstName = firstName.trim();
    if (lastName) employee.lastName = lastName.trim();
    if (phone !== undefined) employee.phone = phone;
    if (department) employee.department = department;
    if (designation) employee.designation = designation.trim();
    if (joiningDate) employee.joiningDate = new Date(joiningDate);
    if (manager !== undefined) employee.manager = manager || null;
    if (address) employee.address = { ...employee.address, ...address };
    if (emergencyContact) employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };
    if (status) employee.status = status;

    await employee.save();

    // If role or status update affects User account
    if (role || status) {
      const userUpdate = {};
      if (role) userUpdate.role = role;
      if (status) userUpdate.isActive = status === 'Active';
      await User.findByIdAndUpdate(employee.user, userUpdate);
    }

    const updated = await Employee.findById(employee._id)
      .populate('user', 'email role isActive')
      .populate('manager', 'firstName lastName employeeId department');

    res.status(200).json({
      success: true,
      message: 'Employee record updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update self personal contact details (restricted fields only)
// @route   PATCH /api/v1/employees/profile/me
// @access  Private (Self only)
export const updateMyProfile = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to current user account',
      });
    }

    const employee = await Employee.findById(req.employee._id);

    // Permitted fields: phone, address, emergencyContact
    const { phone, address, emergencyContact } = req.body;

    if (phone !== undefined) employee.phone = phone;
    if (address) employee.address = { ...employee.address, ...address };
    if (emergencyContact) employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };

    await employee.save();

    const updated = await Employee.findById(employee._id)
      .populate('user', 'email role isActive')
      .populate('manager', 'firstName lastName employeeId department');

    res.status(200).json({
      success: true,
      message: 'Personal profile updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change employee status (Active / On Leave / Terminated)
// @route   PATCH /api/v1/employees/:id/status
// @access  Private (HR only)
export const changeEmployeeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['Active', 'On Leave', 'Terminated'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (Active, On Leave, Terminated)',
      });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    employee.status = status;
    await employee.save();

    // Sync isActive with User
    await User.findByIdAndUpdate(employee.user, {
      isActive: status === 'Active',
    });

    res.status(200).json({
      success: true,
      message: `Employee status changed to ${status}`,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};
