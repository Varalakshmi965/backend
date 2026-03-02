import express from 'express';
import { login, register } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:5174/reset-password'
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  res.json({ message: 'Password reset link sent to your email' });
});
export default router;

