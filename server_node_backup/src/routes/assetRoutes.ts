import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
// Stub controller imports
const router = express.Router();

router.get('/', authenticateToken, (req, res) => res.json({ message: 'Assets route' }));

export default router;
