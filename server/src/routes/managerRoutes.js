import { Router } from 'express';
import { getManagers, getMyTeam } from '../controllers/managerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = Router();

// HR can fetch list of all managers
router.get('/', protect, authorize('HR'), getManagers);

// Manager can fetch their direct reports
router.get('/my-team', protect, authorize('Manager'), getMyTeam);

export default router;
