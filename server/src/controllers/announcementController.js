import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';

// @desc    Get announcements visible to authenticated user
// @route   GET /api/v1/announcements
// @access  Private (All authenticated users)
export const getAnnouncements = async (req, res, next) => {
  try {
    const isHr = req.user.role === 'HR';
    const isManager = req.user.role === 'Manager';
    const userDept = req.employee ? req.employee.department : null;

    let query = { isPublished: true };

    if (!isHr) {
      // Exclude expired
      query.$or = [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }];

      const audienceCriteria = [{ targetAudience: 'All' }];
      if (isManager) {
        audienceCriteria.push({ targetAudience: 'Managers' });
      }
      if (userDept) {
        audienceCriteria.push({
          targetAudience: 'Department',
          targetDepartment: userDept,
        });
      }

      query.$and = [{ $or: audienceCriteria }];
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'firstName lastName employeeId department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new announcement
// @route   POST /api/v1/announcements
// @access  Private (HR only)
export const createAnnouncement = async (req, res, next) => {
  try {
    const {
      title,
      content,
      targetAudience = 'All',
      targetDepartment,
      priority = 'Medium',
      expiresAt,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content for announcement',
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      author: req.employee ? req.employee._id : null,
      targetAudience,
      targetDepartment: targetAudience === 'Department' ? targetDepartment : null,
      priority,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isPublished: true,
    });

    // Notify targeted users in background
    let userFilter = { isActive: true };
    if (targetAudience === 'Managers') {
      userFilter.role = { $in: ['Manager', 'HR'] };
    }

    const recipients = await User.find(userFilter).select('_id');
    const notifications = recipients.map((u) => ({
      recipient: u._id,
      title: `Announcement: ${announcement.title}`,
      message: announcement.content.substring(0, 150) + (announcement.content.length > 150 ? '...' : ''),
      type: 'Announcement',
      relatedId: announcement._id,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: announcement,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update announcement
// @route   PUT /api/v1/announcements/:id
// @access  Private (HR only)
export const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    const {
      title,
      content,
      targetAudience,
      targetDepartment,
      priority,
      isPublished,
      expiresAt,
    } = req.body;

    if (title) announcement.title = title.trim();
    if (content) announcement.content = content.trim();
    if (targetAudience) announcement.targetAudience = targetAudience;
    if (targetDepartment !== undefined) announcement.targetDepartment = targetDepartment;
    if (priority) announcement.priority = priority;
    if (isPublished !== undefined) announcement.isPublished = isPublished;
    if (expiresAt !== undefined) announcement.expiresAt = expiresAt ? new Date(expiresAt) : null;

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/v1/announcements/:id
// @access  Private (HR only)
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
