import express from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder } from './order.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;
