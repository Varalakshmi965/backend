export const calculateStreak = (logs) => {
  if (!logs || logs.length === 0) return 0;

  // Sort logs by date descending
  const sortedLogs = logs
    .filter(log => log.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let streak = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedLogs.length; i++) {
    let logDate = new Date(sortedLogs[i].date);
    logDate.setHours(0, 0, 0, 0);

    let diff = (today - logDate) / (1000 * 60 * 60 * 24);

    if (diff === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};