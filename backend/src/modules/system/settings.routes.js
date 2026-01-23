import express from 'express';
import * as settingsController from './settings.controller.js';
import { authenticate, isAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', settingsController.getSettings);
router.put('/', authenticate, isAdmin, settingsController.updateSettings);

export default router;
