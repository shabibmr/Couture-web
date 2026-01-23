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
    deleteProductVariant
} from './product.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/sizes', getSizes);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/id/:id', getProductById);
router.get('/:slug', getProductBySlug);
router.post('/', createProduct);
router.put('/:id', updateProduct);
// Variant routes
router.post('/:id/variants', authenticate, addProductVariant);
router.delete('/:id/variants/:variantId', authenticate, deleteProductVariant);

router.delete('/:id', deleteProduct);

router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', authenticate, createProductReview);

export default router;
