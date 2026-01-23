import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order, ShopContextType } from '../types';
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

    const [orders, setOrders] = useState<Order[]>([
        {
            id: 'RUV-8821',
            date: 'Oct 12, 2024',
            total: 12500,
            status: 'Delivered',
            items: [
                { title: 'Velvet Evening Gown', price: '₹12,500', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=2000&auto=format&fit=crop', quantity: 1 }
            ]
        }
    ]);

    // Sync Cart and Wishlist on login
    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.backendToken) {
                try {
                    // Fetch Cart
                    const cartRes = await api.get(API_ENDPOINTS.CART);
                    if (cartRes.data && cartRes.data.items) {
                        setCart(cartRes.data.items.map((item: any) => ({
                            ...item.Product,
                            quantity: item.quantity,
                            selectedSize: item.size
                        })));
                    }

                    // Fetch Wishlist
                    const wishlistRes = await api.get(API_ENDPOINTS.WISHLIST);
                    if (wishlistRes.data) {
                        setWishlist(wishlistRes.data.map((item: any) => item.Product));
                    }

                    // Fetch Orders
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

                } catch (error) {
                    console.error("Error fetching user shop data:", error);
                }
            } else {
                // Clear state on logout or if no token
                setCart([]);
                setWishlist([]);
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
            addOrder
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
