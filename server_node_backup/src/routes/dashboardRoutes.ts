import express from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/metrics', authenticateToken, getDashboardMetrics);

export default router;
