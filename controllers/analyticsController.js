import { getAnalytics, getDashboardSummary, getLogsForExport } from '../models/analyticsModel.js';

export async function dashboardSummary(req, res) {
  try {
    const data = await getDashboardSummary(req.user.id);
    return res.json(data);
  } catch (err) {
    console.error('dashboardSummary:', err);
    return res.status(500).json({ message: err?.message || 'Failed to load dashboard summary' });
  }
}

export async function analytics(req, res) {
  try {
    const data = await getAnalytics(req.user.id);
    return res.json(data);
  } catch (err) {
    console.error('analytics:', err);
    return res.status(500).json({ message: err?.message || 'Failed to load analytics' });
  }
}

export async function exportCsv(req, res) {
  try {
    const logs = await getLogsForExport(req.user.id);
    const header = ['date', 'habit_name', 'category', 'value', 'completed'];
    const rows = logs.map((l) => [
      l.date,
      l.habits?.name || '',
      l.habits?.category || '',
      l.value,
      l.completed ? 'true' : 'false'
    ]);
    const content = [header, ...rows].map((r) => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="habits.csv"');
    return res.send(content);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to export data' });
  }
}

