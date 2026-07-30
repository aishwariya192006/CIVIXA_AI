import { Router } from 'express';
import { register, login, getProfile, getUsers, updateUser, deleteUser } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.get('/users', authenticate, authorize(['ADMIN']), getUsers);

router.patch('/users/:id', authenticate, authorize(['ADMIN']), updateUser);
router.delete('/users/:id', authenticate, authorize(['ADMIN']), deleteUser);

export default router;
