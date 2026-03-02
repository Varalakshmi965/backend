import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import moodRoutes from './routes/moodRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';

import { authMiddleware } from './middleware/authMiddleware.js';

dotenv.config(); // ✅ Load env first

const app = express(); // ✅ Create app before using it

// ================= CORS =================
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(morgan('dev'));

// ================= ROOT ROUTE =================
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'HealthyHabits Tracker API' });
});

// ================= ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/habits', authMiddleware, habitRoutes);
app.use('/api', authMiddleware, analyticsRoutes);
app.use('/api/moods', authMiddleware, moodRoutes);
app.use('/api/challenges', authMiddleware, challengeRoutes); // ✅ correct place

// ================= SERVER =================
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});