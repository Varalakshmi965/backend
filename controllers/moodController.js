import { getMoods, logMood } from '../models/moodModel.js';

export async function createMood(req, res) {
  try {
    const entry = await logMood(req.user.id, req.body);
    return res.status(201).json(entry);
  } catch (err) {
    console.error('createMood:', err);
    return res.status(500).json({ message: err?.message || 'Failed to log mood' });
  }
}

export async function listMoods(req, res) {
  try {
    const entries = await getMoods(req.user.id);
    return res.json(entries);
  } catch (err) {
    console.error('listMoods:', err);
    return res.status(500).json({ message: err?.message || 'Failed to load moods' });
  }
}

