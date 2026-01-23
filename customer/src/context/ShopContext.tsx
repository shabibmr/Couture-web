import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order, ShopContextType, Currency } from '../types';
import { API_ENDPOINTS } from '../config/api.config';
import { useAuth } from './AuthContext';
import api from '../services/api.service';

const ShopContext = createContext<ShopContextType | undefined>(undefined);

interface ShopProviderProps {
    children: ReactNode;
}

export const ShopProvider: React.FC<ShopProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currency, setCurrency] = useState<Currency>({ code: 'INR', symbol: '₹' });

    // Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // @ts-ignore - API_ENDPOINTS.SETTINGS is dynamically added
                const res = await api.get(API_ENDPOINTS.SETTINGS || '/settings');
                if (res.data) {
                    setCurrency({
                        code: res.data.site_currency_code || 'INR',
                        symbol: res.data.site_currency_symbol || '₹'
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };
        fetchSettings();
    }, []);

    // Sync Cart and Wishlist on login
    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.backendToken) {
                setIsLoading(true);
                setError(null);

                // Store guest cart before fetching backend cart
                const guestCart = [...cart];

                try {
                    // Fetch Cart
                    try {
                        const cartRes = await api.get(API_ENDPOINTS.CART);
                        if (cartRes.data && cartRes.data.items) {
                            const backendCart = cartRes.data.items.map((item: any) => ({
                                ...item.Product,
                                quantity: item.quantity,
                                selectedSize: item.size
                            }));

                            // Merge guest cart with backend cart
                            // Create a map of backend items by product ID
                            const backendCartMap = new Map(
                                backendCart.map((item: any) => [item.id, item])
                            );

                            // Add guest cart items that don't exist in backend
                            const mergedCart = [...backendCart];
                            for (const guestItem of guestCart) {
                                if (!backendCartMap.has(guestItem.id)) {
                                    mergedCart.push(guestItem);
                                    // Sync guest item to backend
                                    try {
                                        await api.post(API_ENDPOINTS.CART, {
                                            product_id: guestItem.id,
                                            quantity: guestItem.quantity || 1,
                                            size: guestItem.selectedSize || 'M'
                                        });
                                    } catch (syncError) {
                                        console.error("Error syncing guest cart item to backend:", syncError);
                                    }
                                }
                            }

                            setCart(mergedCart);
                        }
                    } catch (e) {
                        console.error("Error fetching cart", e);
                    }

                    // Fetch Wishlist
                    try {
                        const wishlistRes = await api.get(API_ENDPOINTS.WISHLIST);
                        if (wishlistRes.data) {
                            setWishlist(wishlistRes.data.map((item: any) => item.Product));
                        }
                    } catch (e) {
                        console.error("Error fetching wishlist", e);
                    }

                    // Fetch Orders
                    try {
                        const ordersRes = await api.get(API_ENDPOINTS.ORDERS);
                        if (ordersRes.data) {
                            setOrders(ordersRes.data.map((order: any) => ({
                                id: order.order_id,
                                date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                total: order.total_amount,
                                status: order.order_status,
                                items: order.Items.map((item: any) => ({
                                    title: item.Product?.name || 'Product',
                                    price: item.price,
                                    image: item.Product?.featured_image || '',
                                    quantity: item.quantity
                                }))
                            })));
                        }
                    } catch (e) {
                        console.error("Error fetching orders", e);
                    }

                } catch (error) {
                    console.error("Error fetching user shop data:", error);
                    setError("Failed to load user data");
                } finally {
                    setIsLoading(false);
                }
            } else {
                // Clear backend state on logout, but keep local cart for guest users
                setWishlist([]);
                setOrders([]);
            }
        };

        fetchUserData();
    }, [user?.backendToken]);

    const addToCart = async (product: Product) => {
        if (user?.backendToken) {
            try {
                await api.post(API_ENDPOINTS.CART, {
                    product_id: product.id,
                    quantity: 1,
                    size: 'M'
                });
                // Optimistic update
                const updatedCart = [...cart];
                const existingItem = updatedCart.find(item => item.id === product.id);
                if (existingItem) {
                    existingItem.quantity = (existingItem.quantity || 0) + 1;
                } else {
                    updatedCart.push({ ...product, quantity: 1, selectedSize: 'M' });
                }
                setCart(updatedCart);
            } catch (error) {
                console.error("Add to cart error:", error);
            }
        } else {
            setCart([...cart, { ...product, quantity: 1, selectedSize: 'M' } as CartItem]);
        }
        setIsCartOpen(true);
    };

    const removeFromCart = async (index: number) => {
        const itemToRemove = cart[index];
        if (user?.backendToken && itemToRemove) {
            try {
                await api.delete(`${API_ENDPOINTS.CART}/${itemToRemove.id}`);
            } catch (error) {
                console.error("Remove from cart error:", error);
            }
        }

        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const clearCart = async () => {
        if (user?.backendToken) {
            try {
                await api.delete(API_ENDPOINTS.CART);
            } catch (error) {
                console.error("Clear cart error:", error);
            }
        }
        setCart([]);
    };

    const addOrder = (order: Order) => {
        setOrders([order, ...orders]);
    };

    const formatPrice = (amount: number) => {
        return `${currency.symbol}${amount.toLocaleString('en-IN')}`;
    };

    const addToWishlist = async (product: Product) => {
        if (!isInWishlist(product.id)) {
            if (user?.backendToken) {
                try {
                    await api.post(API_ENDPOINTS.WISHLIST, { product_id: product.id });
                } catch (error) {
                    console.error("Add to wishlist error:", error);
                }
            }
            setWishlist([...wishlist, product]);
        }
    };

    const removeFromWishlist = async (productId: string | number) => {
        if (user?.backendToken) {
            try {
                await api.delete(`${API_ENDPOINTS.WISHLIST}/${productId}`);
            } catch (error) {
                console.error("Remove from wishlist error:", error);
            }
        }
        setWishlist(wishlist.filter(item => item.id !== productId));
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
