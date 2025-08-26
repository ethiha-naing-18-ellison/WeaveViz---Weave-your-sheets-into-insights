import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);

export default router;
