import { supabase } from '../config/supabase.js';

const HABITS_TABLE = 'habits';
const LOGS_TABLE = 'habit_logs';

export async function getDashboardSummary(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);

  const { data: habits, error: habitsError } = await supabase
    .from(HABITS_TABLE)
    .select('id, category, goal_type')
    .eq('user_id', userId);
  if (habitsError) throw new Error(habitsError.message);

  const habitList = habits || [];
  const habitIds = habitList.map((h) => h.id);

  const { data: logs, error: logsError } = await supabase
    .from(LOGS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .gte('date', weekAgoStr)
    .lte('date', today);
  if (logsError) throw new Error(logsError.message);

  const logList = logs || [];
  const todayLogs = logList.filter((l) => l.date === today);
  const dailyCompleted = new Set(todayLogs.filter((l) => l.completed).map((l) => l.habit_id));

  const daily = {
    totalHabits: habitIds.length,
    completedCount: dailyCompleted.size,
    completionRate: habitIds.length ? dailyCompleted.size / habitIds.length : 0
  };

  const daysTracked = new Set(logList.map((l) => l.date));
  const weekly = {
    daysTracked: daysTracked.size,
    averageCompletion: daily.completionRate // simple placeholder
  };

  const byCategory = {};
  logList.forEach((log) => {
    const habit = habitList.find((h) => h.id === log.habit_id);
    if (!habit) return;
    const cat = habit.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = { total: 0, completed: 0 };
    byCategory[cat].total += 1;
    if (log.completed) byCategory[cat].completed += 1;
  });

  const categoryScores = Object.entries(byCategory).map(([category, v]) => ({
    category,
    completion: v.total ? v.completed / v.total : 0
  }));

  const wellnessScoreCurrent = computeWellnessScore(categoryScores);

  // For now, previous score is computed using half logs (rough heuristic)
  const previousScore = wellnessScoreCurrent - 5;

  const reminders = [];
  if (daily.completionRate < 0.5) {
    reminders.push({
      id: 'low-today',
      title: "Today's completion is low",
      message: 'Complete at least one key habit to prevent your wellness score from dropping.'
    });
  }
  if (categoryScores.some((c) => c.category === 'Sleep' && c.completion < 0.4)) {
    reminders.push({
      id: 'sleep-low',
      title: 'Prioritise sleep tonight',
      message: 'Your sleep-related habits are lagging. Protect your energy by resting earlier.'
    });
  }

  return {
    daily,
    weekly,
    wellnessScore: { current: wellnessScoreCurrent, previous: previousScore },
    reminders
  };
}

function computeWellnessScore(categoryScores) {
  if (!categoryScores.length) return 0;
  const mapped = categoryScores.map((c) => c.completion);
  const avg = mapped.reduce((a, b) => a + b, 0) / mapped.length;
  return Math.min(100, Math.max(0, avg * 100));
}

export async function getAnalytics(userId) {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 29);
  const from = thirtyDaysAgo.toISOString().slice(0, 10);
  const to = today.toISOString().slice(0, 10);

  const { data: habits, error: habitsError } = await supabase
    .from(HABITS_TABLE)
    .select('id, name, category')
    .eq('user_id', userId);
  if (habitsError) throw new Error(habitsError.message);

  const { data: logs, error: logsError } = await supabase
    .from(LOGS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to);
  if (logsError) throw new Error(logsError.message);

  const habitList = habits || [];
  const logList = logs || [];
  const totals = {
    habits: habitList.length,
    completionRate: 0,
    bestStreak: 0
  };

  const habitLogMap = new Map();
  logList.forEach((log) => {
    if (!habitLogMap.has(log.habit_id)) {
      habitLogMap.set(log.habit_id, []);
    }
    habitLogMap.get(log.habit_id).push(log);
  });

  let completedLogs = 0;
  logs.forEach((l) => {
    if (l.completed) completedLogs += 1;
  });
  totals.completionRate = logList.length ? completedLogs / logList.length : 0;

  let bestStreak = 0;
  habitLogMap.forEach((habitLogs) => {
    const dates = [...new Set(habitLogs.filter((l) => l.completed).map((l) => l.date))].sort();
    let streak = 0;
    let maxStreak = 0;
    let prev = null;
    dates.forEach((d) => {
      const current = new Date(d);
      if (!prev) streak = 1;
      else {
        const diff = (current - prev) / (1000 * 60 * 60 * 24);
        streak = diff === 1 ? streak + 1 : 1;
      }
      maxStreak = Math.max(maxStreak, streak);
      prev = current;
    });
    bestStreak = Math.max(bestStreak, maxStreak);
  });
  totals.bestStreak = bestStreak;

  const weeklyMap = {};
  logList.forEach((log) => {
    const date = new Date(log.date);
    const weekLabel = `${date.getDate()}/${date.getMonth() + 1}`;
    if (!weeklyMap[weekLabel]) {
      weeklyMap[weekLabel] = { total: 0, completed: 0 };
    }
    weeklyMap[weekLabel].total += 1;
    if (log.completed) weeklyMap[weekLabel].completed += 1;
  });

  const weeklyTrend = Object.entries(weeklyMap).map(([label, v]) => ({
    label,
    completion: v.total ? Math.round((v.completed / v.total) * 100) : 0
  }));

  const byCategory = {};
  logs.forEach((log) => {
    const habit = habits.find((h) => h.id === log.habit_id);
    if (!habit) return;
    const cat = habit.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = { total: 0, completed: 0 };
    byCategory[cat].total += 1;
    if (log.completed) byCategory[cat].completed += 1;
  });

  const byCategoryArr = Object.entries(byCategory).map(([category, v]) => ({
    category,
    completion: v.total ? Math.round((v.completed / v.total) * 100) : 0
  }));

  const habitPerformance = [];
  habitLogMap.forEach((habitLogs, habitId) => {
    const habit = habitList.find((h) => h.id === habitId);
    if (!habit) return;
    const total = habitLogs.length;
    const completed = habitLogs.filter((l) => l.completed).length;
    habitPerformance.push({
      id: habitId,
      name: habit.name,
      completion: total ? completed / total : 0
    });
  });

  const sorted = habitPerformance.sort((a, b) => b.completion - a.completion);
  const best = sorted.slice(0, 3);
  const worst = sorted.slice(-3).filter((h) => h.completion < 1);

  return {
    totals,
    weeklyTrend,
    byCategory: byCategoryArr,
    best,
    worst
  };
}

export async function getLogsForExport(userId) {
  const { data, error } = await supabase
    .from(LOGS_TABLE)
    .select('date, value, completed, habit_id, habits(name, category)')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  return data || [];
}

