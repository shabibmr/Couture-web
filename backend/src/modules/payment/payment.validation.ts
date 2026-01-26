import Joi from 'joi';

/**
 * Payment validation schemas
 */

export const createRazorpayOrderSchema = Joi.object({
    order_id: Joi.number().integer().positive().required()
        .messages({
            'number.base': 'Order ID must be a number',
            'number.integer': 'Order ID must be an integer',
            'number.positive': 'Order ID must be positive',
            'any.required': 'Order ID is required'
        })
});

export const verifyPaymentSchema = Joi.object({
    razorpay_order_id: Joi.string().required()
        .messages({
            'string.empty': 'Razorpay order ID is required',
            'any.required': 'Razorpay order ID is required'
        }),
    razorpay_payment_id: Joi.string().required()
        .messages({
            'string.empty': 'Razorpay payment ID is required',
            'any.required': 'Razorpay payment ID is required'
        }),
    razorpay_signature: Joi.string().required()
        .messages({
            'string.empty': 'Razorpay signature is required',
            'any.required': 'Razorpay signature is required'
        })
});

export const createRefundSchema = Joi.object({
    transaction_id: Joi.number().integer().positive().required()
        .messages({
            'number.base': 'Transaction ID must be a number',
            'number.integer': 'Transaction ID must be an integer',
            'number.positive': 'Transaction ID must be positive',
            'any.required': 'Transaction ID is required'
        }),
    amount: Joi.number().positive().required()
        .messages({
            'number.base': 'Amount must be a number',
            'number.positive': 'Amount must be positive',
            'any.required': 'Amount is required'
        }),
    reason: Joi.string().max(500).optional()
        .messages({
            'string.max': 'Reason cannot exceed 500 characters'
        })
});

export const getPaymentStatusSchema = Joi.object({
    transaction_id: Joi.number().integer().positive().required()
        .messages({
            'number.base': 'Transaction ID must be a number',
            'number.integer': 'Transaction ID must be an integer',
            'number.positive': 'Transaction ID must be positive',
            'any.required': 'Transaction ID is required'
        })
});
