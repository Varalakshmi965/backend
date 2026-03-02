import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import moodRoutes from './routes/moodRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();

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

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'HealthyHabits Tracker API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/habits', authMiddleware, habitRoutes);
app.use('/api', authMiddleware, analyticsRoutes);
app.use('/api/moods', authMiddleware, moodRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

