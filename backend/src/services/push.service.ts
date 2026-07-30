import webpush from 'web-push';
import prisma from '../utils/prisma';

// Configure Web Push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.SMTP_FROM || 'admin@civixa.ai'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export const sendPushNotification = async (subscription: webpush.PushSubscription, payload: any) => {
  try {
    if (!process.env.VAPID_PUBLIC_KEY) {
      console.warn('[Push Service] VAPID keys not configured. Simulating push.');
      
      await prisma.pushLog.create({
        data: {
          to: subscription.endpoint,
          payload: JSON.stringify(payload),
          status: 'FAILED',
          error: 'VAPID keys not configured'
        }
      });
      return;
    }

    await webpush.sendNotification(subscription, JSON.stringify(payload));

    await prisma.pushLog.create({
      data: {
        to: subscription.endpoint,
        payload: JSON.stringify(payload),
        status: 'SENT',
        sentAt: new Date()
      }
    });
    
  } catch (error: any) {
    console.error('Push Notification Failed:', error);
    
    await prisma.pushLog.create({
      data: {
        to: subscription.endpoint,
        payload: JSON.stringify(payload),
        status: 'FAILED',
        error: error.message
      }
    });
    
    throw error;
  }
};
