import { supabase } from "../config/supabase.js";
import {
  createHabit,
  deleteHabit,
  getHabitsByUser,
  logHabit,
} from "../models/habitModel.js";
import { calculateStreak } from "../utils/streakCalculator.js";


// ✅ LIST HABITS WITH STREAK + LOGS
export async function listHabits(req, res) {
  try {
    const habits = await getHabitsByUser(req.user.id);

    const habitsWithData = await Promise.all(
      habits.map(async (habit) => {
        // 🔹 Get all logs for that habit
        const { data: logs } = await supabase
          .from("habit_logs")
          .select("*")
          .eq("habit_id", habit.id);

        // 🔹 Calculate streak using only completed logs
        const completedLogs = logs?.filter((log) => log.completed);
        const streak = calculateStreak(completedLogs || []);

        return {
          ...habit,
          streak,
          logs: logs || [], // ✅ IMPORTANT for reminder
        };
      })
    );

    return res.json(habitsWithData);
  } catch (err) {
    console.error("listHabits:", err);
    return res.status(500).json({
      message: err?.message || "Failed to load habits",
    });
  }
}


// ✅ CREATE HABIT
export async function createHabitController(req, res) {
  try {
    const habit = await createHabit(req.user.id, req.body);
    return res.status(201).json(habit);
  } catch (err) {
    console.error("createHabit:", err);
    return res
      .status(500)
      .json({ message: err?.message || "Failed to create habit" });
  }
}


// ✅ DELETE HABIT
export async function deleteHabitController(req, res) {
  try {
    await deleteHabit(req.user.id, req.params.id);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete habit" });
  }
}


// ✅ LOG HABIT
export async function logHabitController(req, res) {
  try {
    const log = await logHabit(req.user.id, req.body);
    return res.status(201).json(log);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to log habit" });
  }
}