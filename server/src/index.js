import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './lib/prisma.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donors.js';
import requestRoutes from './routes/requests.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);

app.get('/api/stats', async (req, res, next) => {
  try {
    const [totalDonors, livesSaved, activeRequests] = await Promise.all([
      prisma.user.count({ where: { role: 'DONOR' } }),
      prisma.donationHistory.count({ where: { status: 'COMPLETED' } }),
      prisma.bloodRequest.count({ where: { status: 'OPEN' } }),
    ]);

    res.json({
      success: true,
      data: { totalDonors, livesSaved, activeRequests },
    });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`LifeFlow server running on port ${PORT}`);
});
