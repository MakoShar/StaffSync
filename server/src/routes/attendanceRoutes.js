import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyHistory,
  getMyCalendar,
  resetTodayAttendance,
  getTeamAttendance,
  getAllAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = Router();

// Self check-in, check-out, and calendar
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.post('/reset-today', protect, resetTodayAttendance);
router.get('/today', protect, getTodayStatus);
router.get('/my-history', protect, getMyHistory);
router.get('/my-calendar', protect, getMyCalendar);

// Manager team attendance
router.get('/team', protect, authorize('Manager'), getTeamAttendance);

// HR organization-wide attendance
router.get('/all', protect, authorize('HR'), getAllAttendance);

export default router;
