/**
 * Constants for ShopContext
 */

// Default product variant size when none is specified
export const DEFAULT_SIZE = 'M';

// Default currency settings
export const DEFAULT_CURRENCY = {
    code: 'INR',
    symbol: '₹'
} as const;

// LocalStorage keys
export const STORAGE_KEYS = {
    GUEST_CART: 'guest_cart'
} as const;

// Minimum quantity for cart items
export const MIN_CART_QUANTITY = 1;
