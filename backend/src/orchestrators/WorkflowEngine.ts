import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';

const prisma = new PrismaClient();

// Define queues
const workflowQueue = new Queue('workflow-queue', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

export class WorkflowEngine {
  
  static async startComplaintWorkflow(complaintId: string) {
    try {
      // 1. Log the initiation event
      await prisma.timelineEvent.create({
        data: {
          complaintId,
          title: 'Complaint Submitted',
          description: 'The complaint was successfully received by the CIVIXA system.',
        }
      });
      
      // 2. Add job to BullMQ for asynchronous AI orchestration
      await workflowQueue.add('process-complaint', { complaintId }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      });

      console.log(`[WorkflowEngine] Complaint ${complaintId} workflow initiated.`);
    } catch (error) {
      console.error(`[WorkflowEngine] Error starting workflow for ${complaintId}`, error);
      throw error;
    }
  }

  static async logEvent(complaintId: string, title: string, description: string, aiResult?: string) {
    return await prisma.timelineEvent.create({
      data: {
        complaintId,
        title,
        description,
        aiResult
      }
    });
  }

  static async logAudit(action: string, userId?: string, complaintId?: string, details?: string) {
    return await prisma.auditLog.create({
      data: {
        action,
        userId,
        complaintId,
        details
      }
    });
  }
}
