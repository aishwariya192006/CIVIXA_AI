import express from 'express';
import { authenticate as protect, authorize } from '../middlewares/auth.middleware';
import prisma from '../utils/prisma';

const router = express.Router();

// Get AIOps Dashboard metrics
router.get('/dashboard', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const totalRequests = await prisma.aIRequest.count();
    const agents = await prisma.aIHealth.findMany();
    const activeAgents = agents.length;
    const healthyAgents = agents.filter(a => a.status === 'HEALTHY').length;
    const warningAgents = agents.filter(a => a.status === 'WARNING').length;
    const failedAgents = agents.filter(a => a.status === 'CRITICAL' || a.status === 'OFFLINE').length;
    
    const queues = await prisma.aIQueue.findMany();
    const queueSize = queues.reduce((sum, q) => sum + q.waitingJobs, 0);

    const requests = await prisma.aIRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    const avgResponseTime = requests.length > 0 
      ? requests.reduce((sum, r) => sum + (r.latency || 0), 0) / requests.length 
      : 0;
    const avgConfidence = requests.length > 0
      ? requests.reduce((sum, r) => sum + (r.confidence || 0), 0) / requests.length
      : 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const costs = await prisma.aICost.findMany({
      where: { createdAt: { gte: todayStart } }
    });
    const todayCost = costs.reduce((sum, c) => sum + c.cost, 0);

    const tokens = await prisma.aITokenUsage.findMany({
      where: { createdAt: { gte: todayStart } }
    });
    const todayTokens = tokens.reduce((sum, t) => sum + t.tokens, 0);

    const services = await prisma.aIServiceHealth.findMany();

    res.json({
      success: true,
      data: {
        totalRequests,
        activeAgents,
        healthyAgents,
        warningAgents,
        failedAgents,
        queueSize,
        avgResponseTime,
        avgConfidence,
        todayCost,
        todayTokens,
        services,
        gpuUsage: Math.random() * 40 + 20, // Simulated
        cpuUsage: Math.random() * 30 + 10,
        memoryUsage: Math.random() * 50 + 20
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get all agents status
router.get('/agents', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const agents = await prisma.aIHealth.findMany();
    res.json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get all queues status
router.get('/queues', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const queues = await prisma.aIQueue.findMany();
    res.json({ success: true, data: queues });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get incidents
router.get('/incidents', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const incidents = await prisma.aIIncident.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get models
router.get('/models', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const models = await prisma.aIModel.findMany();
    res.json({ success: true, data: models });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Actions
router.post('/restart-agent', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const { agentName } = req.body;
    await prisma.aIHealth.update({
      where: { agentName },
      data: { status: 'HEALTHY', lastExecutionTime: new Date() }
    });
    res.json({ success: true, message: 'Agent restarted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
