import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// Reusable trend calculator
const calculateMonthlyTrends = (complaints: any[]) => {
  const currentYear = new Date().getFullYear();
  const monthlyData = Array(12).fill(0).map((_, i) => ({
    name: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
    complaints: 0,
    resolved: 0
  }));

  complaints.forEach(c => {
    const date = new Date(c.createdAt);
    if (date.getFullYear() === currentYear) {
      monthlyData[date.getMonth()].complaints++;
      if (c.status === 'RESOLVED' || c.status === 'COMPLETED') {
        monthlyData[date.getMonth()].resolved++;
      }
    }
  });
  return monthlyData;
};

export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const complaints = await prisma.complaint.findMany();
    const users = await prisma.user.findMany({ select: { roleName: true } });
    
    const stats = {
      totalComplaints: complaints.length,
      resolved: complaints.filter(c => c.status === 'RESOLVED' || c.status === 'COMPLETED').length,
      escalated: complaints.filter(c => c.status === 'ESCALATED').length,
      activeOfficers: users.filter(u => u.roleName === 'OFFICER').length,
      totalCitizens: users.filter(u => u.roleName === 'CITIZEN').length,
      monthlyTrends: calculateMonthlyTrends(complaints)
    };
    
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOfficialStats = async (req: AuthRequest, res: Response) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: { department: true }
    });

    // Generate heatmap data and department stats
    const departmentStats: Record<string, any> = {};
    complaints.forEach(c => {
      const deptName = c.department?.name || 'Unassigned';
      if (!departmentStats[deptName]) {
        departmentStats[deptName] = { total: 0, resolved: 0, pending: 0 };
      }
      departmentStats[deptName].total++;
      if (c.status === 'RESOLVED' || c.status === 'COMPLETED') departmentStats[deptName].resolved++;
      else departmentStats[deptName].pending++;
    });

    const stats = {
      totalComplaints: complaints.length,
      delayed: complaints.filter(c => c.deadline && new Date() > new Date(c.deadline) && c.status !== 'RESOLVED').length,
      escalated: complaints.filter(c => c.status === 'ESCALATED').length,
      departmentStats: Object.entries(departmentStats).map(([name, data]) => ({ name, ...data })),
      monthlyTrends: calculateMonthlyTrends(complaints)
    };
    
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOfficerStats = async (req: AuthRequest, res: Response) => {
  try {
    const officerId = req.user?.id;
    const complaints = await prisma.complaint.findMany({
      where: { assignedOfficerId: officerId }
    });

    const stats = {
      assigned: complaints.length,
      pending: complaints.filter(c => c.status === 'NOT_STARTED' || c.status === 'ASSIGNED').length,
      inProgress: complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'VERIFICATION').length,
      completed: complaints.filter(c => c.status === 'RESOLVED' || c.status === 'COMPLETED').length,
      monthlyTrends: calculateMonthlyTrends(complaints)
    };
    
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
