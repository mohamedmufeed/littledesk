import { Router } from 'express';
import { getMe, login, logout, refresh, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, register);
authRouter.post('/login', authRateLimiter, login);
authRouter.post('/refresh', authRateLimiter, refresh);
authRouter.post('/logout', requireAuth, logout);
authRouter.get('/me', requireAuth, getMe);
