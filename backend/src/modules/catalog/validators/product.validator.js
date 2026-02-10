import Joi from 'joi';

/**
 * Validation schema for creating a product
 */
export const createProductSchema = Joi.object({
    name: Joi.string().required().min(3).max(255).trim()
        .messages({
            'string.empty': 'Product name is required',
            'string.min': 'Product name must be at least 3 characters',
            'string.max': 'Product name must not exceed 255 characters'
        }),

    category_id: Joi.string().uuid().required()
        .messages({
            'string.empty': 'Category is required',
            'string.guid': 'Invalid category ID format'
        }),

    brand_id: Joi.string().uuid().optional().allow(null),

    code: Joi.string().optional().max(50).trim(),

    base_price: Joi.number().positive().required()
        .messages({
            'number.base': 'Base price must be a number',
            'number.positive': 'Base price must be greater than 0'
        }),

    sale_price: Joi.number().positive().less(Joi.ref('base_price')).optional().allow(null)
        .messages({
            'number.less': 'Sale price must be less than base price'
        }),

    description: Joi.string().optional().allow('').max(5000),

    mainImage: Joi.string().optional().allow(null, ''),

    additionalImages: Joi.array()
        .items(Joi.string().allow(''))
        .max(10)
        .optional()
        .messages({
            'array.max': 'Maximum 10 additional images allowed'
        }),

    sizes: Joi.array().items(Joi.string()).optional(),

    is_active: Joi.boolean().default(true),

    is_featured: Joi.boolean().default(false),

    is_new_arrival: Joi.boolean().default(false),

    sort_order: Joi.number().integer().min(0).default(0)
});

/**
 * Validation schema for updating a product
 * Same as create but all fields are optional
 */
export const updateProductSchema = Joi.object({
    name: Joi.string().optional().min(3).max(255).trim(),
    category_id: Joi.string().uuid().optional(),
    brand_id: Joi.string().uuid().optional().allow(null),
    code: Joi.string().optional().max(50).trim(),
    base_price: Joi.number().positive().optional(),
    sale_price: Joi.number().positive().optional().allow(null),
    description: Joi.string().optional().allow('').max(5000),
    mainImage: Joi.string().optional().allow(null, ''),
    additionalImages: Joi.array().items(Joi.string().allow('')).max(10).optional(),
    sizes: Joi.array().items(Joi.string()).optional(),
    is_active: Joi.boolean().optional(),
    is_featured: Joi.boolean().optional(),
    is_new_arrival: Joi.boolean().optional(),
    sort_order: Joi.number().integer().min(0).optional()
});

/**
 * Validation schema for product query parameters
 */
export const productQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    category_slug: Joi.string().optional(),
    brand_slug: Joi.string().optional(),
    search: Joi.string().optional().allow('').max(255),
    q: Joi.string().optional().allow('').max(255),
    status: Joi.string().valid('all', 'active', 'inactive').default('active'),
    is_featured: Joi.alternatives().try(
        Joi.boolean(),
        Joi.string().valid('true', 'false')
    ).optional(),
    is_new_arrival: Joi.alternatives().try(
        Joi.boolean(),
        Joi.string().valid('true', 'false')
    ).optional(),
    orderBy: Joi.string().valid('name', 'base_price', 'created_at', 'sort_order').optional(),
    orderDirection: Joi.string().valid('ASC', 'DESC').optional()
});

/**
 * Validation schema for creating a category
 */
export const createCategorySchema = Joi.object({
    name: Joi.string().required().min(2).max(100).trim()
        .messages({
            'string.empty': 'Category name is required',
            'string.min': 'Category name must be at least 2 characters'
        }),

    slug: Joi.string().optional().pattern(/^[a-z0-9-]+$/)
        .messages({
            'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens'
        }),

    description: Joi.string().optional().allow('').max(1000),

    status: Joi.string().valid('Active', 'Inactive').default('Active'),

    parent_id: Joi.string().uuid().optional().allow(null),

    sort_order: Joi.number().integer().min(0).default(0)
});

/**
 * Validation schema for updating a category
 */
export const updateCategorySchema = Joi.object({
    name: Joi.string().optional().min(2).max(100).trim(),
    slug: Joi.string().optional().pattern(/^[a-z0-9-]+$/),
    description: Joi.string().optional().allow('').max(1000),
    status: Joi.string().valid('Active', 'Inactive').optional(),
    parent_id: Joi.string().uuid().optional().allow(null),
    sort_order: Joi.number().integer().min(0).optional()
});

/**
 * Validation schema for creating a product review
 */
export const createReviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required()
        .messages({
            'number.min': 'Rating must be between 1 and 5',
            'number.max': 'Rating must be between 1 and 5'
        }),

    title: Joi.string().optional().max(200).trim(),

    comment: Joi.string().required().min(10).max(2000).trim()
        .messages({
            'string.empty': 'Review comment is required',
            'string.min': 'Review must be at least 10 characters'
        })
});

/**
 * Validation schema for adding a product variant
 */
export const addVariantSchema = Joi.object({
    sku: Joi.string().required().max(100).trim()
        .messages({
            'string.empty': 'SKU is required'
        }),

    size_id: Joi.string().uuid().optional().allow(null),

    color_id: Joi.string().uuid().optional().allow(null),

    variant_price: Joi.number().positive().required()
        .messages({
            'number.positive': 'Variant price must be greater than 0'
        }),

    variant_image: Joi.string().optional().allow(null, '')
});

/**
 * Validation schema for UUID parameters
 */
export const uuidParamSchema = Joi.object({
    id: Joi.string().uuid().required()
        .messages({
            'string.guid': 'Invalid ID format'
        })
});

/**
 * Validation schema for slug parameters
 */
export const slugParamSchema = Joi.object({
    slug: Joi.string().required().pattern(/^[a-z0-9-&]+$/)
        .messages({
            'string.pattern.base': 'Invalid slug format'
        })
});
