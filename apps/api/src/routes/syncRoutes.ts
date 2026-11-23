import { Router } from 'express';
import { pullSync, pushSync } from '../controllers/syncController.js';
import { requireAuth } from '../middleware/auth.js';

export const syncRouter = Router();

syncRouter.use(requireAuth);
syncRouter.post('/push', pushSync);
syncRouter.get('/pull', pullSync);
