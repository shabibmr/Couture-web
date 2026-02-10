/**
 * Product Controller (Refactored)
 * Handles HTTP requests and delegates business logic to services
 * This is a clean, maintainable controller following best practices
 */

import productService from './services/product.service.js';
import categoryService from './services/category.service.js';
import reviewService from './services/review.service.js';
import sizeService from './services/size.service.js';
import { transformProductImages, transformProductsArray } from './utils/product-transformer.util.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants/product.constants.js';

/**
 * Get all products with filters and pagination
 * GET /api/products
 */
export const getAllProducts = async (req, res) => {
    try {
        const result = await productService.getProducts(req.query);

        // Transform products to include full MinIO URLs
        const transformedProducts = transformProductsArray(result.rows);

        res.json({
            total: result.count,
            pages: result.pages,
            currentPage: result.currentPage,
            data: transformedProducts
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get product by ID
 * GET /api/products/id/:id
 */
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productService.getProductById(id);

        if (!product) {
            return res.status(404).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
        }

        res.json(transformProductImages(product));
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get product by slug
 * GET /api/products/:slug
 */
export const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await productService.getProductBySlug(slug, { activeOnly: true });

        if (!product) {
            return res.status(404).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
        }

        res.json(transformProductImages(product));
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Create a new product
 * POST /api/products
 */
export const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);

        res.status(201).json(transformProductImages(product));
    } catch (error) {
        console.error('Error creating product:', error);

        // Handle specific errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                message: 'A product with this slug already exists',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update an existing product
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productService.updateProduct(id, req.body);

        res.json(transformProductImages(product));
    } catch (error) {
        console.error('Error updating product:', error);

        if (error.message === 'Product not found') {
            return res.status(404).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                message: 'A product with this slug already exists',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete a product
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await productService.deleteProduct(id);

        res.json({ message: SUCCESS_MESSAGES.PRODUCT_DELETED });
    } catch (error) {
        console.error('Error deleting product:', error);

        if (error.message === 'Product not found') {
            return res.status(404).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
        }

        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Add a variant to a product
 * POST /api/products/:id/variants
 */
export const addProductVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const variant = await productService.addProductVariant(id, req.body);

        res.status(201).json(variant);
    } catch (error) {
        console.error('Error adding variant:', error);

        if (error.message === 'SKU already exists') {
            return res.status(400).json({ message: ERROR_MESSAGES.SKU_EXISTS });
        }

        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete a product variant
 * DELETE /api/products/:id/variants/:variantId
 */
export const deleteProductVariant = async (req, res) => {
    try {
        const { id, variantId } = req.params;
        await productService.deleteProductVariant(id, variantId);

        res.json({ message: SUCCESS_MESSAGES.VARIANT_DELETED });
    } catch (error) {
        console.error('Error deleting variant:', error);

        if (error.message === 'Variant not found') {
            return res.status(404).json({ message: ERROR_MESSAGES.VARIANT_NOT_FOUND });
        }

        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== CATEGORY ENDPOINTS ====================

/**
 * Get all categories
 * GET /api/products/categories
 */
export const getCategories = async (req, res) => {
    try {
        const categories = await categoryService.getCategories();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Create a new category
 * POST /api/products/categories
 */
export const createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                message: 'A category with this slug already exists',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update a category
 * PUT /api/products/categories/:id
 */
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryService.updateCategory(id, req.body);

        res.json(category);
    } catch (error) {
        console.error('Error updating category:', error);

        if (error.message === 'Category not found') {
            return res.status(404).json({ message: ERROR_MESSAGES.CATEGORY_NOT_FOUND });
        }

        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete a category
 * DELETE /api/products/categories/:id
 */
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await categoryService.deleteCategory(id);

        res.json({ message: SUCCESS_MESSAGES.CATEGORY_DELETED });
    } catch (error) {
        console.error('Error deleting category:', error);

        if (error.message === 'Category not found') {
            return res.status(404).json({ message: ERROR_MESSAGES.CATEGORY_NOT_FOUND });
        }

        // Handle specific error messages from service
        if (error.message.includes('Cannot delete category')) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== SIZE ENDPOINTS ====================

/**
 * Get all sizes
 * GET /api/products/sizes
 */
export const getSizes = async (req, res) => {
    try {
        const sizes = await sizeService.getSizes();
        res.json(sizes);
    } catch (error) {
        console.error('Error fetching sizes:', error);
        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== REVIEW ENDPOINTS ====================

/**
 * Get product reviews
 * GET /api/products/:productId/reviews
 */
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await reviewService.getProductReviews(productId);

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Create a product review
 * POST /api/products/:productId/reviews
 */
export const createProductReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const customerId = req.user.id;

        const review = await reviewService.createReview(productId, customerId, req.body);

        res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error);

        if (error.message === 'You have already reviewed this product') {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({
            message: ERROR_MESSAGES.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== METADATA ENDPOINT ====================

/**
 * Get product metadata for SEO/social sharing
 * GET /api/products/metadata/:idOrSlug
 */
export const getProductMetadata = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        const product = await productService.getProductForMetadata(idOrSlug);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        const productJson = transformProductImages(product);
        const imageUrl = productJson.featured_image ||
            (productJson.images && productJson.images.length > 0 ? productJson.images[0].image_url : '');

        const title = product.name || product.title;
        const description = product.description || '';
        const price = product.sale_price || product.base_price || product.price;
        const productUrl = `https://ruveracouture.com/product/${product.slug || product.id}`;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Ruvera Couture</title>

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="product">
    <meta property="og:url" content="${productUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description.substring(0, 200)}...">
    <meta property="og:image" content="${imageUrl}">
    <meta property="product:price:amount" content="${price}">
    <meta property="product:price:currency" content="INR">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${productUrl}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description.substring(0, 200)}...">
    <meta property="twitter:image" content="${imageUrl}">
</head>
<body>
    <h1>${title}</h1>
    <img src="${imageUrl}" alt="${title}" style="max-width: 100%;">
    <p>${description}</p>
    <p>Price: ₹${price}</p>
    <script>window.location.href = "${productUrl}";</script>
</body>
</html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error fetching product metadata:', error);
        res.status(500).send('Server error');
    }
};
