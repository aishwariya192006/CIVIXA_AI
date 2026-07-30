import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.get('/', authenticate, getMessages);
router.post('/', authenticate, sendMessage);

export default router;
