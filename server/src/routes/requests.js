import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createRequestSchema } from '../validators/requests.js';

const router = express.Router();

const urgencyOrder = { CRITICAL: 1, HIGH: 2, NORMAL: 3 };

router.post('/', authenticate, validate(createRequestSchema), async (req, res, next) => {
  try {
    const requestData = {
      ...req.body,
      recipientId: req.user.id
    };

    const newRequest = await prisma.bloodRequest.create({
      data: requestData
    });

    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { status = 'OPEN' } = req.query;

    const requests = await prisma.bloodRequest.findMany({
      where: { status },
      include: {
        recipient: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const sortedRequests = requests.sort((a, b) => {
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    res.json({ success: true, data: sortedRequests });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/pledge', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'DONOR') {
      return res.status(403).json({ success: false, error: 'Only donors can pledge to blood requests' });
    }

    const bloodRequest = await prisma.bloodRequest.findUnique({ where: { id } });

    if (!bloodRequest) {
      return res.status(404).json({ success: false, error: 'Blood request not found' });
    }

    if (bloodRequest.status !== 'OPEN') {
      return res.status(400).json({ success: false, error: 'This request is no longer open' });
    }

    const existingPledge = await prisma.donationHistory.findFirst({
      where: { donorId: req.user.id, requestId: id }
    });

    if (existingPledge) {
      return res.status(400).json({ success: false, error: 'You have already pledged to this request' });
    }

    const donation = await prisma.donationHistory.create({
      data: {
        donorId: req.user.id,
        requestId: id,
        status: 'PLEDGED'
      },
      include: {
        request: true
      }
    });

    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const [totalDonors, livesSaved, activeRequests] = await Promise.all([
      prisma.user.count({ where: { role: 'DONOR' } }),
      prisma.donationHistory.count({ where: { status: 'COMPLETED' } }),
      prisma.bloodRequest.count({ where: { status: 'OPEN' } })
    ]);

    res.json({ success: true, data: { totalDonors, livesSaved, activeRequests } });
  } catch (error) {
    next(error);
  }
});

export default router;
