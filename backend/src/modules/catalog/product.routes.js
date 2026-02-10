/**
 * Product Routes (Refactored)
 * Includes validation middleware for all endpoints
 */

import express from 'express';
import {
    getAllProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    getSizes,
    createCategory,
    updateCategory,
    deleteCategory,
    getProductReviews,
    createProductReview,
    addProductVariant,
    deleteProductVariant,
    getProductMetadata
} from './product.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
    createProductSchema,
    updateProductSchema,
    productQuerySchema,
    createCategorySchema,
    updateCategorySchema,
    createReviewSchema,
    addVariantSchema,
    uuidParamSchema,
    slugParamSchema
} from './validators/product.validator.js';

const router = express.Router();

// ==================== PRODUCT ROUTES ====================

// Search and list products (with validation)
router.get('/search', validate(productQuerySchema, 'query'), getAllProducts);
router.get('/', validate(productQuerySchema, 'query'), getAllProducts);

// Get product by ID (with validation)
router.get('/id/:id', validate(uuidParamSchema, 'params'), getProductById);

// ==================== CATEGORY ROUTES ====================

// Get all categories
router.get('/categories', getCategories);

// Create category (with validation)
router.post('/categories', validate(createCategorySchema), createCategory);

// Update category (with validation)
router.put(
    '/categories/:id',
    validate(uuidParamSchema, 'params'),
    validate(updateCategorySchema),
    updateCategory
);

// Delete category (with validation)
router.delete('/categories/:id', validate(uuidParamSchema, 'params'), deleteCategory);

// ==================== SIZE ROUTES ====================

// Get all sizes
router.get('/sizes', getSizes);

// ==================== METADATA ROUTES ====================

// Get product metadata for SEO
router.get('/metadata/:idOrSlug', getProductMetadata);

// ==================== SLUG ROUTE (MUST BE AFTER SPECIFIC ROUTES) ====================

// Get product by slug (with validation)
// IMPORTANT: This must come AFTER specific routes like /categories, /sizes, /metadata
// because Express matches routes in order
router.get('/:slug', validate(slugParamSchema, 'params'), getProductBySlug);

// Create product (with validation)
router.post('/', validate(createProductSchema), createProduct);

// Update product (with validation)
router.put('/:id', validate(uuidParamSchema, 'params'), validate(updateProductSchema), updateProduct);

// Delete product (with validation)
router.delete('/:id', validate(uuidParamSchema, 'params'), deleteProduct);

// ==================== VARIANT ROUTES ====================

// Add variant (with authentication and validation)
router.post(
    '/:id/variants',
    authenticate,
    validate(uuidParamSchema, 'params'),
    validate(addVariantSchema),
    addProductVariant
);

// Delete variant (with authentication and validation)
router.delete(
    '/:id/variants/:variantId',
    authenticate,
    validate(uuidParamSchema, 'params'),
    deleteProductVariant
);

// ==================== REVIEW ROUTES ====================

// Get product reviews
router.get('/:productId/reviews', getProductReviews);

// Create product review (with authentication and validation)
router.post(
    '/:productId/reviews',
    authenticate,
    validate(createReviewSchema),
    createProductReview
);

export default router;
