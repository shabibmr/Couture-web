import express from 'express';
import { getDashboardStats } from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// router.use(authenticate);

router.get('/stats', getDashboardStats);

export default router;
