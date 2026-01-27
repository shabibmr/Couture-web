import Joi from 'joi';

/**
 * Cart validation schemas
 */

export const addToCartSchema = Joi.object({
    variant_id: Joi.string().uuid().optional()
        .messages({
            'string.base': 'Variant ID must be a string',
            'string.guid': 'Variant ID must be a valid UUID',
            'string.uuid': 'Variant ID must be a valid UUID'
        }),
    product_id: Joi.string().uuid().optional()
        .messages({
            'string.base': 'Product ID must be a string',
            'string.guid': 'Product ID must be a valid UUID',
            'string.uuid': 'Product ID must be a valid UUID'
        }),
    size: Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL').optional()
        .messages({
            'string.base': 'Size must be a string',
            'any.only': 'Size must be one of: XS, S, M, L, XL, XXL, XXXL'
        }),
    quantity: Joi.number().integer().positive().min(1).max(99).required()
        .messages({
            'number.base': 'Quantity must be a number',
            'number.integer': 'Quantity must be an integer',
            'number.positive': 'Quantity must be positive',
            'number.min': 'Quantity must be at least 1',
            'number.max': 'Quantity cannot exceed 99',
            'any.required': 'Quantity is required'
        })
}).custom((value, helpers) => {
    // Must have either variant_id OR (product_id + size)
    if (!value.variant_id && !(value.product_id && value.size)) {
        return helpers.error('any.custom', {
            message: 'Either variant_id or both product_id and size must be provided'
        });
    }
    return value;
});

export const updateCartItemSchema = Joi.object({
    quantity: Joi.number().integer().min(0).max(99).required()
        .messages({
            'number.base': 'Quantity must be a number',
            'number.integer': 'Quantity must be an integer',
            'number.min': 'Quantity must be at least 0',
            'number.max': 'Quantity cannot exceed 99',
            'any.required': 'Quantity is required'
        })
});

export const cartItemIdSchema = Joi.object({
    id: Joi.string().uuid().required()
        .messages({
            'string.base': 'Item ID must be a string',
            'string.guid': 'Item ID must be a valid UUID',
            'string.uuid': 'Item ID must be a valid UUID',
            'any.required': 'Item ID is required'
        })
});
