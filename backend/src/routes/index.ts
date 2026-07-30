import { Router } from 'express';
import authRoutes from './auth.routes';
import complaintRoutes from './complaint.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';
import aiopsRoutes from './aiops.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/aiops', aiopsRoutes);

export default router;
