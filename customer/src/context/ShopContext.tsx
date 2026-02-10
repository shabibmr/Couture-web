import React, { createContext, useState, useContext, useEffect, useRef, ReactNode, useCallback } from 'react';
import { Product, CartItem, Order, ShopContextType, Currency } from '../types';
import { AddToCartRequest, UpdateCartItemRequest, SettingsResponse, AddToCartResponse } from '../types/apiResponses';
import { API_ENDPOINTS } from '../config/api.config';
import { useAuth } from './AuthContext';
import api from '../services/api.service';
import logger from '../utils/logger';
import logRocketService from '../utils/logrocketService';
import firebaseAnalytics from '../utils/firebaseAnalytics';
import { resolveProductPrice, normalizeProductImage } from '../utils/priceResolver';
import { DEFAULT_SIZE, DEFAULT_CURRENCY, STORAGE_KEYS, MIN_CART_QUANTITY } from './shopConstants';
import {
    fetchBackendCart,
    fetchBackendWishlist,
    fetchBackendOrders,
    mergeGuestCartWithBackend,
    loadGuestCartFromStorage,
    saveGuestCartToStorage,
    prepareProductForCart
} from './shopHelpers';

const ShopContext = createContext<ShopContextType | undefined>(undefined);

interface ShopProviderProps {
    children: ReactNode;
}

export const ShopProvider: React.FC<ShopProviderProps> = ({ children }) => {
    const { user } = useAuth();

    // Initialize cart from localStorage for guests
    const [cart, setCart] = useState<CartItem[]>(() => {
        if (!user) {
            return loadGuestCartFromStorage(STORAGE_KEYS.GUEST_CART);
        }
        return [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);

    // Ref to track if cart has been merged with backend
    const cartMergedRef = useRef(false);
    // Ref to prevent concurrent merge operations (race condition fix)
    const mergeInProgressRef = useRef(false);

    // Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const endpoint = API_ENDPOINTS.SETTINGS || '/settings';
                const res = await api.get<SettingsResponse>(endpoint);

                if (res.data) {
                    setCurrency({
                        code: res.data.site_currency_code || DEFAULT_CURRENCY.code,
                        symbol: res.data.site_currency_symbol || DEFAULT_CURRENCY.symbol
                    });
                }
            } catch (error) {
                logger.error('Error fetching settings', { error });
                // Keep default currency on error
            }
        };
        fetchSettings();
    }, []);

    // Sync Cart and Wishlist on login
    useEffect(() => {
        const syncUserData = async () => {
            // Check both merge completion AND in-progress status to prevent race conditions
            if (user?.backendToken && !cartMergedRef.current && !mergeInProgressRef.current) {
                mergeInProgressRef.current = true;
                setIsLoading(true);
                setError(null);

                // Capture guest cart from localStorage (most up-to-date)
                const guestCart = loadGuestCartFromStorage(STORAGE_KEYS.GUEST_CART);

                try {
                    // Fetch and merge cart
                    try {
                        const backendCart = await fetchBackendCart();
                        const mergedCart = await mergeGuestCartWithBackend(guestCart, backendCart);

                        setCart(mergedCart);

                        // Log cart merge
                        logRocketService.logStateChange({
                            context: 'ShopContext',
                            action: 'cart_merged',
                            newValue: {
                                itemCount: mergedCart.length,
                                guestItemCount: guestCart.length
                            },
                        });

                        // Clear guest cart from localStorage after successful merge
                        localStorage.removeItem(STORAGE_KEYS.GUEST_CART);
                        cartMergedRef.current = true;
                    } catch (error) {
                        logger.error('Error fetching/merging cart', { error });
                        setError('Failed to load cart');
                    }

                    // Fetch wishlist
                    try {
                        const wishlistItems = await fetchBackendWishlist();
                        setWishlist(wishlistItems);
                    } catch (error) {
                        // Error already logged in helper
                        setError('Failed to load wishlist');
                    }

                    // Fetch orders
                    try {
                        const ordersList = await fetchBackendOrders();
                        setOrders(ordersList);
                    } catch (error) {
                        // Error already logged in helper
                        setError('Failed to load orders');
                    }

                } catch (error) {
                    logger.error('Error syncing user shop data', { error });
                    setError('Failed to load user data');
                } finally {
                    setIsLoading(false);
                    mergeInProgressRef.current = false;
                }
            } else if (!user?.backendToken) {
                // On logout: preserve current cart for guest usage
                const currentCart = cart.length > 0 ? cart : [];

                // Remove backend-specific fields
                const guestCart = currentCart.map(item => {
                    const { cartItemId, ...guestItem } = item;
                    return guestItem;
                }) as CartItem[];

                // Save to localStorage for guest session
                if (guestCart.length > 0) {
                    saveGuestCartToStorage(guestCart, STORAGE_KEYS.GUEST_CART);
                    setCart(guestCart);
                } else {
                    setCart([]);
                    localStorage.removeItem(STORAGE_KEYS.GUEST_CART);
                }

                // Reset merge refs and clear backend-specific data
                cartMergedRef.current = false;
                mergeInProgressRef.current = false;
                setWishlist([]);
                setOrders([]);
            }
        };

        syncUserData();
    }, [user?.backendToken]);

    // Save guest cart to localStorage whenever it changes (for guests only)
    useEffect(() => {
        if (!user?.backendToken && cart.length > 0) {
            saveGuestCartToStorage(cart, STORAGE_KEYS.GUEST_CART);
        }
    }, [cart, user?.backendToken]);

    const addToCart = async (product: Product) => {
        const cartItem = prepareProductForCart(product);
        const resolvedPrice = cartItem.price;

        logger.info('Action: Add to Cart', {
            productId: product.id,
            name: product.name,
            price: resolvedPrice
        });

        // Firebase Analytics
        firebaseAnalytics.logAddToCart(
            String(product.id),
            product.name,
            currency.code,
            resolvedPrice
        );

        if (user?.backendToken) {
            // Authenticated user: sync with backend
            try {
                const request: AddToCartRequest = {
                    product_id: product.id,
                    quantity: 1,
                    size: cartItem.selectedSize,
                    variant_id: cartItem.variant_id
                };

                const response = await api.post<AddToCartResponse>(
                    API_ENDPOINTS.CART.ADD_ITEM,
                    request
                );

                const newCartItemId = response.data?.item?.id;

                // Update cart state
                const updatedCart = [...cart];
                const existingIndex = updatedCart.findIndex(item => item.id === product.id);

                if (existingIndex > -1) {
                    updatedCart[existingIndex].quantity += 1;
                    if (!updatedCart[existingIndex].cartItemId && newCartItemId) {
                        updatedCart[existingIndex].cartItemId = newCartItemId;
                    }
                } else {
                    updatedCart.push({ ...cartItem, cartItemId: newCartItemId });
                }

                setCart(updatedCart);

                logRocketService.logStateChange({
                    context: 'ShopContext',
                    action: 'item_added_to_cart',
                    newValue: { productId: product.id, cartItemCount: updatedCart.length },
                });
            } catch (error) {
                logger.error('Add to cart error', { error, productId: product.id });
            }
        } else {
            // Guest user: update local state only
            const updatedCart = [...cart];
            const existingItem = updatedCart.find(item => item.id === product.id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                updatedCart.push(cartItem);
            }

            setCart(updatedCart);

            logRocketService.logStateChange({
                context: 'ShopContext',
                action: 'item_added_to_cart_guest',
                newValue: { productId: product.id, cartItemCount: updatedCart.length },
            });
        }

        setIsCartOpen(true);
    };

    const updateCartItemQuantity = async (index: number, newQuantity: number) => {
        if (newQuantity < MIN_CART_QUANTITY) return;

        const item = cart[index];
        if (!item) return;

        const originalItem = { ...item };

        // Optimistic update
        const updatedCart = [...cart];
        updatedCart[index] = { ...item, quantity: newQuantity };
        setCart(updatedCart);

        // Sync with backend if authenticated
        if (user?.backendToken && item.cartItemId) {
            try {
                const request: UpdateCartItemRequest = {
                    quantity: newQuantity,
                    size: item.selectedSize || DEFAULT_SIZE
                };

                await api.put(
                    API_ENDPOINTS.CART.UPDATE_ITEM(item.cartItemId),
                    request
                );
            } catch (error) {
                logger.error('Update cart quantity error', { error, productId: item.id });
                // Revert on error
                const revertedCart = [...cart];
                revertedCart[index] = originalItem;
                setCart(revertedCart);
            }
        }
    };

    const removeFromCart = async (index: number) => {
        const itemToRemove = cart[index];
        if (!itemToRemove) return;

        logger.info('Action: Remove from Cart', {
            productId: itemToRemove.id,
            name: itemToRemove.name
        });

        // Firebase Analytics
        firebaseAnalytics.logEvent('remove_from_cart', {
            currency: currency.code,
            value: itemToRemove.price,
            items: [{
                item_id: String(itemToRemove.id),
                item_name: itemToRemove.name
            }]
        });

        // Optimistic update
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);

        // Sync with backend if authenticated
        if (user?.backendToken && itemToRemove.cartItemId) {
            try {
                await api.delete(API_ENDPOINTS.CART.REMOVE_ITEM(itemToRemove.cartItemId));
            } catch (error) {
                logger.error('Remove from cart error', { error, productId: itemToRemove.id });
                // Revert on error
                const revertedCart = [...cart];
                revertedCart.splice(index, 0, itemToRemove);
                setCart(revertedCart);
            }
        }

        logRocketService.logStateChange({
            context: 'ShopContext',
            action: 'item_removed_from_cart',
            newValue: { productId: itemToRemove.id, cartItemCount: newCart.length },
        });
    };

    const clearCart = async () => {
        const previousCount = cart.length;

        logger.info('Action: Clear Cart');

        // Optimistic update
        setCart([]);

        if (user?.backendToken) {
            try {
                await api.delete(API_ENDPOINTS.CART.GET);
            } catch (error) {
                logger.error('Clear cart error', { error });
            }
        }

        logRocketService.logStateChange({
            context: 'ShopContext',
            action: 'cart_cleared',
            previousValue: { cartItemCount: previousCount },
        });
    };

    const addOrder = (order: Order) => {
        setOrders([order, ...orders]);
    };

    const formatPrice = useCallback((amount: number) => {
        return `${currency.symbol}${amount.toLocaleString('en-IN')}`;
    }, [currency.symbol]);

    const addToWishlist = async (product: Product) => {
        logger.info('Action: Add to Wishlist', { productId: product.id, name: product.name });

        // Firebase Analytics
        firebaseAnalytics.logEvent('add_to_wishlist', {
            currency: currency.code,
            value: typeof product.price === 'number' ? product.price : 0,
            items: [{
                item_id: String(product.id),
                item_name: product.name
            }]
        });

        if (!isInWishlist(product.id)) {
            if (user?.backendToken) {
                try {
                    await api.post(API_ENDPOINTS.WISHLIST.ADD_ITEM, { product_id: product.id });
                } catch (error) {
                    logger.error('[Wishlist] Backend sync failed', { error, productId: product.id });
                }
            }
            setWishlist([...wishlist, product]);

            logRocketService.logStateChange({
                context: 'ShopContext',
                action: 'item_added_to_wishlist',
                newValue: { productId: product.id, wishlistCount: wishlist.length + 1 },
            });
        }
    };

    const removeFromWishlist = async (productId: string | number) => {
        logger.info('Action: Remove from Wishlist', { productId });
        if (user?.backendToken) {
            try {
                const wishlistItem = wishlist.find(item => item.id === productId);
                if (wishlistItem && (wishlistItem as any).wishlistItemId) {
                    const itemId = (wishlistItem as any).wishlistItemId;
                    await api.delete(API_ENDPOINTS.WISHLIST.REMOVE_ITEM(itemId));
                }
            } catch (error) {
                logger.error('[Wishlist] Backend deletion failed', { error, productId });
            }
        }
        const newWishlist = wishlist.filter(item => item.id !== productId);
        setWishlist(newWishlist);

        logRocketService.logStateChange({
            context: 'ShopContext',
            action: 'item_removed_from_wishlist',
            newValue: { productId, wishlistCount: newWishlist.length },
        });
    };

    const isInWishlist = useCallback((productId: string | number) => {
        return wishlist.some(item => item.id === productId);
    }, [wishlist]);

    const toggleWishlist = useCallback((product: Product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    }, [isInWishlist]);



    return (
        <ShopContext.Provider value={{
            cart,
            addToCart,
            updateCartItemQuantity,
            removeFromCart,
            clearCart,
            isCartOpen,
            setIsCartOpen,
            isSearchOpen,
            setIsSearchOpen,
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            toggleWishlist,
            orders,
            addOrder,
            currency,
            formatPrice
        }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
};
