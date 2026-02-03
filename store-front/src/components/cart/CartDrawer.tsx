'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import api from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';
import Image from 'next/image';

const CartDrawer: React.FC = () => {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart, formatPrice } = useShop();
    const { requireAuth } = useAuthGuard();
    const router = useRouter();

    const parsePrice = (price: number | string): number => {
        if (typeof price === 'number') return price;
        if (typeof price === 'string') {
            if (!isNaN(parseFloat(price)) && /^\d+(\.\d+)?$/.test(price.trim())) {
                return parseFloat(price);
            }
            return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
        }
        return 0;
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#FDFBF7] shadow-2xl z-[70] flex flex-col border-l border-stone-200"
                    >
                        <div className="p-6 flex items-center justify-between border-b border-stone-100">
                            <h2 className="text-2xl font-serif text-stone-800 italic">Your Selection</h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                            >
                                <X size={24} className="text-stone-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-stone-400">
                                    <ShoppingBag size={48} className="mb-4 opacity-20" />
                                    <p className="font-light tracking-wider uppercase text-sm">Your cart is empty</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        key={`${item.code}-${index}`}
                                        className="flex gap-4"
                                    >
                                        <div className="w-24 h-32 bg-stone-200 rounded-sm overflow-hidden flex-shrink-0 relative">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="96px"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-stone-300 flex items-center justify-center text-stone-400 text-xs">
                                                    Img
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="font-serif text-lg text-stone-800">{item.name || item.title}</h3>
                                                <p className="text-[10px] tracking-widest text-stone-500 uppercase mt-1">Code: {item.code || item.slug || 'N/A'}</p>
                                                <p className="text-xs text-stone-600 mt-1">Size: {item.selectedSize || 'M'}</p>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-medium text-stone-900">{formatPrice(parsePrice(item.price))}</span>
                                                <button
                                                    onClick={() => removeFromCart(index)}
                                                    className="text-[10px] uppercase tracking-wider text-stone-400 hover:text-red-400 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div className="p-6 border-t border-stone-100 space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-serif text-lg text-stone-600">Subtotal</span>
                                <span className="font-medium text-xl text-stone-900">
                                    {formatPrice(cart.reduce((acc, item) => {
                                        const itemPrice = parsePrice(item.price);
                                        const itemQuantity = item.quantity || 1;
                                        return acc + (itemPrice * itemQuantity);
                                    }, 0))}
                                </span>
                            </div>
                            <button
                                onClick={async () => {
                                    setIsCartOpen(false);
                                    if (!requireAuth({ returnTo: '/checkout' })) return;

                                    // Pass calculated totals to checkout via state using router params if possible, 
                                    // or just navigate and let checkout re-fetch/re-calculate.
                                    // Since next/router doesn't support state object in push, we might rely on CartContext in Checkout 
                                    // or pass via query params if small, but Context is best.

                                    try {
                                        // Calculate order totals (for simple display logic if needed later)
                                        const subtotal = cart.reduce((acc, item) => {
                                            const itemPrice = parsePrice(item.price);
                                            const itemQuantity = item.quantity || 1;
                                            return acc + (itemPrice * itemQuantity);
                                        }, 0);

                                        // For now, simple navigation. Checkout page should handle calculation.
                                        // If we strictly need to pass state like the original code did, we'd use a shared context to hold "PendingOrderState"
                                        // But typically Checkout page recalculates.

                                        // Legacy logic tried to calculate shipping here. 
                                        // We will migrate that logic to Checkout page or a specialized hook later.

                                        router.push('/checkout');

                                    } catch (error) {
                                        console.error('Error proceeding to checkout:', error);
                                        router.push('/checkout');
                                    }
                                }}
                                className="block w-full text-center bg-stone-900 text-[#FDFBF7] py-4 text-sm font-medium tracking-[0.2em] uppercase hover:bg-ruvera-gold transition-colors duration-500"
                            >
                                Checkout
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
