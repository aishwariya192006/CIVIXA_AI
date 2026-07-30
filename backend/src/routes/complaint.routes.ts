import { Router } from 'express';
import { submitComplaint, getComplaints, updateComplaintStatus, joinComplaint, getCitizenStats, getComplaintDetails, submitFeedback } from '../controllers/complaint.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import chatRoutes from './chat.routes';

const router = Router();

// Mount nested chat routes
router.use('/:complaintId/messages', chatRoutes);

router.post('/', authenticate, authorize(['CITIZEN']), submitComplaint);
router.get('/', authenticate, getComplaints);
router.get('/stats/citizen', authenticate, authorize(['CITIZEN']), getCitizenStats);
router.get('/:id', authenticate, getComplaintDetails);
router.post('/:id/join', authenticate, joinComplaint);
router.post('/:id/feedback', authenticate, authorize(['CITIZEN']), submitFeedback);
router.patch('/:id/status', authenticate, authorize(['OFFICER', 'ADMIN', 'OFFICIAL']), updateComplaintStatus);

export default router;
