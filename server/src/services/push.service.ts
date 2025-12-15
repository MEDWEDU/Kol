import webpush, { type PushSubscription } from 'web-push';
import { UserModel, type UserDocument } from '../models/User';
import { HttpError } from '../utils/HttpError';

let webPushInitialized = false;

// VAPID configuration
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const PUSH_CONTACT_EMAIL = process.env.PUSH_CONTACT_EMAIL || 'mailto:admin@example.com';

// Validate VAPID keys on service initialization
export function initializeWebPush() {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('⚠️  Web Push notifications disabled: VAPID keys not configured');
    console.warn('   Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your .env file');
    console.warn('   Generate keys with: npx web-push generate-vapid-keys');
    webPushInitialized = false;
    return;
  }

  try {
    webpush.setVapidDetails(PUSH_CONTACT_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    webPushInitialized = true;
    console.log('✅ Web Push notifications initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Web Push:', error);
    webPushInitialized = false;
  }
}

export function isWebPushEnabled(): boolean {
  return webPushInitialized;
}

export async function sendMessageNotification(
  recipient: UserDocument,
  senderName: string,
  conversationId: string,
  messageSnippet: string,
  hasAttachment?: boolean
) {
  if (!webPushInitialized || !recipient.notificationsEnabled || recipient.webPushSubscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const payload = {
    title: `New message from ${senderName}`,
    body: hasAttachment ? `${messageSnippet} (Attachment)` : messageSnippet,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `message-${conversationId}`,
    data: {
      conversationId,
      senderName,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: 'Open Chat',
      },
    ],
  };

  const subscriptions = recipient.webPushSubscriptions;
  let sent = 0;
  let failed = 0;

  // Send to all active subscriptions for this user
  const failedEndpoints: string[] = [];

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          } as PushSubscription,
          JSON.stringify(payload)
        );
        sent++;
      } catch (error: any) {
        console.warn(`Failed to send push notification to ${subscription.endpoint}:`, error.message);
        failed++;
        failedEndpoints.push(subscription.endpoint);
      }
    })
  );

  // Prune invalid subscriptions (410 Gone or 404 Not Found)
  if (failedEndpoints.length > 0) {
    await pruneInvalidSubscriptions((recipient as any)._id.toString(), failedEndpoints);
  }

  return { sent, failed };
}

export async function sendPresenceNotification(
  recipient: UserDocument,
  userName: string,
  isOnline: boolean
) {
  if (!webPushInitialized || !recipient.notificationsEnabled || recipient.webPushSubscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const payload = {
    title: `${userName} is ${isOnline ? 'online' : 'offline'}`,
    body: `${userName} ${isOnline ? 'came' : 'went'} ${isOnline ? 'online' : 'offline'}`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `presence-${(recipient as any)._id.toString()}`,
    data: {
      type: 'presence',
      userName,
      isOnline,
      timestamp: Date.now(),
    },
  };

  const subscriptions = recipient.webPushSubscriptions;
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          } as PushSubscription,
          JSON.stringify(payload)
        );
        sent++;
      } catch (error: any) {
        console.warn(`Failed to send presence notification:`, error.message);
        failed++;
      }
    })
  );

  return { sent, failed };
}

async function pruneInvalidSubscriptions(userId: string, invalidEndpoints: string[]) {
  try {
    await UserModel.findByIdAndUpdate(userId, {
      $pull: {
        webPushSubscriptions: {
          endpoint: { $in: invalidEndpoints },
        },
      },
    });
    console.log(`Pruned ${invalidEndpoints.length} invalid push subscriptions for user ${userId}`);
  } catch (error) {
    console.error('Failed to prune invalid subscriptions:', error);
  }
}

export async function addPushSubscription(
  userId: string,
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }
): Promise<UserDocument> {
  if (!webPushInitialized) {
    throw new HttpError(503, 'Push notifications service not available');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (!user.notificationsEnabled) {
    throw new HttpError(403, 'Push notifications are disabled for this user');
  }

  // Remove existing subscription with same endpoint (upsert behavior)
  await UserModel.findByIdAndUpdate(userId, {
    $pull: {
      webPushSubscriptions: { endpoint: subscription.endpoint },
    },
  });

  // Add new subscription
  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    {
      $push: {
        webPushSubscriptions: {
          ...subscription,
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new HttpError(404, 'User not found');
  }

  return updatedUser;
}

export async function removePushSubscription(userId: string, endpoint?: string): Promise<void> {
  if (!webPushInitialized) {
    throw new HttpError(503, 'Push notifications service not available');
  }

  const updateQuery = endpoint
    ? { $pull: { webPushSubscriptions: { endpoint } } }
    : { $set: { webPushSubscriptions: [] } };

  await UserModel.findByIdAndUpdate(userId, updateQuery);
}

export function getVapidPublicKey(): string {
  if (!webPushInitialized || !VAPID_PUBLIC_KEY) {
    throw new HttpError(503, 'Push notifications service not available');
  }
  return VAPID_PUBLIC_KEY;
}