import express from 'express';
import { analytics, dashboardSummary, exportCsv } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/dashboard/summary', dashboardSummary);
router.get('/analytics', analytics);
router.get('/export/csv', exportCsv);

export default router;

