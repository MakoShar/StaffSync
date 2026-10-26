import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = Router();

// Feed visible to authenticated users
router.get('/', protect, getAnnouncements);

// HR administration
router.post('/', protect, authorize('HR'), createAnnouncement);
router.put('/:id', protect, authorize('HR'), updateAnnouncement);
router.delete('/:id', protect, authorize('HR'), deleteAnnouncement);

export default router;
