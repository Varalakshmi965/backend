import { supabase } from "../config/supabase.js";

// CREATE CHALLENGE
export const createChallenge = async (req, res) => {
  try {
    const { title, description, habit_category, duration_days } = req.body;

    const { data, error } = await supabase
      .from("challenges")
      .insert([
        {
          title,
          description,
          habit_category,
          duration_days,
          created_by: req.user.id,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// JOIN CHALLENGE
export const joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;

    const { error } = await supabase
      .from("challenge_participants")
      .insert([
        {
          challenge_id: challengeId,
          user_id: req.user.id,
        },
      ]);

    if (error) throw error;

    res.json({ message: "Joined challenge successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LEADERBOARD
export const getLeaderboard = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const { data, error } = await supabase
      .from("challenge_progress")
      .select("user_id, completed")
      .eq("challenge_id", challengeId)
      .eq("completed", true);

    if (error) throw error;

    const leaderboard = {};

    data.forEach((entry) => {
      leaderboard[entry.user_id] =
        (leaderboard[entry.user_id] || 0) + 1;
    });

    const sorted = Object.entries(leaderboard)
      .sort((a, b) => b[1] - a[1])
      .map(([user_id, score]) => ({ user_id, score }));

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};