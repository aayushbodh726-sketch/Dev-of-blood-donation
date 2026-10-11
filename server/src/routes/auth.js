import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../validators/auth.js';

const router = express.Router();

// In-memory reset tokens for local development (no email service).
// Production uses Supabase Auth emails via the Edge Function.
const localResetTokens = new Map();

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, phone, bloodGroup, role, city, state, zipCode } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        bloodGroup,
        role,
        city,
        state,
        zipCode
      }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(201).json({ success: true, data: { token, user: userWithoutPassword } });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({ success: true, data: { token, user: userWithoutPassword } });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, (req, res) => {
  const { passwordHash: _, ...userWithoutPassword } = req.user;
  res.json({ success: true, data: userWithoutPassword });
});

/**
 * Local-dev forgot password: creates a short-lived token.
 * No real email is sent; the token is returned in the response for testing only.
 * Production password reset is handled by the Supabase Edge Function + email.
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    let devToken = null;
    if (user) {
      devToken = crypto.randomBytes(32).toString('hex');
      localResetTokens.set(devToken, { userId: user.id, expires: Date.now() + 60 * 60 * 1000 });
    }

    res.json({
      success: true,
      message:
        'If an account exists for that email, a password reset link has been sent. Please check your inbox and spam folder.',
      // Only present in local API so you can test without SMTP
      ...(process.env.NODE_ENV !== 'production' && devToken
        ? { data: { devResetToken: devToken } }
        : {}),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const authHeader = req.headers.authorization || '';
    const token =
      (authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '') ||
      (typeof req.body?.accessToken === 'string' ? req.body.accessToken : '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired reset link. Please request a new one.',
      });
    }

    const entry = localResetTokens.get(token);
    if (!entry || entry.expires < Date.now()) {
      localResetTokens.delete(token);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired reset link. Please request a new one.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: entry.userId },
      data: { passwordHash },
    });
    localResetTokens.delete(token);

    res.json({
      success: true,
      message: 'Your password has been updated. You can now sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
