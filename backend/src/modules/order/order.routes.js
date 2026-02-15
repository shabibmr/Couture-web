/**
 * Order Routes (Refactored)
 * Includes validation middleware for all endpoints
 */

import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    getOrderByIdAdmin,
    updateOrderStatus,
    deleteOrder,
    calculateShipping
} from './order.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
    createOrderSchema,
    orderIdSchema,
    updateOrderStatusSchema,
    orderQuerySchema
} from './order.validation.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Shipping calculation endpoint (no auth required for preview)
router.get('/shipping/calculate', calculateShipping);
router.get('/calculate-shipping', calculateShipping);

// ==================== AUTHENTICATED ROUTES ====================

// All routes below require authentication
router.use(authenticate);

// Create order (with validation)
router.post('/', validate(createOrderSchema), createOrder);

// Get all orders (with query validation)
router.get('/', validate(orderQuerySchema, 'query'), getOrders);

// Get order by ID - Admin view (no customer filter)
router.get('/admin/:id', validate(orderIdSchema, 'params'), getOrderByIdAdmin);

// Get order by ID - Customer view (filtered by customer_id)
router.get('/:id', validate(orderIdSchema, 'params'), getOrderById);

// Update order status (with validation)
router.put('/:id/status', validate(orderIdSchema, 'params'), validate(updateOrderStatusSchema), updateOrderStatus);

// Delete order (admin only)
router.delete('/:id', validate(orderIdSchema, 'params'), deleteOrder);

export default router;
