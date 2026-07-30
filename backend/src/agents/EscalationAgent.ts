import prisma from '../utils/prisma';
import { getIO } from '../utils/socket';

export const escalateComplaint = async (complaintId: string) => {
  console.log(`[AI AGENT 7] Evaluating escalation for complaint: ${complaintId}`);
  
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: { department: true }
  });

  if (!complaint || complaint.status === 'RESOLVED' || complaint.status === 'COMPLETED') {
    return { escalated: false };
  }

  // Escalate if deadline is passed and status is not resolved
  if (complaint.deadline && new Date() > complaint.deadline) {
    
    // Find higher official
    const official = await prisma.user.findFirst({
      where: { roleName: 'OFFICIAL' }
    });

    await prisma.complaint.update({
      where: { id: complaint.id },
      data: { status: 'ESCALATED' }
    });

    if (official) {
      const notif = await prisma.notification.create({
        data: {
          userId: official.id,
          title: 'Complaint Escalated',
          message: `Complaint ${complaint.id} has breached its deadline and been escalated.`,
          type: 'ESCALATION'
        }
      });
      try {
        getIO().to(`user_${official.id}`).emit('new_notification', notif);
      } catch (e) {
        console.log('Socket not initialized yet');
      }
    }

    return { escalated: true, reason: 'Deadline exceeded.' };
  }

  return { escalated: false };
};
