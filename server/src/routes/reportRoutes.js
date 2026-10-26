import { Router } from 'express';
import {
  getHrDashboard,
  getManagerDashboard,
  getEmployeeDashboard,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = Router();

// HR Dashboard Metrics
router.get('/hr-dashboard', protect, authorize('HR'), getHrDashboard);

// Manager Team Metrics
router.get('/manager-dashboard', protect, authorize('Manager'), getManagerDashboard);

// Employee Personal Metrics
router.get('/employee-dashboard', protect, getEmployeeDashboard);

export default router;
