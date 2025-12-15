import type { RequestHandler } from 'express';

import { HttpError } from '../utils/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/responses';
import {
  getVapidPublicKey,
  addPushSubscription,
  removePushSubscription,
  isWebPushEnabled,
} from '../services/push.service';

export const getPublicKey: RequestHandler = asyncHandler(async (req, res) => {
  if (!isWebPushEnabled()) {
    throw new HttpError(503, 'Push notifications service is not available');
  }

  const publicKey = getVapidPublicKey();
  ok(res, { publicKey });
});

export const subscribe: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth?.userId) {
    throw new HttpError(401, 'Not authenticated');
  }

  const { endpoint, keys } = req.body as {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };

  const user = await addPushSubscription(req.auth.userId, { endpoint, keys });
  
  ok(res, { 
    message: 'Push subscription saved successfully',
    notificationsEnabled: user.notificationsEnabled,
    subscriptionCount: user.webPushSubscriptions.length
  });
});

export const unsubscribe: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth?.userId) {
    throw new HttpError(401, 'Not authenticated');
  }

  const { endpoint } = req.body as { endpoint?: string };

  await removePushSubscription(req.auth.userId, endpoint);
  
  ok(res, { 
    message: endpoint ? 'Push subscription removed' : 'All push subscriptions cleared'
  });
});