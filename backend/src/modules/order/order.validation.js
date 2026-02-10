/**
 * Order Validation Schemas
 * Joi validation for order endpoints
 */

import Joi from 'joi';

/**
 * Schema for creating an order
 */
export const createOrderSchema = Joi.object({
    shipping_address: Joi.alternatives().try(
        Joi.string().min(10).max(500),
        Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            postal_code: Joi.string().required(),
            country: Joi.string().required(),
            phone: Joi.string().optional()
        })
    ).required(),

    billing_address: Joi.alternatives().try(
        Joi.string().min(10).max(500),
        Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            postal_code: Joi.string().required(),
            country: Joi.string().required(),
            phone: Joi.string().optional()
        })
    ).required(),

    shipping_method_id: Joi.string().uuid().optional(),

    items: Joi.array().items(
        Joi.object({
            variant_id: Joi.string().uuid().optional(),
            product_id: Joi.string().uuid().required(),
            size: Joi.string().required(),
            quantity: Joi.number().integer().min(1).max(100).required()
        })
    ).min(1).max(50).optional(), // Optional because can use cart

    payment_method: Joi.string().valid('cod', 'razorpay', 'stripe', 'paypal').optional(),

    currency: Joi.string().length(3).uppercase().default('INR').optional(),

    coupon_code: Joi.string().trim().min(3).max(50).optional(),

    coupon_codes: Joi.array().items(
        Joi.string().trim().min(3).max(50)
    ).max(5).optional() // Support multiple coupons (max 5)
});

/**
 * Schema for order ID parameter
 */
export const orderIdSchema = Joi.object({
    id: Joi.string().uuid().required()
});

/**
 * Schema for updating order status
 */
export const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid(
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
    ).required(),

    // Optional fields for additional context
    notes: Joi.string().max(500).optional(),
    tracking_number: Joi.string().max(100).optional()
});

/**
 * Schema for order query parameters
 */
export const orderQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid(
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
    ).optional(),
    customer_id: Joi.string().uuid().optional(),
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().optional()
});
