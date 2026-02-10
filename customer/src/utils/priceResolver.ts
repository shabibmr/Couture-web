/**
 * Price Resolution Utilities
 * Handles complex price resolution logic for products with multiple price fields
 */

import { Product } from '../types';

/**
 * Safely converts a value to a number
 * @param val - Value to convert (can be number, string, or other)
 * @returns Parsed number or null if conversion fails
 */
export const parseNumericValue = (val: any): number | null => {
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val === 'string' && val.trim() !== '') {
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) return parsed;
    }
    return null;
};

/**
 * Resolves the best price for a product
 * Priority: sale_price > base_price > price
 * 
 * @param product - Product object with price fields
 * @returns Resolved numeric price
 */
export const resolveProductPrice = (product: Product): number => {
    const salePrice = parseNumericValue(product.sale_price);
    const basePrice = parseNumericValue(product.base_price);
    const normalPrice = parseNumericValue(product.price);

    // Priority: sale_price > base_price > price
    if (salePrice !== null && salePrice > 0) {
        return salePrice;
    }

    if (basePrice !== null && basePrice > 0) {
        return basePrice;
    }

    if (normalPrice !== null && normalPrice > 0) {
        return normalPrice;
    }

    // Fallback: Try to parse formatted price strings like "₹1,499.00"
    if (typeof product.price === 'string') {
        const cleanedPrice = product.price.replace(/[^0-9.]/g, '');
        const parsed = parseFloat(cleanedPrice);
        if (!isNaN(parsed) && parsed > 0) {
            return parsed;
        }
    }

    // Last resort: return 0 if no valid price found
    return 0;
};

/**
 * Normalizes product image field
 * Ensures consistent 'image' field from various backend response formats
 */
export const normalizeProductImage = (product: any): string => {
    return product.image || product.featured_image || '';
};
