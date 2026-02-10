/**
 * Product Module Constants
 * Centralized configuration values for product management
 */

// Default inventory values
export const DEFAULT_INVENTORY = {
    QUANTITY: 1,
    RESERVED_QUANTITY: 0,
    LOW_STOCK_THRESHOLD: 10
};

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
};

// Product status values
export const PRODUCT_STATUS = {
    ALL: 'all',
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

// Coupon limits
export const COUPON_LIMITS = {
    MAX_COUPONS: 3
};

// Image limits
export const IMAGE_LIMITS = {
    MAX_ADDITIONAL_IMAGES: 10
};

// Query attributes
export const PRODUCT_ATTRIBUTES = {
    LIST: [
        'id', 'name', 'slug', 'description', 'base_price', 'sale_price',
        'featured_image', 'is_active', 'is_featured', 'is_new_arrival',
        'sort_order', 'view_count', 'category_id', 'brand_id', 'created_at'
    ],
    DETAIL: [
        'id', 'name', 'slug', 'description', 'base_price', 'sale_price',
        'featured_image', 'is_active', 'is_featured', 'is_new_arrival',
        'sort_order', 'view_count', 'category_id', 'brand_id', 'created_at', 'updated_at'
    ]
};

// Error messages
export const ERROR_MESSAGES = {
    PRODUCT_NOT_FOUND: 'Product not found',
    CATEGORY_NOT_FOUND: 'Category not found',
    CATEGORY_HAS_PRODUCTS: 'Cannot delete category. It has associated products.',
    CATEGORY_HAS_CHILDREN: 'Cannot delete category. It has sub-categories.',
    VARIANT_NOT_FOUND: 'Variant not found',
    SKU_EXISTS: 'SKU already exists',
    SERVER_ERROR: 'Server error',
    VALIDATION_ERROR: 'Validation failed',
    INVALID_COUPON: 'Invalid or expired coupon'
};

// Success messages
export const SUCCESS_MESSAGES = {
    PRODUCT_DELETED: 'Product deleted successfully',
    CATEGORY_DELETED: 'Category deleted successfully',
    VARIANT_DELETED: 'Variant and stock deleted successfully',
    REVIEW_CREATED: 'Review created successfully'
};
