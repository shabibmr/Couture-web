export const API_ENDPOINTS = {
    BANNERS: '/marketing/banners',
    AUTH: {
        SYNC: '/auth/firebase-sync',
        ME: '/auth/profile',
    },
    PRODUCTS: {
        LIST: '/products',
        SEARCH: '/products/search',
        CATEGORIES: '/products/categories',
        BY_SLUG: (slug: string) => `/products/${slug}`,
        REVIEWS: (id: string) => `/products/${id}/reviews`,
    },
    CART: '/cart',
    WISHLIST: '/wishlist',
    ORDERS: '/orders',
    MARKETING: {
        BANNERS: '/marketing/banners',
        COUPONS: '/marketing/coupons/validate',
        NEWSLETTER: '/marketing/newsletter/subscribe'
    },
    COUPONS: '/marketing/coupons/validate',
};
