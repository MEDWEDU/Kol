import { Router } from 'express';

import { authGuard } from '../middleware/authGuard';
import { validateBody } from '../middleware/validate';
import { getPublicKey, subscribe, unsubscribe } from '../controllers/notifications.controller';
import { subscribeSchema, unsubscribeSchema } from '../validation/notifications.validation';

const router = Router();

// All routes require authentication
router.use(authGuard);

// Get VAPID public key (no auth required)
router.get('/public-key', getPublicKey);

// Subscribe to push notifications
router.post('/subscribe', validateBody(subscribeSchema), subscribe);

// Unsubscribe from push notifications
router.delete('/subscribe', validateBody(unsubscribeSchema), unsubscribe);

export default router;