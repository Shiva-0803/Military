import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => res.json({ message: 'Transactions route' }));

export default router;
