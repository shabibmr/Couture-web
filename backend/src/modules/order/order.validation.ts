import Joi from 'joi';

/**
 * Order validation schemas
 */

// Address schema for inline address objects
const addressSchema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().optional(),
    zip: Joi.string().required(),
    country: Joi.string().optional(),
    phone: Joi.string().required()
}).messages({
    'any.required': 'Address field is required',
    'string.base': 'Address field must be a string'
});

export const createOrderSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            variant_id: Joi.string().uuid().required(),
            product_id: Joi.string().uuid().required(),
            quantity: Joi.number().integer().positive().min(1).max(99).required(),
            price: Joi.number().positive().required()
        })
    ).min(1).required()
        .messages({
            'array.min': 'Order must contain at least one item',
            'any.required': 'Items are required'
        }),
    // Accept either inline address object or UUID reference for backward compatibility
    shipping_address: Joi.alternatives().try(
        addressSchema,
        Joi.string()
    ).optional(),
    shipping_address_id: Joi.string().uuid().optional()
        .messages({
            'string.base': 'Shipping address ID must be a string',
            'string.guid': 'Shipping address ID must be a valid UUID',
            'string.uuid': 'Shipping address ID must be a valid UUID'
        }),
    billing_address: Joi.alternatives().try(
        addressSchema,
        Joi.string()
    ).optional(),
    billing_address_id: Joi.string().uuid().optional()
        .messages({
            'string.base': 'Billing address ID must be a string',
            'string.guid': 'Billing address ID must be a valid UUID',
            'string.uuid': 'Billing address ID must be a valid UUID'
        }),
    // Accept null, undefined, or string for coupon_code
    coupon_code: Joi.string().max(50).allow(null).optional()
        .messages({
            'string.max': 'Coupon code cannot exceed 50 characters'
        }),
    notes: Joi.string().max(500).optional()
        .messages({
            'string.max': 'Notes cannot exceed 500 characters'
        })
}).or('shipping_address', 'shipping_address_id')
    .messages({
        'object.missing': 'Either shipping_address or shipping_address_id is required'
    });

export const orderIdSchema = Joi.object({
    id: Joi.string().uuid().required()
        .messages({
            'string.base': 'Order ID must be a string',
            'string.guid': 'Order ID must be a valid UUID',
            'string.uuid': 'Order ID must be a valid UUID',
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
