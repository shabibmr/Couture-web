/**
 * Order Transformer Utilities
 * Transform order data for API responses
 */

import { getMinioUrl } from '../../../utils/minio-url.js';
import { BUCKETS } from '../../../config/minio.js';

/**
 * Transform order items to include full MinIO image URLs
 * @param {Object} order - Order object (can be plain object or Sequelize model)
 * @returns {Object} Order with transformed image URLs
 */
export const transformOrderImages = (order) => {
    // Convert to plain object if it's a Sequelize model
    const orderJson = order.toJSON ? order.toJSON() : order;

    // Transform order items to include image URLs
    if (orderJson.items && Array.isArray(orderJson.items)) {
        orderJson.items = orderJson.items.map(item => transformOrderItemImage(item));
    }

    return orderJson;
};

/**
 * Transform a single order item to include image URL
 * @param {Object} item - Order item object
 * @returns {Object} Order item with transformed image
 */
export const transformOrderItemImage = (item) => {
    const product = item.ProductVariant?.Product || {};

    // Determine image source (priority: variant_image > product.image > product.featured_image)
    let imageKey = item.ProductVariant?.variant_image ||
                   product.image ||
                   product.featured_image ||
                   '';

    // Transform to full MinIO URL
    const imageUrl = imageKey ? getMinioUrl(imageKey, BUCKETS.PRODUCTS) : '';

    return {
        ...item,
        image: imageUrl
    };
};

/**
 * Transform array of orders with image URLs
 * @param {Array} orders - Array of order objects
 * @returns {Array} Orders with transformed images
 */
export const transformOrdersArray = (orders) => {
    return orders.map(order => transformOrderImages(order));
};

/**
 * Generate order number with prefix and timestamp
 * @param {string} prefix - Order number prefix (default: 'ORD')
 * @returns {string} Generated order number
 */
export const generateOrderNumber = (prefix = 'ORD') => {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${randomSuffix}`;
};

/**
 * Parse address (can be string or object)
 * @param {string|Object} address - Address data
 * @returns {Object} Parsed address object
 */
export const parseAddress = (address) => {
    if (typeof address === 'string') {
        try {
            return JSON.parse(address);
        } catch {
            return { raw: address };
        }
    }
    return address;
};

/**
 * Format address for storage (ensure it's a string)
 * @param {string|Object} address - Address data
 * @returns {string} Stringified address
 */
export const formatAddressForStorage = (address) => {
    if (typeof address === 'string') {
        return address;
    }
    return JSON.stringify(address);
};

/**
 * Parse coupon codes (can be string or array)
 * @param {string|Array} couponCodes - Coupon code(s)
 * @returns {Array} Array of coupon codes
 */
export const parseCouponCodes = (couponCodes) => {
    if (!couponCodes) return [];

    if (Array.isArray(couponCodes)) {
        return couponCodes;
    }

    if (typeof couponCodes === 'string') {
        try {
            const parsed = JSON.parse(couponCodes);
            return Array.isArray(parsed) ? parsed : [couponCodes];
        } catch {
            return [couponCodes];
        }
    }

    return [];
};

/**
 * Calculate order summary statistics
 * @param {Object} order - Order object with items
 * @returns {Object} Order summary
 */
export const calculateOrderSummary = (order) => {
    const items = order.items || [];

    return {
        totalItems: items.length,
        totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
        subtotal: order.subtotal || 0,
        shipping: order.shipping_amount || 0,
        tax: order.tax_amount || 0,
        discount: order.discount_amount || 0,
        total: order.total_amount || 0,
        savings: (order.discount_amount || 0) + (order.subtotal >= order.free_shipping_threshold ? order.shipping_amount : 0)
    };
};
