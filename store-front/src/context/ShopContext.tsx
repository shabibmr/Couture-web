'use client';

import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import { Product, CartItem, Order, ShopContextType, Currency } from '../types';
import { API_ENDPOINTS } from '../config/api.config';
import { useAuth } from './AuthContext';
import api from '../services/api.service';
import logger from '../utils/logger';
import logRocketService from '../utils/logrocketService';
import firebaseAnalytics from '../utils/firebaseAnalytics';

const ShopContext = createContext<ShopContextType | undefined>(undefined);

interface ShopProviderProps {
    children: ReactNode;
}

export const ShopProvider: React.FC<ShopProviderProps> = ({ children }) => {
    const { user } = useAuth();

    // Initialize cart with extra check for window usage to avoid hydration mismatch
    const [cart, setCart] = useState<CartItem[]>([]);

    // Separate hydration state for local storage
    useEffect(() => {
        if (!user && typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('guest_cart');
            if (savedCart) {
                try {
                    setCart(JSON.parse(savedCart));
                } catch (e) {
                    logger.error('Error parsing guest cart', { error: e });
                }
            }
        }
    }, [user]);

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [_isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Logging for debugging (resolves unused vars)
    useEffect(() => {
        if (error) logger.error('Shop Context Error', { error });
    }, [error]);
    const [currency, setCurrency] = useState<Currency>({ code: 'INR', symbol: '₹' });

    // Ref to track if cart has been merged with backend
    const cartMergedRef = useRef(false);
    // Ref to prevent concurrent merge operations (race condition fix)
    const mergeInProgressRef = useRef(false);

    // Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // API_ENDPOINTS.SETTINGS is dynamically added in source, we should ensure it exists or fallback
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const settingsUrl = (API_ENDPOINTS as any).SETTINGS || '/settings';
                const res = await api.get(settingsUrl);
                if (res.data) {
                    setCurrency({
                        code: res.data.site_currency_code || 'INR',
                        symbol: res.data.site_currency_symbol || '₹'
                    });
                }
            } catch (error) {
                logger.error("Error fetching settings", { error });
            }
        };
        fetchSettings();
    }, []);

    // Sync Cart and Wishlist on login
    useEffect(() => {
        const fetchUserData = async () => {
            // Check both merge completion AND in-progress status to prevent race conditions
            if (user?.backendToken && !cartMergedRef.current && !mergeInProgressRef.current) {
                mergeInProgressRef.current = true;
                setIsLoading(true);
                setError(null);

                // Capture guest cart from localStorage (most up-to-date)
                let guestCart: CartItem[] = [];
                if (typeof window !== 'undefined') {
                    const guestCartStr = localStorage.getItem('guest_cart');
                    if (guestCartStr) {
                        try {
                            guestCart = JSON.parse(guestCartStr);
                        } catch (e) {
                            logger.error('Error parsing guest cart during merge', { error: e });
                        }
                    }
                }

                try {
                    // Fetch Cart
                    try {
                        const cartRes = await api.get(API_ENDPOINTS.CART.GET);
                        if (cartRes.data && cartRes.data.items) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const backendCart = cartRes.data.items.map((item: any) => {
                                const product = item.ProductVariant?.Product || {};
                                return {
                                    ...product,
                                    image: product.image || product.featured_image || '', // Normalize to image
                                    price: product.sale_price || product.base_price || 0,
                                    quantity: item.quantity,
                                    selectedSize: item.ProductVariant?.Size?.name || item.size || 'M',
                                    variant_id: item.variant_id,
                                    cartItemId: item.id
                                };
                            });

                            // Merge guest cart with backend cart
                            // Create a map of backend items by product ID
                            const backendCartMap = new Map(
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                backendCart.map((item: any) => [item.id, item])
                            );

                            // Add guest cart items that don't exist in backend
                            const mergedCart = [...backendCart];
                            for (const guestItem of guestCart) {
                                if (!backendCartMap.has(guestItem.id)) {
                                    mergedCart.push(guestItem);
                                    // Sync guest item to backend
                                    try {
                                        await api.post(API_ENDPOINTS.CART.ADD_ITEM, {
                                            product_id: guestItem.id,
                                            quantity: guestItem.quantity || 1,
                                            size: guestItem.selectedSize || 'M',
                                            variant_id: guestItem.variant_id
                                        });
                                    } catch (syncError) {
                                        logger.error("Error syncing guest cart item to backend", { error: syncError });
                                    }
                                }
                            }

                            setCart(mergedCart);

                            // Log cart merge
                            logRocketService.logStateChange({
                                context: 'ShopContext',
                                action: 'cart_merged',
                                newValue: { itemCount: mergedCart.length, guestItemCount: guestCart.length },
                            });

                            // Clear guest cart from localStorage after successful merge
                            if (typeof window !== 'undefined') {
                                localStorage.removeItem('guest_cart');
                            }
                            // Mark cart as merged
                            cartMergedRef.current = true;
                        }
                    } catch (e) {
                        console.error("Error fetching cart", e);
                    }

                    // Fetch Wishlist
                    try {
                        logger.debug('[Wishlist] Fetching wishlist from backend');
                        const wishlistRes = await api.get(API_ENDPOINTS.WISHLIST.GET);
                        if (wishlistRes.data && wishlistRes.data.items) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const mappedItems = wishlistRes.data.items.map((item: any) => ({
                                ...item.Product,
                                image: item.Product?.image || item.Product?.featured_image || '', // Normalize to image
                                wishlistItemId: item.id
                            }));
                            logger.info(`[Wishlist] Loaded ${mappedItems.length} items from backend`);
                            setWishlist(mappedItems);
                        } else {
                            logger.debug('[Wishlist] Wishlist list empty or unexpected format');
                        }
                    } catch (e) {
                        logger.error('[Wishlist] Error fetching wishlist', { error: e });
                    }

                    // Fetch Orders
                    try {
                        const ordersRes = await api.get(API_ENDPOINTS.ORDERS.LIST);
                        if (ordersRes.data && ordersRes.data.data) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            setOrders(ordersRes.data.data.map((order: any) => ({
                                id: order.order_number || `#${order.id}`,
                                date: new Date(order.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                total: order.total_amount,
                                status: order.status,
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                items: (order.items || []).map((item: any) => {
                                    return {
                                        title: item.product_name || 'Product',
                                        price: item.unit_price,
                                        image: item.image || '', // May not be available from backend
                                        quantity: item.quantity
                                    };
                                })
                            })));
                        }
                    } catch (e) {
                        logger.error("Error fetching orders", { error: e });
                    }

                } catch (error) {
                    logger.error("Error fetching user shop data", { error });
                    setError("Failed to load user data");
                } finally {
                    setIsLoading(false);
                    mergeInProgressRef.current = false; // Reset merge-in-progress flag
                }
            } else if (!user?.backendToken) {
                // Reset merge refs on logout
                cartMergedRef.current = false;
                mergeInProgressRef.current = false;
                // Clear backend state on logout, but keep local cart for guest users
                setCart([]);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('guest_cart');
                }
                setWishlist([]);
                setOrders([]);
            }
        };

        fetchUserData();
    }, [user?.backendToken]);

    // Save guest cart to localStorage whenever it changes (for guests only)
    useEffect(() => {
        if (!user?.backendToken && cart.length > 0) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('guest_cart', JSON.stringify(cart));
            }
        }
    }, [cart, user?.backendToken]);

    const addToCart = async (product: Product) => {
        // Resolve the best price (sale_price > base_price > price)
        let resolvedPrice: number = 0;

        const getNum = (val: unknown): number | null => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string' && !isNaN(parseFloat(val))) return parseFloat(val);
            return null;
        };

        const salePrice = getNum(product.sale_price);
        const basePrice = getNum(product.base_price);
        const normalPrice = getNum(product.price);

        if (salePrice !== null) {
            resolvedPrice = salePrice;
        } else if (basePrice !== null) {
            resolvedPrice = basePrice;
        } else if (normalPrice !== null) {
            resolvedPrice = normalPrice;
        } else if (typeof product.price === 'string') {
            // Fallback for formatted strings like "₹1,499.00"
            resolvedPrice = parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 0;
        }

        const productWithPrice = {
            ...product,
            price: resolvedPrice,
            image: product.image || product.featured_image || '' // Ensure image is set
        };
        logger.info('Action: Add to Cart', { productId: product.id, name: product.name, price: resolvedPrice });

        // Firebase Analytics
        firebaseAnalytics.logAddToCart(
            String(product.id),
            product.name || product.title,
            currency.code,
            resolvedPrice
        );

        if (user?.backendToken) {
            try {
                const res = await api.post(API_ENDPOINTS.CART.ADD_ITEM, {
                    product_id: product.id,
                    quantity: 1,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    size: (product as any).selectedSize || 'M',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    variant_id: (product as any).variant_id
                });

                // Get the real cartItemId from backend response
                const newCartItemId = res.data?.item?.id;

                // Optimistic update correction
                const updatedCart = [...cart];
                const existingItemIndex = updatedCart.findIndex(item => item.id === product.id);

                if (existingItemIndex > -1) {
                    updatedCart[existingItemIndex].quantity = (updatedCart[existingItemIndex].quantity || 0) + 1;
                    // If it was missing cartItemId (rare race case), add it
                    if (!updatedCart[existingItemIndex].cartItemId && newCartItemId) {
                        updatedCart[existingItemIndex].cartItemId = newCartItemId;
                    }
                } else {
                    updatedCart.push({
                        ...productWithPrice,
                        quantity: 1,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        selectedSize: (product as any).selectedSize || 'M',
                        cartItemId: newCartItemId // Store the backend ID
                    } as CartItem);
                }
                setCart(updatedCart);

                logRocketService.logStateChange({
                    context: 'ShopContext',
                    action: 'item_added_to_cart',
                    newValue: { productId: product.id, cartItemCount: updatedCart.length },
                });
            } catch (error) {
                logger.error("Add to cart error", { error, productId: product.id });
            }
        } else {
            const updatedCart = [...cart];
            const existingItem = updatedCart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 0) + 1;
                setCart(updatedCart);
            } else {
                setCart([...cart, {
                    ...productWithPrice,
                    quantity: 1,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    selectedSize: (product as any).selectedSize || 'M',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    variant_id: (product as any).variant_id
                } as CartItem]);

                logRocketService.logStateChange({
                    context: 'ShopContext',
                    action: 'item_added_to_cart_guest',
                    newValue: { productId: product.id, cartItemCount: cart.length + 1 },
                });
            }
        }
        setIsCartOpen(true);
    };

    const updateCartItemQuantity = async (index: number, newQuantity: number) => {
        if (newQuantity < 1) return; // Prevent quantity from going below 1

        const updatedCart = [...cart];
        const item = updatedCart[index];

        if (!item) return;

        // Update locally first (optimistic update)
        updatedCart[index] = { ...item, quantity: newQuantity };
        setCart(updatedCart);

        // Sync with backend if authenticated
        if (user?.backendToken && item.cartItemId) {
            try {
                await api.put(API_ENDPOINTS.CART.UPDATE_ITEM(item.cartItemId), {
                    quantity: newQuantity,
                    size: item.selectedSize || 'M'
                });
            } catch (error) {
                logger.error("Update cart quantity error", { error, productId: item.id });
                // Revert on error
                updatedCart[index] = item;
                setCart(updatedCart);
            }
        }
    };

    const removeFromCart = async (index: number) => {
        const itemToRemove = cart[index];
        if (itemToRemove) {
            logger.info('Action: Remove from Cart', { productId: itemToRemove.id, name: itemToRemove.name });

            // Firebase Analytics
            firebaseAnalytics.logEvent('remove_from_cart', {
                currency: currency.code,
                value: typeof itemToRemove.price === 'number' ? itemToRemove.price : 0,
                items: [{
                    item_id: String(itemToRemove.id),
                    item_name: itemToRemove.name || itemToRemove.title
                }]
            });

            if (user?.backendToken && itemToRemove.cartItemId) {
                try {
                    await api.delete(API_ENDPOINTS.CART.REMOVE_ITEM(itemToRemove.cartItemId));
                } catch (error) {
                    logger.error("Remove from cart error", { error, productId: itemToRemove.id });
                }
            }
        }

        const newCart = [...cart];
        newCart.splice(index, 1);

        logRocketService.logStateChange({
            context: 'ShopContext',
            action: 'item_removed_from_cart',
            newValue: { productId: itemToRemove?.id, cartItemCount: newCart.length },
        });
        setCart(newCart);
    };

    const clearCart = async () => {
        logger.info('Action: Clear Cart');
        if (user?.backendToken) {
            try {
                await api.delete(API_ENDPOINTS.CART.GET);
            } catch (error) {
                logger.error("Clear cart error", { error });
            }
        }
        setCart([]);

        logRocketService.logStateChange({
            context: 'ShopContext',
            action: 'cart_cleared',
            previousValue: { cartItemCount: cart.length },
        });
    };

    const addOrder = (order: Order) => {
        setOrders([order, ...orders]);
    };

    const formatPrice = (amount: number) => {
        return `${currency.symbol}${amount.toLocaleString('en-IN')}`;
    };

    const addToWishlist = async (product: Product) => {
        logger.info('Action: Add to Wishlist', { productId: product.id, name: product.name });

        // Firebase Analytics
        firebaseAnalytics.logEvent('add_to_wishlist', {
            currency: currency.code,
            value: typeof product.price === 'number' ? product.price : 0,
            items: [{
                item_id: String(product.id),
                item_name: product.name || product.title
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (wishlistItem && (wishlistItem as any).wishlistItemId) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const isInWishlist = (productId: string | number) => {
        return wishlist.some(item => item.id === productId);
    };

    const toggleWishlist = (product: Product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

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
