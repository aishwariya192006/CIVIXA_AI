import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendNotification } from '../services/notification.service';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, contactNumber, address, district, pincode, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        contactNumber,
        address,
        district,
        pincode,
        roleName: role || 'CITIZEN',
      },
    });

    const token = jwt.sign({ id: user.id, role: user.roleName }, JWT_SECRET, { expiresIn: '7d' });

    // Send Welcome Notification
    sendNotification({
      userId: user.id,
      type: 'SYSTEM_ALERT',
      title: 'Welcome to CIVIXA AI',
      message: 'Thank you for registering on the platform.',
      emailSubject: 'Welcome to CIVIXA AI',
      emailHtml: `<h1>Welcome ${user.fullName}!</h1><p>Thank you for joining the CIVIXA platform.</p>`,
      smsText: `Welcome to CIVIXA AI, ${user.fullName}! Your account has been created.`
    }).catch(console.error);

    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, fullName: user.fullName, email: user.email, role: user.roleName },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.roleName }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        user: { id: user.id, fullName: user.fullName, email: user.email, role: user.roleName },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { id: true, fullName: true, email: true, roleName: true, contactNumber: true, address: true, district: true, pincode: true, department: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { ...user, role: user.roleName } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, fullName: true, email: true, roleName: true, department: true },
      orderBy: { createdAt: 'desc' }
    });
    const formattedUsers = users.map(u => ({ ...u, role: u.roleName }));
    res.json({ success: true, data: formattedUsers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { fullName, email, roleName, departmentId } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { fullName, email, roleName, departmentId: departmentId || null }
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    // We should allow deleting a user, however foreign keys might restrict this
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
