import { supabase } from '../config/supabase.js';

const MOODS_TABLE = 'moods';

export async function logMood(userId, { mood, note }) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from(MOODS_TABLE)
    .insert({ user_id: userId, mood, note, date: today })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getMoods(userId) {
  const { data, error } = await supabase
    .from(MOODS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  return data || [];
}

