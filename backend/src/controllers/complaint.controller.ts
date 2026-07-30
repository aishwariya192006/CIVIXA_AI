import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { understandComplaint } from '../agents/ComplaintUnderstandingAgent';
import { routeDepartment } from '../agents/DepartmentRoutingAgent';
import { detectDuplicate } from '../agents/DuplicateDetectionAgent';
import { calculatePriority } from '../agents/PriorityAgent';
import { verifyResolution } from '../agents/VerificationAgent';
import { escalateComplaint } from '../agents/EscalationAgent';
import { sendNotification } from '../services/notification.service';

export const submitComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, locationLat, locationLng, address, district, zone, ward, hasVoice, hasFile } = req.body;
    const citizenId = req.user?.id;

    if (!citizenId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // AI Agent 1: Understand
    const aiAnalysis = await understandComplaint(title, description, hasVoice, hasFile);

    // AI Agent 3: Duplicate Detection
    const duplicateCheck = await detectDuplicate(title, aiAnalysis.categoryName, district, description);
    if (duplicateCheck.isDuplicate) {
      return res.status(409).json({
        success: false,
        message: duplicateCheck.message,
        duplicateOfId: duplicateCheck.duplicateOfId
      });
    }

    // AI Agent 4: Priority Calculation
    const priorityAnalysis = calculatePriority(aiAnalysis.severity, aiAnalysis.urgency, aiAnalysis.peopleAffected);

    // AI Agent 2: Route
    const routing = await routeDepartment(aiAnalysis.categoryName, district);

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        locationLat,
        locationLng,
        address,
        district,
        zone,
        ward,
        categoryName: aiAnalysis.categoryName,
        severity: aiAnalysis.severity,
        urgency: aiAnalysis.urgency,
        peopleAffected: aiAnalysis.peopleAffected,
        aiSummary: aiAnalysis.aiSummary,
        aiKeywords: aiAnalysis.aiKeywords,
        aiTags: aiAnalysis.aiTags,
        priority: priorityAnalysis.priority,
        priorityScore: priorityAnalysis.priorityScore,
        deadline: priorityAnalysis.deadline,
        status: routing?.assignedOfficerId ? 'ASSIGNED' : 'NOT_STARTED',
        citizenId,
        departmentId: routing?.departmentId,
        assignedOfficerId: routing?.assignedOfficerId,
        aiResults: {
          create: [
            { agentName: 'UNDERSTANDING', resultData: JSON.stringify(aiAnalysis) },
            { agentName: 'PRIORITY', resultData: JSON.stringify(priorityAnalysis) }
          ]
        },
        statusHistory: {
          create: [
            { status: routing?.assignedOfficerId ? 'ASSIGNED' : 'NOT_STARTED', remarks: 'Complaint Initialized' }
          ]
        },
        auditLogs: {
          create: [
            { userId: citizenId, action: 'COMPLAINT_CREATED', details: 'Complaint reported by citizen.' }
          ]
        },
        assignments: routing?.assignedOfficerId ? {
          create: [
            { officerId: routing.assignedOfficerId, active: true }
          ]
        } : undefined
      }
    });

    // AI Agent 8: Notification (Mock) - Replaced with Real Notification System
    if (routing?.assignedOfficerId) {
      sendNotification({
        userId: routing.assignedOfficerId,
        type: 'SYSTEM_ALERT',
        title: 'New Complaint Assigned',
        message: `A new ${priorityAnalysis.priority} priority complaint "${title}" has been assigned to you.`,
        emailSubject: 'New Complaint Assignment',
        emailHtml: `<h2>New Assignment</h2><p>You have been assigned a new complaint: <strong>${title}</strong>.</p>`,
        smsText: `CIVIXA AI Alert: You have been assigned a new ${priorityAnalysis.priority} priority complaint.`
      }).catch(console.error);
    }

    res.status(201).json({ success: true, data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    let complaints;

    if (role === 'CITIZEN') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          filedComplaints: true,
          joinedComplaints: true,
        }
      });
      // Combine filed and joined complaints and sort
      complaints = [...(user?.filedComplaints || []), ...(user?.joinedComplaints || [])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (role === 'OFFICER') {
      const officer = await prisma.user.findUnique({ where: { id: userId } });
      complaints = await prisma.complaint.findMany({ 
        where: officer?.district ? { district: officer.district } : {},
        orderBy: { priorityScore: 'desc' } 
      });
    } else {
      complaints = await prisma.complaint.findMany({ orderBy: { createdAt: 'desc' } });
    }

    res.json({ success: true, data: complaints });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateComplaintStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, resolutionRemarks, afterImage } = req.body;
    
    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found' });

    let finalStatus = status;
    let verificationData = {};

    // AI Agent 6: Verification Agent
    if (status === 'RESOLVED' || status === 'VERIFICATION') {
       const verification = await verifyResolution([], complaint.beforeImage, afterImage);
       
       verificationData = {
         verificationStatus: verification.status,
         confidenceScore: verification.confidenceScore,
         verificationExplanation: verification.explanation,
         afterImage
       };

       if (verification.status === 'Not Fixed') {
         // Stop closure
         finalStatus = 'IN_PROGRESS';
       } else {
         finalStatus = 'RESOLVED';
       }
    }

    const updateData: any = {
      status: finalStatus, 
      resolutionRemarks,
      ...verificationData,
      statusHistory: {
        create: {
          status: finalStatus,
          remarks: resolutionRemarks || 'Status updated manually'
        }
      },
      auditLogs: {
        create: {
          userId: req.user?.id,
          action: `STATUS_UPDATED_${finalStatus}`,
          details: resolutionRemarks || `Status changed to ${finalStatus}`
        }
      }
    };

    if (afterImage) {
      updateData.complaintImages = {
        create: {
          url: afterImage,
          type: 'AFTER'
        }
      };
    }

    // If an officer is taking action (e.g. IN_PROGRESS or RESOLVED) and no officer is assigned yet, or if they are taking ownership
    if (req.user?.id && !complaint.assignedOfficerId) {
      const officer = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (officer?.roleName === 'OFFICER') {
        updateData.assignedOfficerId = officer.id;
        if (officer.departmentId) {
          updateData.departmentId = officer.departmentId;
        } else {
          // If officer has no department, try to assign department based on complaint category
          const departments = await prisma.department.findMany();
          const matchedDept = departments.find(d => d.name.toLowerCase() === complaint.categoryName?.toLowerCase());
          if (matchedDept) {
            updateData.departmentId = matchedDept.id;
          }
        }
      }
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
      include: {
        citizen: { select: { fullName: true, email: true, contactNumber: true } }
      }
    });

    // AI Agent 7: Escalation Check
    if (finalStatus !== 'RESOLVED' && finalStatus !== 'COMPLETED') {
      await escalateComplaint(id);
    }

    res.json({ success: true, data: updatedComplaint, verification: verificationData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const joinComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const complaint = await prisma.complaint.update({
      where: { id },
      data: {
        joinedCitizens: {
          connect: { id: userId }
        },
        peopleAffected: { increment: 1 },
        priorityScore: { increment: 10 } // Increase priority score due to more people affected
      }
    });

    res.json({ success: true, data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCitizenStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const complaints = await prisma.complaint.findMany({
      where: {
        OR: [
          { citizenId: userId },
          { joinedCitizens: { some: { id: userId } } }
        ]
      },
      select: { status: true, createdAt: true }
    });

    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'NOT_STARTED' || c.status === 'ASSIGNED').length;
    const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'VERIFICATION').length;
    const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'COMPLETED').length;
    const escalated = complaints.filter(c => c.status === 'ESCALATED').length;

    // Calculate monthly trends (simple aggregation for the current year)
    const currentYear = new Date().getFullYear();
    const monthlyData = Array(12).fill(0).map((_, i) => ({
      name: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
      complaints: 0
    }));

    complaints.forEach(c => {
      const date = new Date(c.createdAt);
      if (date.getFullYear() === currentYear) {
        monthlyData[date.getMonth()].complaints++;
      }
    });

    res.json({ success: true, data: { total, pending, inProgress, resolved, escalated, monthlyData } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComplaintDetails = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        citizen: { select: { fullName: true, email: true, contactNumber: true, district: true } },
        assignedOfficer: { select: { fullName: true, email: true, contactNumber: true, department: true } },
        department: true,
        auditLogs: { orderBy: { timestamp: 'desc' }, include: { user: { select: { fullName: true, roleName: true } } } }
      }
    });

    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { rating, feedback } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const complaint = await prisma.complaint.update({
      where: { id },
      data: { citizenRating: rating, citizenFeedback: feedback }
    });

    await prisma.auditLog.create({
      data: {
        complaintId: id,
        userId,
        action: 'FEEDBACK_SUBMITTED',
        details: `Rating: ${rating} Stars`
      }
    });

    res.json({ success: true, data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
