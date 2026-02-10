import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Validation middleware factory
 * Validates request body, params, or query against a Joi schema
 */
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'params' | 'query' = 'body') => {
    return (req: Request, res: Response, next: NextFunction): void | Response => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                message: 'Validation failed',
                errors
            });
        }

        // Replace request data with validated and sanitized data
        // Note: req.query is read-only, so we need to use Object.defineProperty
        if (property === 'query') {
            Object.defineProperty(req, 'query', {
                value,
                writable: true,
                enumerable: true,
                configurable: true
            });
        } else {
            req[property] = value;
        }
        next();
    };
};
