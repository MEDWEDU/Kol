import { Router } from 'express';

import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import usersRoutes from './users.routes';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

export default router;
