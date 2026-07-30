import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendNotification } from '../services/notification.service';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true }
      });
    } else {
      await prisma.notification.update({
        where: { id: id as string, userId },
        data: { read: true }
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    await prisma.notification.delete({
      where: { id: id as string, userId }
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Preferences
export const getPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: { userId }
      });
    }

    res.json({ success: true, data: prefs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const updated = await prisma.notificationPreference.update({
      where: { userId },
      data: req.body
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Functions
export const adminGetTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const templates = await prisma.notificationTemplate.findMany();
    res.json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminCreateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const template = await prisma.notificationTemplate.create({
      data: req.body
    });
    res.json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminUpdateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const template = await prisma.notificationTemplate.update({
      where: { id: id as string },
      data: req.body
    });
    res.json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminDeleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.notificationTemplate.delete({ where: { id: id as string } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminGetLogs = async (req: AuthRequest, res: Response) => {
  try {
    const [emails, sms, push] = await Promise.all([
      prisma.emailLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.sMSLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.pushLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
    ]);
    res.json({ success: true, data: { emails, sms, push } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminBroadcast = async (req: AuthRequest, res: Response) => {
  try {
    const { title, message, html, text, roleTarget } = req.body;
    
    let users;
    if (roleTarget && roleTarget !== 'ALL') {
      users = await prisma.user.findMany({ where: { roleName: roleTarget } });
    } else {
      users = await prisma.user.findMany();
    }

    // Send notifications asynchronously to not block response
    res.json({ success: true, message: `Broadcasting to ${users.length} users in background.` });

    for (const user of users) {
      sendNotification({
        userId: user.id,
        type: 'SYSTEM_ALERT',
        title,
        message,
        emailSubject: title,
        emailHtml: html || message,
        smsText: text || message
      }).catch(console.error);
    }

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
