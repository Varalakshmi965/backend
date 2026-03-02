import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createUser, findUserByEmail } from '../models/userModel.js';

dotenv.config();

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    const user = await createUser({ name, email, password });
    const token = signToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    const msg =
      err?.message ||
      (err?.code === 'PGRST116' ? 'Database tables missing. Run the schema in Supabase SQL editor.' : 'Failed to register user');
    return res.status(500).json({ message: msg });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const safeUser = { id: user.id, name: user.name, email: user.email };
    const token = signToken(safeUser);
    return res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err);
    const msg =
      err?.message ||
      (err?.code === 'PGRST116' ? 'Database tables missing. Run the schema in Supabase SQL editor.' : 'Failed to log in');
    return res.status(500).json({ message: msg });
  }
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

