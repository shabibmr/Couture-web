import { getMinioUrl } from '../../../utils/minio-url.js';
import { BUCKETS } from '../../../config/minio.js';

/**
 * Transform product data to include full MinIO URLs
 * Converts object keys to full URLs for frontend consumption
 */
export const transformProductImages = (product) => {
    if (!product) return null;

    const productJson = product.toJSON ? product.toJSON() : product;

    // Transform featured_image
    if (productJson.featured_image) {
        productJson.featured_image = getMinioUrl(productJson.featured_image, BUCKETS.PRODUCTS);
    }

    // Transform additional images
    if (productJson.images && Array.isArray(productJson.images)) {
        productJson.images = productJson.images.map(img => ({
            ...img,
            image_url: getMinioUrl(img.image_url, BUCKETS.PRODUCTS)
        }));
    }

    // Transform variant images if present
    if (productJson.variants && Array.isArray(productJson.variants)) {
        productJson.variants = productJson.variants.map(variant => ({
            ...variant,
            variant_image: variant.variant_image
                ? getMinioUrl(variant.variant_image, BUCKETS.PRODUCTS)
                : null
        }));
    }

    return productJson;
};

/**
 * Transform multiple products
 * @param {Array} products - Array of product instances
 * @returns {Array} Transformed products
 */
export const transformProductsArray = (products) => {
    if (!Array.isArray(products)) return [];
    return products.map(transformProductImages);
};

/**
 * Generate slug from product name
 * @param {string} name - Product name
 * @param {string} fallback - Fallback value if name is empty
 * @returns {string} Generated slug
 */
export const generateProductSlug = (name, fallback = null) => {
    if (!name || typeof name !== 'string') {
        return fallback || `product-${Date.now()}`;
    }

    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

/**
 * Calculate product display price
 * @param {Object} product - Product object
 * @returns {number} Display price (sale price if available, otherwise base price)
 */
export const getProductDisplayPrice = (product) => {
    if (!product) return 0;
    return parseFloat(product.sale_price || product.base_price || 0);
};

/**
 * Check if product is on sale
 * @param {Object} product - Product object
 * @returns {boolean} True if product has a sale price
 */
export const isProductOnSale = (product) => {
    if (!product) return false;
    return product.sale_price && parseFloat(product.sale_price) < parseFloat(product.base_price);
};

/**
 * Calculate discount percentage
 * @param {Object} product - Product object
 * @returns {number} Discount percentage (0 if no discount)
 */
export const getDiscountPercentage = (product) => {
    if (!isProductOnSale(product)) return 0;

    const basePrice = parseFloat(product.base_price);
    const salePrice = parseFloat(product.sale_price);

    return Math.round(((basePrice - salePrice) / basePrice) * 100);
};
