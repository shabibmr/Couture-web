/**
 * Order Module Constants
 * Centralized configuration for order management
 */

// Order Status Values
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
};

// Valid status transitions (state machine)
export const ORDER_STATUS_TRANSITIONS = {
    pending: ['confirmed', 'processing', 'cancelled'],
    confirmed: ['processing', 'shipped', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'refunded'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: []
};

// Payment Methods
export const PAYMENT_METHODS = {
    COD: 'cod',
    RAZORPAY: 'razorpay',
    STRIPE: 'stripe',
    PAYPAL: 'paypal'
};

// Order Number Generation
export const ORDER_NUMBER_PREFIX = 'ORD';

// Pagination Defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};

// Inventory Operations
export const INVENTORY_OPERATIONS = {
    RESERVE: 'reserve',      // Reserve stock (order created)
    RELEASE: 'release',      // Release reserved stock (order cancelled)
    FINALIZE: 'finalize'     // Finalize stock (order shipped - deduct from quantity)
};

// Error Messages
export const ERROR_MESSAGES = {
    ORDER_NOT_FOUND: 'Order not found',
    NO_ITEMS: 'No items in order or cart',
    INSUFFICIENT_STOCK: 'Insufficient stock available',
    INVALID_STATUS_TRANSITION: 'Invalid order status transition',
    INVALID_COUPON: 'Invalid or expired coupon',
    SERVER_ERROR: 'Server error',
    VARIANT_NOT_FOUND: 'Product variant not found',
    INVENTORY_NOT_FOUND: 'Inventory not found',
    UNAUTHORIZED: 'Unauthorized to access this order'
};

// Success Messages
export const SUCCESS_MESSAGES = {
    ORDER_CREATED: 'Order created successfully',
    ORDER_UPDATED: 'Order updated successfully',
    ORDER_DELETED: 'Order deleted successfully',
    STATUS_UPDATED: 'Order status updated successfully'
};

// Settings Keys
export const SETTINGS_KEYS = {
    SHIPPING_FEE: 'shipping_fee',
    FREE_SHIPPING_THRESHOLD: 'free_shipping_threshold',
    TAX_RATE: 'tax_rate'
};

// Order Item Limits
export const ORDER_LIMITS = {
    MAX_ITEMS_PER_ORDER: 50,
    MAX_QUANTITY_PER_ITEM: 100,
    MIN_QUANTITY_PER_ITEM: 1
};

// Currency
export const DEFAULT_CURRENCY = 'INR';

// Shipping
export const SHIPPING_DEFAULTS = {
    BASE_FEE: 0,
    FREE_THRESHOLD: 0
};
