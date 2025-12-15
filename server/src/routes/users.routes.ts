import { Router } from 'express';

import {
  getMe,
  getUserById,
  updateMe,
  searchUsers,
} from '../controllers/users.controller';
import { authGuard } from '../middleware/authGuard';
import { avatarUpload } from '../middleware/uploadAvatar';
import { validateBody } from '../middleware/validate';
import { updateMeSchema } from '../validation/users.validation';

const router = Router();

router.get('/me', authGuard, getMe);
router.put('/me', authGuard, avatarUpload, validateBody(updateMeSchema), updateMe);
router.get('/search', authGuard, searchUsers);
router.get('/:id', getUserById);

export default router;
