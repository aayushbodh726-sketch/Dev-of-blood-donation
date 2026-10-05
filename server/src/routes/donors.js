import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.put('/availability', authenticate, async (req, res, next) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { isAvailable: !req.user.isAvailable }
    });

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const { bloodGroup, city } = req.query;

    const where = {
      role: 'DONOR',
      isAvailable: true
    };

    if (bloodGroup) {
      where.bloodGroup = bloodGroup;
    }

    if (city) {
      where.city = { contains: city }; // SQLite contains is case-insensitive by default in Prisma
    }

    const donors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        bloodGroup: true,
        role: true,
        city: true,
        state: true,
        zipCode: true,
        isAvailable: true,
        lastDonatedDate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ success: true, count: donors.length, data: donors });
  } catch (error) {
    next(error);
  }
});

export default router;
