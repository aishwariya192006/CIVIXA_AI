import { Router } from 'express';
import { getAdminStats, getOfficialStats, getOfficerStats } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/admin', authenticate, authorize(['ADMIN']), getAdminStats);
router.get('/official', authenticate, authorize(['OFFICIAL']), getOfficialStats);
router.get('/officer', authenticate, authorize(['OFFICER']), getOfficerStats);

export default router;
