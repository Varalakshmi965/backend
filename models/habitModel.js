import { supabase } from '../config/supabase.js';

const HABITS_TABLE = 'habits';
const LOGS_TABLE = 'habit_logs';

export async function getHabitsByUser(userId) {
  const { data, error } = await supabase
    .from(HABITS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createHabit(userId, payload) {
  const { data, error } = await supabase
    .from(HABITS_TABLE)
    .insert({
      user_id: userId,
      name: payload.name,
      category: payload.category,
      goal_type: payload.goalType,
      goal_value: payload.goalValue,
      unit: payload.unit
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteHabit(userId, habitId) {
  const { error: logsError } = await supabase.from(LOGS_TABLE).delete().eq('habit_id', habitId);
  if (logsError) throw new Error(logsError.message);

  const { error } = await supabase
    .from(HABITS_TABLE)
    .delete()
    .eq('id', habitId)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function logHabit(userId, { habitId, date, value, completed }) {
  const { data, error } = await supabase
    .from(LOGS_TABLE)
    .insert({
      user_id: userId,
      habit_id: habitId,
      date,
      value,
      completed
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

