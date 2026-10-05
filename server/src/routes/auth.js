import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../validators/auth.js';

const router = express.Router();

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

export default router;
