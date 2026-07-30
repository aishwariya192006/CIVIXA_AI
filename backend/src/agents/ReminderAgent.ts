import cron from 'node-cron';
import prisma from '../utils/prisma';
import { getIO } from '../utils/socket';

export const startReminderAgent = () => {
  console.log('[AI AGENT 9] Reminder Agent started. Monitoring deadlines...');

  // Run every minute for demo purposes (Normally this would be daily: '0 0 * * *')
  cron.schedule('* * * * *', async () => {
    try {
      const activeComplaints = await prisma.complaint.findMany({
        where: {
          status: { notIn: ['RESOLVED', 'COMPLETED', 'REJECTED'] },
          deadline: { not: null },
          assignedOfficerId: { not: null }
        }
      });

      const now = new Date();

      for (const complaint of activeComplaints) {
        if (!complaint.deadline || !complaint.assignedOfficerId) continue;

        const timeDiff = complaint.deadline.getTime() - now.getTime();
        const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60));

        let title = '';
        let message = '';

        // Determine if alert needed
        if (hoursRemaining < 0 && complaint.status !== 'ESCALATED') {
          title = '🚨 Deadline Missed';
          message = `Complaint #${complaint.id.substring(0, 8)} has breached its deadline!`;
        } else if (daysRemaining === 1) {
          title = '⚠️ 1 Day Remaining';
          message = `Complaint #${complaint.id.substring(0, 8)} is due tomorrow.`;
        } else if (daysRemaining === 2) {
          title = '⏰ 2 Days Remaining';
          message = `Complaint #${complaint.id.substring(0, 8)} is due in 2 days.`;
        }

        // Emit notification if criteria met
        if (title !== '') {
          // Check if we already sent this exact reminder recently to prevent spam
          const recentNotif = await prisma.notification.findFirst({
            where: {
              userId: complaint.assignedOfficerId,
              title: title,
              createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 23) } // Don't spam same alert in 24h
            }
          });

          if (!recentNotif) {
            console.log(`[AI AGENT 9] Firing reminder to Officer ${complaint.assignedOfficerId}: ${title}`);
            const notif = await prisma.notification.create({
              data: {
                userId: complaint.assignedOfficerId,
                title,
                message,
                type: 'REMINDER'
              }
            });
            try {
              getIO().to(`user_${complaint.assignedOfficerId}`).emit('new_notification', notif);
            } catch (e) {
              // Socket not connected, ignore
            }
          }
        }
      }
    } catch (error) {
      console.error('[AI AGENT 9] Error processing reminders:', error);
    }
  });
};
