import prisma from '../utils/prisma';
import { getIO } from '../utils/socket';
import { sendEmail } from './email.service';
import { sendSMS } from './sms.service';
import { sendPushNotification } from './push.service';

interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  emailSubject?: string;
  emailHtml?: string;
  smsText?: string;
}

export const sendNotification = async (payload: NotificationPayload) => {
  const { userId, type, title, message, metadata, emailSubject, emailHtml, smsText } = payload;

  try {
    // 1. Fetch User and Preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { notificationPref: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const prefs = user.notificationPref || {
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
      systemAlerts: true,
      complaintUpdates: true,
      chatMessages: true,
      marketingMessages: false
    };

    // Determine if type is allowed by preferences
    let isAllowed = true;
    if (type === 'STATUS_UPDATE' && !prefs.complaintUpdates) isAllowed = false;
    if (type === 'NEW_MESSAGE' && !prefs.chatMessages) isAllowed = false;
    if (type === 'MARKETING' && !prefs.marketingMessages) isAllowed = false;

    if (!isAllowed) {
      console.log(`Notification of type ${type} disabled by user ${userId}`);
      return;
    }

    // 2. Save In-App Notification (Always stored if allowed)
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
      }
    });

    // 3. Emit Real-time via Socket.IO
    try {
      const io = getIO();
      io.to(`user_${userId}`).emit('new_notification', notification);
    } catch (e) {
      // Socket not initialized or user offline
    }

    // 4. Send Email
    if (prefs.emailEnabled && user.email && emailHtml && emailSubject) {
      sendEmail(user.email, emailSubject, emailHtml).catch(console.error);
    }

    // 5. Send SMS
    if (prefs.smsEnabled && user.contactNumber && smsText) {
      sendSMS(user.contactNumber, smsText).catch(console.error);
    }

    // 6. Send Push (Would require querying PushSubscriptions for the user in a real app)
    // For now, we omit the Push call here unless we build a PushSubscription model
    // if (prefs.pushEnabled) { ... }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
