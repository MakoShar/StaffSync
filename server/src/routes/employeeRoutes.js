import { Router } from 'express';
import {
  getEmployees,
  getDirectory,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateMyProfile,
  changeEmployeeStatus,
} from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = Router();

// Directory is accessible to all authenticated users
router.get('/directory', protect, getDirectory);

// Self personal profile update
router.patch('/profile/me', protect, updateMyProfile);

// HR operations
router.get('/', protect, authorize('HR'), getEmployees);
router.post('/', protect, authorize('HR'), createEmployee);
router.put('/:id', protect, authorize('HR'), updateEmployee);
router.patch('/:id/status', protect, authorize('HR'), changeEmployeeStatus);

// Single employee detail (Self, Manager, or HR verified inside controller)
router.get('/:id', protect, getEmployeeById);

export default router;
