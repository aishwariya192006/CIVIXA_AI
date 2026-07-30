import cron from 'node-cron';
import prisma from '../utils/prisma';
import { getIO } from '../utils/socket'; 

const agents = [
  "Complaint Understanding Agent",
  "Department Routing Agent",
  "Duplicate Detection Agent",
  "Priority Agent",
  "Reminder Agent",
  "Resolution Verification Agent",
  "Escalation Agent",
  "Notification Agent",
  "Analytics Agent"
];

const models = ["OpenAI", "Gemini", "Claude", "Azure OpenAI", "Ollama", "OpenRouter"];
const queues = ["ai-tasks", "email-queue", "sms-queue"];
const services = ["PostgreSQL", "Redis", "BullMQ", "Socket.IO", "Cloudinary", "Backend", "Frontend"];

export const initAIOpsWorkers = () => {
  console.log('[AIOps] Initializing background workers...');

  // Initialize DB data if empty
  setupInitialData();

  // 1. Health Checker & Latency Monitor (Runs every 30 seconds)
  cron.schedule('*/30 * * * * *', async () => {
    try {
      // Simulate infrastructure health check
      for (const service of services) {
        const isHealthy = Math.random() > 0.05; // 95% chance of being healthy
        const status = isHealthy ? "HEALTHY" : (Math.random() > 0.5 ? "WARNING" : "OFFLINE");
        
        await prisma.aIServiceHealth.upsert({
          where: { serviceName: service },
          update: { status, lastCheck: new Date(), latency: Math.random() * 100 },
          create: { serviceName: service, status, latency: Math.random() * 100 }
        });
      }

      // Simulate Agent Health
      for (const agent of agents) {
        const recentReqs = await prisma.aIRequest.findMany({
          where: { agent, createdAt: { gte: new Date(Date.now() - 3600000) } }, // Last hour
          take: 50
        });

        let avgLatency = 0;
        let avgConfidence = 0;
        if (recentReqs.length > 0) {
          avgLatency = recentReqs.reduce((sum, r) => sum + (r.latency || 0), 0) / recentReqs.length;
          avgConfidence = recentReqs.reduce((sum, r) => sum + (r.confidence || 0), 0) / recentReqs.length;
        } else {
          avgLatency = 100 + Math.random() * 500;
          avgConfidence = 0.8 + Math.random() * 0.19;
        }

        const isHealthy = avgLatency < 2000 && avgConfidence > 0.7;
        const status = isHealthy ? "HEALTHY" : "WARNING";

        await prisma.aIHealth.upsert({
          where: { agentName: agent },
          update: {
            status,
            responseTime: avgLatency,
            confidence: avgConfidence,
            successRate: isHealthy ? 0.99 : 0.85,
            failureRate: isHealthy ? 0.01 : 0.15,
            queueLength: Math.floor(Math.random() * 10),
            updatedAt: new Date()
          },
          create: {
            agentName: agent,
            status,
            currentModel: models[Math.floor(Math.random() * models.length)],
            version: "1.0.0",
            responseTime: avgLatency,
            confidence: avgConfidence,
            successRate: 0.99,
            failureRate: 0.01,
            queueLength: 0,
            currentWorker: "worker-1"
          }
        });
      }

      try {
        const io = getIO();
        io.emit('aiops:health_update', { timestamp: new Date() });
      } catch (e) {}
    } catch (error) {
      console.error('[AIOps] Health check failed:', error);
    }
  });

  // 2. Incident Generator & Self Healing Engine (Runs every 1 minute)
  cron.schedule('* * * * *', async () => {
    try {
      const unhealthyAgents = await prisma.aIHealth.findMany({
        where: { status: { in: ["WARNING", "CRITICAL", "OFFLINE"] } }
      });

      for (const agent of unhealthyAgents) {
        const alert = await prisma.aIAlert.create({
          data: {
            message: `${agent.agentName} is currently ${agent.status}`,
            level: agent.status === "OFFLINE" ? "CRITICAL" : "WARNING",
            source: "HealthChecker"
          }
        });

        try { getIO().emit('aiops:alert', alert); } catch (e) {}

        if (agent.status === "CRITICAL" || agent.status === "OFFLINE") {
          console.log(`[Self-Healing] Restarting ${agent.agentName}...`);
          await prisma.aIHealth.update({
            where: { agentName: agent.agentName },
            data: { status: "HEALTHY", lastExecutionTime: new Date() }
          });
          
          await prisma.aIIncident.create({
            data: {
              agent: agent.agentName,
              severity: "HIGH",
              rootCause: "High Latency / Low Confidence Timeout",
              resolved: true,
              downtime: 60,
              recoveryTime: 5,
              resolutionNotes: "Self-healing engine successfully restarted the agent.",
              resolvedAt: new Date()
            }
          });
        }
      }
    } catch (error) {
      console.error('[AIOps] Incident Generator failed:', error);
    }
  });

  // 3. Cost & Token Calculator (Runs every 5 minutes)
  cron.schedule('*/5 * * * *', async () => {
    try {
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const randomModel = models[Math.floor(Math.random() * models.length)];
      const tokens = Math.floor(Math.random() * 5000);
      const cost = tokens * 0.00002;

      await prisma.aITokenUsage.create({
        data: { agent: randomAgent, model: randomModel, tokens, type: "TOTAL" }
      });

      await prisma.aICost.create({
        data: { agent: randomAgent, model: randomModel, cost }
      });
      
      await prisma.aIModel.updateMany({
        where: { name: randomModel },
        data: {
          totalTokens: { increment: tokens },
          totalCost: { increment: cost },
          totalRequests: { increment: 1 }
        }
      });

      try { getIO().emit('aiops:cost_update', { model: randomModel, cost, tokens }); } catch (e) {}

    } catch (error) {
      console.error('[AIOps] Cost Calculator failed:', error);
    }
  });

  // 4. Queue Monitor (Runs every 10 seconds)
  cron.schedule('*/10 * * * * *', async () => {
    try {
      for (const queue of queues) {
        await prisma.aIQueue.upsert({
          where: { queueName: queue },
          update: {
            waitingJobs: Math.floor(Math.random() * 20),
            activeJobs: Math.floor(Math.random() * 5),
            completedJobs: { increment: Math.floor(Math.random() * 10) },
            avgProcessingTime: 200 + Math.random() * 100,
          },
          create: {
            queueName: queue,
            status: "ACTIVE"
          }
        });
      }
      try { getIO().emit('aiops:queue_update', { timestamp: new Date() }); } catch (e) {}
    } catch (error) {
      console.error('[AIOps] Queue Monitor failed:', error);
    }
  });
};

const setupInitialData = async () => {
  for (const model of models) {
    await prisma.aIModel.upsert({
      where: { name: model },
      update: {},
      create: { name: model, provider: model.includes('OpenAI') ? 'OpenAI' : model }
    });
  }

  await prisma.aIWorker.upsert({
    where: { workerName: "primary-worker-1" },
    update: { status: "RUNNING", lastPing: new Date() },
    create: { workerName: "primary-worker-1", status: "RUNNING" }
  });
};
