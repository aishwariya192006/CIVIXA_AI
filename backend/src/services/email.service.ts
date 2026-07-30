import nodemailer from 'nodemailer';
import prisma from '../utils/prisma';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'test_user',
    pass: process.env.SMTP_PASS || 'test_pass',
  },
});

export const sendEmail = async (to: string, subject: string, bodyHTML: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"CIVIXA AI" <${process.env.SMTP_FROM || 'noreply@civixa.ai'}>`,
      to,
      subject,
      html: bodyHTML,
    });

    await prisma.emailLog.create({
      data: {
        to,
        subject,
        body: bodyHTML,
        status: 'SENT',
        sentAt: new Date()
      }
    });

    return info;
  } catch (error: any) {
    console.error('Email Delivery Failed:', error);
    
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        body: bodyHTML,
        status: 'FAILED',
        error: error.message
      }
    });
    
    throw error;
  }
};
