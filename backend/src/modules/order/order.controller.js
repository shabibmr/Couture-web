/**
 * Order Controller (Refactored)
 * Handles HTTP requests and delegates business logic to services
 * Clean, maintainable controller following best practices
 */

import orderService from './services/order.service.js';
import orderCalculationService from './services/order-calculation.service.js';
import { transformOrderImages, transformOrdersArray } from './utils/order-transformer.util.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants/order.constants.js';

/**
 * Create a new order
 * POST /api/orders
 */
export const createOrder = async (req, res) => {
    try {
        const customerId = req.user.id;
        const order = await orderService.createOrder(req.body, customerId);

        res.status(201).json({
            message: SUCCESS_MESSAGES.ORDER_CREATED,
            order: transformOrderImages(order)
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            message: error.message || ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get all orders (with filters and pagination)
 * GET /api/orders
 */
export const getOrders = async (req, res) => {
    try {
        const user = req.user;
        const isAdmin = user.type === 'admin' || user.role === 'admin' || user.role === 'super_admin';

        // Build filters
        const filters = { ...req.query };

        // Non-admin users can only see their own orders
        if (!isAdmin) {
            filters.customerId = user.id;
        }

        const result = await orderService.getOrders(filters, isAdmin);

        res.json({
            total: result.total,
            pages: result.pages,
            currentPage: result.currentPage,
            data: transformOrdersArray(result.data)
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get order by ID (customer view)
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.id;

        const order = await orderService.getOrderById(id, customerId);

        res.json(transformOrderImages(order));
    } catch (error) {
        console.error('Error fetching order:', error);

        if (error.message === ERROR_MESSAGES.ORDER_NOT_FOUND) {
            return res.status(404).json({ message: ERROR_MESSAGES.ORDER_NOT_FOUND });
        }

        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get order by ID (admin view - no customer filter)
 * GET /api/orders/admin/:id
 */
export const getOrderByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Admin can view any order
        const order = await orderService.getOrderById(id);

        res.json(transformOrderImages(order));
    } catch (error) {
        console.error('Error fetching order:', error);

        if (error.message === ERROR_MESSAGES.ORDER_NOT_FOUND) {
            return res.status(404).json({ message: ERROR_MESSAGES.ORDER_NOT_FOUND });
        }

        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update order status
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await orderService.updateOrderStatus(id, status);

        res.json({
            message: SUCCESS_MESSAGES.STATUS_UPDATED,
            order: transformOrderImages(order)
        });
    } catch (error) {
        console.error('Error updating order status:', error);

        if (error.message === ERROR_MESSAGES.ORDER_NOT_FOUND) {
            return res.status(404).json({ message: ERROR_MESSAGES.ORDER_NOT_FOUND });
        }

        if (error.message.includes('Invalid status transition')) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete order (admin only)
 * DELETE /api/orders/:id
 */
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        await orderService.deleteOrder(id);

        res.json({ message: SUCCESS_MESSAGES.ORDER_DELETED });
    } catch (error) {
        console.error('Error deleting order:', error);

        if (error.message === ERROR_MESSAGES.ORDER_NOT_FOUND) {
            return res.status(404).json({ message: ERROR_MESSAGES.ORDER_NOT_FOUND });
        }

        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Calculate shipping preview
 * GET /api/orders/shipping/calculate
 */
export const calculateShipping = async (req, res) => {
    try {
        const { subtotal } = req.query;

        if (!subtotal || isNaN(parseFloat(subtotal))) {
            return res.status(400).json({ message: 'Valid subtotal required' });
        }

        const preview = await orderCalculationService.getShippingPreview(parseFloat(subtotal));

        res.json(preview);
    } catch (error) {
        console.error('Error calculating shipping:', error);
        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
