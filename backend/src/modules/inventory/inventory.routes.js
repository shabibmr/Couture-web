import express from 'express';
import * as inventoryController from './inventory.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js'; // Assuming these exist, will check

const router = express.Router();

router.use(authenticate);
router.use(authorize(['admin', 'super_admin']));

router.get('/', inventoryController.getInventory);
router.put('/update', inventoryController.updateStock);
router.get('/low-stock', inventoryController.getLowStock);

export default router;
