import Joi from 'joi';

/**
 * Order validation schemas
 */

export const createOrderSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            variant_id: Joi.number().integer().positive().required(),
            product_id: Joi.number().integer().positive().required(),
            quantity: Joi.number().integer().positive().min(1).max(99).required(),
            price: Joi.number().positive().required()
        })
    ).min(1).required()
        .messages({
            'array.min': 'Order must contain at least one item',
            'any.required': 'Items are required'
        }),
    shipping_address_id: Joi.number().integer().positive().required()
        .messages({
            'number.base': 'Shipping address ID must be a number',
            'number.integer': 'Shipping address ID must be an integer',
            'number.positive': 'Shipping address ID must be positive',
            'any.required': 'Shipping address ID is required'
        }),
    billing_address_id: Joi.number().integer().positive().optional()
        .messages({
            'number.base': 'Billing address ID must be a number',
            'number.integer': 'Billing address ID must be an integer',
            'number.positive': 'Billing address ID must be positive'
        }),
    coupon_code: Joi.string().max(50).optional()
        .messages({
            'string.max': 'Coupon code cannot exceed 50 characters'
        }),
    notes: Joi.string().max(500).optional()
        .messages({
            'string.max': 'Notes cannot exceed 500 characters'
        })
});

export const orderIdSchema = Joi.object({
    id: Joi.number().integer().positive().required()
        .messages({
            'number.base': 'Order ID must be a number',
            'number.integer': 'Order ID must be an integer',
            'number.positive': 'Order ID must be positive',
            'any.required': 'Order ID is required'
        })
});

export const updateOrderStatusSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
        .required()
        .messages({
            'string.base': 'Status must be a string',
            'any.only': 'Invalid status value',
            'any.required': 'Status is required'
        })
});
