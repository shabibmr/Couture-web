export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    // 1. AUTHENTICATION
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        ADMIN_LOGIN: '/auth/admin/login',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        SYNC: '/auth/firebase-sync',
        ME: '/auth/me',
        UPDATE_ME: '/auth/me',
        ADDRESSES: '/auth/addresses',
        ADDRESS_BY_ID: (id: string) => `/auth/addresses/${id}`,
    },

    // 2. PRODUCTS
    PRODUCTS: {
        LIST: '/products',
        SEARCH: '/products/search',
        CATEGORIES: '/products/categories',
        SIZES: '/products/sizes',
        BY_SLUG: (slug: string) => `/products/${slug}`,
        BY_ID: (id: string) => `/products/id/${id}`,
        REVIEWS: (productId: string) => `/products/${productId}/reviews`,
        CREATE_REVIEW: (productId: string) => `/products/${productId}/reviews`,
    },

    // 3. CART
    CART: {
        GET: '/cart',
        ADD_ITEM: '/cart/items',
        UPDATE_ITEM: (itemId: string) => `/cart/items/${itemId}`,
        REMOVE_ITEM: (itemId: string) => `/cart/items/${itemId}`,
    },

    // 4. WISHLIST
    WISHLIST: {
        GET: '/wishlist',
        ADD_ITEM: '/wishlist/items',
        REMOVE_ITEM: (itemId: string) => `/wishlist/items/${itemId}`,
        CLEAR: '/wishlist/clear',
    },

    // 5. ORDERS
    ORDERS: {
        LIST: '/orders',
        CREATE: '/orders',
        BY_ID: (orderId: string) => `/orders/${orderId}`,
        UPDATE_STATUS: (orderId: string) => `/orders/${orderId}/status`,
    },

    // 6. PAYMENT
    PAYMENT: {
        CREATE_ORDER: '/payment/create-order',
        VERIFY: '/payment/verify',
        WEBHOOK: '/payment/webhook',
        STATUS: (transactionId: string) => `/payment/status/${transactionId}`,
        REFUND: '/payment/refund',
        LIST: '/payment',
    },

    // 7. MARKETING - NEWSLETTER
    NEWSLETTER: '/marketing/newsletter/subscribe',

    // 8. MARKETING - COUPONS
    COUPONS: {
        VALIDATE: '/coupons/validate',
        LIST: '/coupons',
    },

    // 8. BANNERS
    BANNERS: '/banners',

    // 9. SETTINGS
    SETTINGS: '/settings',

    // 10. NOTIFICATIONS
    NOTIFICATIONS: {
        LIST: '/notifications',
        MARK_READ: (id: string) => `/notifications/${id}/read`,
        DELETE: (id: string) => `/notifications/${id}`,
    },
};

