import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

const USERS_TABLE = 'users';

export async function createUser({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert({ name, email, password_hash: passwordHash })
    .select()
    .single();

  if (error) {
    const msg = error.message || error.details || 'Database error';
    throw new Error(msg);
  }

  return { id: data.id, name: data.name, email: data.email };
}

export async function findUserByEmail(email) {
  const { data, error } = await supabase.from(USERS_TABLE).select('*').eq('email', email).maybeSingle();
  if (error) {
    throw new Error(error.message || error.details || 'Database error');
  }
  return data;
}

