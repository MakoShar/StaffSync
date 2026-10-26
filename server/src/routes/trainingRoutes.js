import { Router } from 'express';
import {
  getTrainings,
  createTraining,
  enrollTraining,
  withdrawTraining,
  updateTraining,
} from '../controllers/trainingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = Router();

// Catalog
router.get('/', protect, getTrainings);

// Enrollment actions
router.post('/:id/enroll', protect, enrollTraining);
router.post('/:id/withdraw', protect, withdrawTraining);

// Management (Manager or HR)
router.post('/', protect, authorize('Manager', 'HR'), createTraining);
router.put('/:id', protect, authorize('Manager', 'HR'), updateTraining);

export default router;
