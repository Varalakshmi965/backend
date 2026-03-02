import express from 'express';
import { createMood, listMoods } from '../controllers/moodController.js';

const router = express.Router();

router.get('/', listMoods);
router.post('/', createMood);

export default router;

