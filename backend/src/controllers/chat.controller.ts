import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getIO } from '../utils/socket';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const complaintId = req.params.complaintId as string;
    
    // Check if user has access to this complaint
    const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    
    if (req.user?.role === 'CITIZEN' && complaint.citizenId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const messages = await prisma.message.findMany({
      where: { complaintId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, fullName: true, roleName: true }
        }
      }
    });

    res.json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const complaintId = req.params.complaintId as string;
    const { content, mediaUrl, mediaType } = req.body;
    const senderId = req.user?.id;

    if (!senderId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const message = await prisma.message.create({
      data: {
        content,
        mediaUrl,
        mediaType,
        senderId,
        complaintId
      },
      include: {
        sender: { select: { id: true, fullName: true, roleName: true } }
      }
    });

    // Emit via Socket.io to all users in the complaint room
    const io = getIO();
    io.to(`complaint_${complaintId}`).emit('new_message', message);

    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
