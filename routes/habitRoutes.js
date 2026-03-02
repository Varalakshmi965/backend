import express from 'express';
import {
  createHabitController,
  deleteHabitController,
  listHabits,
  logHabitController
} from '../controllers/habitController.js';

const router = express.Router();

router.get('/', listHabits);
router.post('/', createHabitController);
router.delete('/:id', deleteHabitController);
router.post('/logs', logHabitController);

export default router;

