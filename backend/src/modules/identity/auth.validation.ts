import Joi from 'joi';

/**
 * Authentication validation schemas
 */

export const registerSchema = Joi.object({
    email: Joi.string().email().required()
        .messages({
            'string.email': 'Invalid email format',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),
    password: Joi.string().min(8).max(100).required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password cannot exceed 100 characters',
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        }),
    first_name: Joi.string().max(50).required()
        .messages({
            'string.max': 'First name cannot exceed 50 characters',
            'string.empty': 'First name is required',
            'any.required': 'First name is required'
        }),
    last_name: Joi.string().max(50).required()
        .messages({
            'string.max': 'Last name cannot exceed 50 characters',
            'string.empty': 'Last name is required',
            'any.required': 'Last name is required'
        }),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional()
        .messages({
            'string.pattern.base': 'Invalid Indian phone number format (must be 10 digits starting with 6-9)'
        })
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required()
        .messages({
            'string.email': 'Invalid email format',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),
    password: Joi.string().required()
        .messages({
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        })
});

export const syncFirebaseUserSchema = Joi.object({
    idToken: Joi.string().required()
        .messages({
            'string.empty': 'Firebase ID token is required',
            'any.required': 'Firebase ID token is required'
        })
});

export const requestPasswordResetSchema = Joi.object({
    email: Joi.string().email().required()
        .messages({
            'string.email': 'Invalid email format',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        })
});

export const resetPasswordSchema = Joi.object({
    token: Joi.string().required()
        .messages({
            'string.empty': 'Reset token is required',
            'any.required': 'Reset token is required'
        }),
    new_password: Joi.string().min(8).max(100).required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password cannot exceed 100 characters',
            'string.empty': 'New password is required',
            'any.required': 'New password is required'
        })
});
