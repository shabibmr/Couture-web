import express from 'express';
import { createOrder, getOrders, getOrderById, getOrderByIdAdmin, updateOrderStatus, deleteOrder } from './order.controller.js';
import { calculateShipping } from './shipping.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createOrderSchema, orderIdSchema, updateOrderStatusSchema } from './order.validation.js';


const router = express.Router();

// Public shipping calculation endpoint (no auth required for preview)
router.get('/shipping/calculate', calculateShipping);

router.use(authenticate);


router.post('/', validate(createOrderSchema), createOrder);
router.get('/', getOrders);
router.get('/admin/:id', validate(orderIdSchema, 'params'), getOrderByIdAdmin);
router.get('/:id', validate(orderIdSchema, 'params'), getOrderById);
router.put('/:id/status', validate(orderIdSchema, 'params'), validate(updateOrderStatusSchema), updateOrderStatus);
router.delete('/:id', validate(orderIdSchema, 'params'), deleteOrder);

export default router;
