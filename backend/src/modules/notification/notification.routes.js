import express from 'express';
import { getNotifications, markNotificationAsRead, removeNotification } from './notification.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationAsRead);
router.delete('/:id', removeNotification);

export default router;
