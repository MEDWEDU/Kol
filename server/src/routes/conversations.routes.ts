import { Router } from 'express';

import {
  listConversations,
  startConversation,
  getConversationMessages,
  markMessagesAsRead,
} from '../controllers/conversations.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody } from '../middleware/validate';
import {
  startConversationSchema,
  markMessagesReadSchema,
} from '../validation/conversations.validation';

const router = Router();

router.use(authGuard);

router.get('/', listConversations);
router.post('/', validateBody(startConversationSchema), startConversation);
router.get('/:conversationId/messages', getConversationMessages);
router.patch('/:conversationId/read', validateBody(markMessagesReadSchema), markMessagesAsRead);

export default router;
