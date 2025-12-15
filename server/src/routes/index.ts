import { Router } from 'express';

import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import usersRoutes from './users.routes';
import conversationsRoutes from './conversations.routes';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/conversations', conversationsRoutes);

export default router;
