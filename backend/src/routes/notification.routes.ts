import { Router } from 'express';
import { 
  getNotifications, 
  markAsRead, 
  deleteNotification, 
  getPreferences, 
  updatePreferences, 
  adminGetTemplates, 
  adminCreateTemplate, 
  adminUpdateTemplate, 
  adminDeleteTemplate, 
  adminGetLogs, 
  adminBroadcast 
} from '../controllers/notification.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// User routes
router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.delete('/:id', authenticate, deleteNotification);

// User preferences
router.get('/preferences', authenticate, getPreferences);
router.put('/preferences', authenticate, updatePreferences);

// Admin Routes
router.get('/admin/templates', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), adminGetTemplates);
router.post('/admin/templates', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), adminCreateTemplate);
router.put('/admin/templates/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), adminUpdateTemplate);
router.delete('/admin/templates/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), adminDeleteTemplate);
router.get('/admin/logs', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), adminGetLogs);
router.post('/admin/broadcast', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), adminBroadcast);

export default router;
