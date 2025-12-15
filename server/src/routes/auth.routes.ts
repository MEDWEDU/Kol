import { Router } from 'express';

import {
  login,
  logout,
  refresh,
  register,
  session,
} from '../controllers/auth.controller';
import { authGuard } from '../middleware/authGuard';
import { avatarUpload } from '../middleware/uploadAvatar';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validation/auth.validation';

const router = Router();

router.post('/register', avatarUpload, validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/session', authGuard, session);
router.post('/refresh', authGuard, refresh);

export default router;
