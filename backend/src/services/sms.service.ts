import twilio from 'twilio';
import prisma from '../utils/prisma';

let twilioClient: twilio.Twilio | null = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export const sendSMS = async (to: string, message: string) => {
  try {
    if (!twilioClient) {
      console.warn('[SMS Service] Twilio credentials not configured. Simulating SMS sending.');
      
      await prisma.sMSLog.create({
        data: {
          to,
          message,
          status: 'FAILED',
          error: 'Twilio credentials not configured'
        }
      });
      return { sid: 'simulated_sid' };
    }

    const info = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
      to
    });

    await prisma.sMSLog.create({
      data: {
        to,
        message,
        status: 'SENT',
        sentAt: new Date()
      }
    });

    return info;
  } catch (error: any) {
    console.error('SMS Delivery Failed:', error);
    
    await prisma.sMSLog.create({
      data: {
        to,
        message,
        status: 'FAILED',
        error: error.message
      }
    });
    
    throw error;
  }
};
