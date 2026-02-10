/**
 * Helper functions for ShopContext operations
 * Extracted to improve testability and reduce complexity
 */

import { CartItem, Product, Order } from '../types';
import {
    BackendCartItem,
    BackendWishlistItem,
    BackendOrder,
    CartResponse,
    WishlistResponse,
    OrdersResponse,
    AddToCartRequest
} from '../types/apiResponses';
import { resolveProductPrice, normalizeProductImage } from '../utils/priceResolver';
import { DEFAULT_SIZE } from './shopConstants';
import api from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';
import logger from '../utils/logger';

/**
 * Maps backend cart item to frontend CartItem format
 */
export const mapBackendCartItem = (item: BackendCartItem): CartItem => {
    const product = item.ProductVariant?.Product || {};
    const price = resolveProductPrice(product as Product);

    return {
        ...product,
        id: product.id || 0,
        title: product.name || product.title || '',
        name: product.name || product.title || '',
        description: product.description || '',
        image: normalizeProductImage(product),
        price,
        quantity: item.quantity,
        selectedSize: item.ProductVariant?.Size?.name || item.size || DEFAULT_SIZE,
        variant_id: item.variant_id,
        cartItemId: item.id
    } as CartItem;
};

/**
 * Maps backend wishlist item to frontend Product format
 */
export const mapBackendWishlistItem = (item: BackendWishlistItem): Product & { wishlistItemId: number } => {
    const product = item.Product || {};

    return {
        ...product,
        image: normalizeProductImage(product),
        wishlistItemId: item.id
    } as Product & { wishlistItemId: number };
};

/**
 * Maps backend order to frontend Order format
 */
export const mapBackendOrder = (order: BackendOrder): Order => {
    return {
        id: order.order_number || `#${order.id}`,
        date: new Date(order.order_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }),
        total: order.total_amount,
        status: order.status,
        items: (order.items || []).map((item) => ({
            title: item.product_name || 'Product',
            price: item.unit_price,
            image: item.image || '',
            quantity: item.quantity
        }))
    };
};

/**
 * Fetches and maps cart from backend
 * @returns Mapped cart items or empty array on error
 */
export const fetchBackendCart = async (): Promise<CartItem[]> => {
    try {
        const response = await api.get<CartResponse>(API_ENDPOINTS.CART.GET);

        if (response.data?.items) {
            return response.data.items.map(mapBackendCartItem);
        }

        return [];
    } catch (error) {
        logger.error('Error fetching cart from backend', { error });
        throw error;
    }
};

/**
 * Fetches and maps wishlist from backend
 * @returns Mapped wishlist items or empty array on error
 */
export const fetchBackendWishlist = async (): Promise<Product[]> => {
    try {
        logger.debug('[Wishlist] Fetching wishlist from backend');
        const response = await api.get<WishlistResponse>(API_ENDPOINTS.WISHLIST.GET);

        if (response.data?.items) {
            const mapped = response.data.items.map(mapBackendWishlistItem);
            logger.info(`[Wishlist] Loaded ${mapped.length} items from backend`);
            return mapped;
        }

        logger.debug('[Wishlist] Wishlist empty or unexpected format');
        return [];
    } catch (error) {
        logger.error('[Wishlist] Error fetching wishlist', { error });
        throw error;
    }
};

/**
 * Fetches and maps orders from backend
 * @returns Mapped orders or empty array on error
 */
export const fetchBackendOrders = async (): Promise<Order[]> => {
    try {
        const response = await api.get<OrdersResponse>(API_ENDPOINTS.ORDERS.LIST);

        if (response.data?.data) {
            return response.data.data.map(mapBackendOrder);
        }

        return [];
    } catch (error) {
        logger.error('Error fetching orders from backend', { error });
        throw error;
    }
};

/**
 * Merges guest cart with backend cart
 * Syncs guest items to backend and returns merged cart
 */
export const mergeGuestCartWithBackend = async (
    guestCart: CartItem[],
    backendCart: CartItem[]
): Promise<CartItem[]> => {
    const backendCartMap = new Map(
        backendCart.map((item) => [item.id, item])
    );

    const mergedCart = [...backendCart];

    // Add guest cart items that don't exist in backend
    for (const guestItem of guestCart) {
        if (!backendCartMap.has(guestItem.id)) {
            mergedCart.push(guestItem);

            // Sync guest item to backend
            try {
                const request: AddToCartRequest = {
                    product_id: guestItem.id,
                    quantity: guestItem.quantity || 1,
                    size: guestItem.selectedSize || DEFAULT_SIZE,
                    variant_id: guestItem.variant_id
                };

                await api.post(API_ENDPOINTS.CART.ADD_ITEM, request);
            } catch (syncError) {
                logger.error('Error syncing guest cart item to backend', {
                    error: syncError,
                    productId: guestItem.id
                });
            }
        }
    }

    return mergedCart;
};

/**
 * Loads guest cart from localStorage
 */
export const loadGuestCartFromStorage = (storageKey: string): CartItem[] => {
    const savedCart = localStorage.getItem(storageKey);

    if (savedCart) {
        try {
            return JSON.parse(savedCart);
        } catch (error) {
            logger.error('Error parsing guest cart from localStorage', { error });
        }
    }

    return [];
};

/**
 * Saves guest cart to localStorage
 */
export const saveGuestCartToStorage = (cart: CartItem[], storageKey: string): void => {
    try {
        localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch (error) {
        logger.error('Error saving guest cart to localStorage', { error });
    }
};

/**
 * Prepares product for cart with resolved price
 */
export const prepareProductForCart = (product: Product): CartItem => {
    const resolvedPrice = resolveProductPrice(product);

    return {
        ...product,
        title: product.title || product.name || '',
        name: product.name || product.title || '',
        price: resolvedPrice,
        image: normalizeProductImage(product),
        quantity: 1,
        selectedSize: (product as any).selectedSize || DEFAULT_SIZE,
        variant_id: (product as any).variant_id
    } as CartItem;
};
