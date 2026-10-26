import { Router } from 'express';
import {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave,
} from '../controllers/leaveController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = Router();

// Employee self actions
router.post('/', protect, applyLeave);
router.get('/my-leaves', protect, getMyLeaves);
router.delete('/:id', protect, cancelLeave);

// Manager team leaves
router.get('/team-leaves', protect, authorize('Manager'), getTeamLeaves);

// HR all leaves
router.get('/all', protect, authorize('HR'), getAllLeaves);

// Manager and HR review
router.patch('/:id/review', protect, authorize('Manager', 'HR'), reviewLeave);

export default router;
