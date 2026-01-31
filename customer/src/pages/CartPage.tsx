import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { useShop } from '../context/ShopContext';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import api from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { useAuthGuard } from '../hooks/useAuthGuard';
import logger from '../utils/logger';

const CartPage: React.FC = () => {
    const { cart, removeFromCart, updateCartItemQuantity, formatPrice, setIsCartOpen } = useShop();
    const { requireAuth } = useAuthGuard();
    const navigate = useNavigate();

    React.useEffect(() => {
        logger.info('Page Mounted: CartPage', { cartCount: cart.length });
    }, []);

    // Coupon State
    const [couponCode, setCouponCode] = useState<string>('');
    const [discount, setDiscount] = useState<number>(0);
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);

    // Shipping State
    const [shippingFee, setShippingFee] = useState<number>(0);
    const [shippingLoading, setShippingLoading] = useState(false);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(0);
    const [amountToFreeShipping, setAmountToFreeShipping] = useState<number>(0);

    // Helper to parse price string or number to number for calculation
    const parsePrice = (price: any): number => {
        if (typeof price === 'number') return price;
        if (typeof price === 'string') {
            if (!isNaN(parseFloat(price)) && /^\d+(\.\d+)?$/.test(price.trim())) {
                return parseFloat(price);
            }
            return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
        }
        return 0;
    };

    // Quantity handlers
    const handleIncrementQuantity = (index: number) => {
        const item = cart[index];
        const currentQuantity = item.quantity || 1;
        updateCartItemQuantity(index, currentQuantity + 1);
    };

    const handleDecrementQuantity = (index: number) => {
        const item = cart[index];
        const currentQuantity = item.quantity || 1;
        if (currentQuantity > 1) {
            updateCartItemQuantity(index, currentQuantity - 1);
        }
    };

    const subtotal = cart.reduce((acc: number, item: CartItem) => {
        const itemPrice = parsePrice(item.price);
        const itemQuantity = item.quantity || 1;
        return acc + (itemPrice * itemQuantity);
    }, 0);
    const tax = 0; // Tax removed
    const total = subtotal + tax + shippingFee - discount;

    // Fetch shipping fee when subtotal changes
    React.useEffect(() => {
        const fetchShipping = async () => {
            if (subtotal <= 0) {
                setShippingFee(0);
                setFreeShippingThreshold(0);
                setAmountToFreeShipping(0);
                return;
            }

            setShippingLoading(true);
            try {
                const response = await api.get(API_ENDPOINTS.ORDERS.CALCULATE_SHIPPING(subtotal));
                setShippingFee(response.data.shipping_amount);
                setFreeShippingThreshold(response.data.free_shipping_threshold);
                setAmountToFreeShipping(response.data.amount_to_free_shipping);
                logger.info('Shipping calculated', {
                    subtotal,
                    shipping: response.data.shipping_amount,
                    isFree: response.data.is_free
                });
            } catch (error) {
                logger.error('Error fetching shipping', { error });
                setShippingFee(0); // Fallback to default
                setFreeShippingThreshold(0);
                setAmountToFreeShipping(0);
            } finally {
                setShippingLoading(false);
            }
        };

        fetchShipping();
    }, [subtotal]);



    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponLoading(true);
        setCouponError(null);
        try {
            const response = await api.post(API_ENDPOINTS.COUPONS.VALIDATE, {
                code: couponCode,
                cartTotal: subtotal
            });

            if (response.data.valid) {
                setDiscount(response.data.discount_amount);
                setAppliedCoupon(couponCode);
            } else {
                setCouponError(response.data.message || 'Invalid Coupon');
                setDiscount(0);
                setAppliedCoupon(null);
            }
        } catch (error: any) {
            setCouponError(error.response?.data?.message || 'Error validating coupon');
            setDiscount(0);
            setAppliedCoupon(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleCheckout = () => {
        // Close cart when navigating to checkout
        setIsCartOpen(false);
        // Check authentication before proceeding to checkout
        if (!requireAuth({ returnTo: '/checkout' })) return;

        navigate('/checkout', { state: { subtotal, tax, discount, shippingFee, total } });
    };

    return (
        <div className="container mx-auto px-6 pt-10 pb-20 min-h-screen">
            <SEO
                title="Shopping Bag"
                description="Review items in your shopping bag before proceeding to checkout at Ruvera Couture."
                keywords="shopping cart, shopping bag, checkout, luxury fashion"
            />
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-serif text-stone-900 mb-12 italic text-center"
            >
                Shopping Bag
            </motion.h1>

            {cart.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-stone-500 text-lg mb-8 font-light">Your shopping bag is currently empty.</p>
                    <Link
                        to="/shop"
                        className="inline-block px-8 py-3 bg-stone-900 text-white font-medium tracking-[0.2em] uppercase hover:bg-ruvera-gold transition-colors duration-300"
                    >
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                    <div className="lg:col-span-8 space-y-8">
                        {cart.map((item, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={`${item.code}-${index}`}
                                className="flex gap-6 md:gap-10 border-b border-stone-100 pb-8"
                            >
                                <div className="w-24 md:w-32 aspect-[3/4] bg-stone-200 flex-shrink-0 relative overflow-hidden">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name || item.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback if image fails to load
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                if (target.parentElement) {
                                                    target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-stone-400 font-serif italic bg-stone-300/50">Img</div>';
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-400 font-serif italic bg-stone-300/50">
                                            Img
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-between py-2">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg md:text-xl font-serif text-stone-900">{item.name || item.title}</h3>
                                            <span className="text-lg font-medium text-stone-900">
                                                {formatPrice(parsePrice(item.price))}
                                            </span>
                                        </div>
                                        <p className="text-xs tracking-widest text-stone-500 uppercase">Code: {item.code || item.slug || 'N/A'}</p>
                                        <p className="text-sm text-stone-600 mt-2">Size: {item.selectedSize || 'M'}</p>

                                    </div>

                                    <div className="flex justify-between items-center mt-4">
                                        <div className="flex items-center gap-4 border border-stone-200 px-3 py-1">
                                            <button
                                                onClick={() => handleDecrementQuantity(index)}
                                                disabled={(item.quantity || 1) <= 1}
                                                className="text-stone-400 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                -
                                            </button>
                                            <span className="text-sm font-medium text-stone-900">{item.quantity || 1}</span>
                                            <button
                                                onClick={() => handleIncrementQuantity(index)}
                                                className="text-stone-400 hover:text-stone-900"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(index)}
                                            className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                            <span>Remove</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-white p-8 shadow-sm border border-stone-100 sticky top-32">
                            <h2 className="text-xl font-serif text-stone-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-stone-600">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-stone-600">
                                    <span>Shipping</span>
                                    <span>
                                        {shippingLoading ? (
                                            <span className="text-xs">...</span>
                                        ) : shippingFee === 0 ? (
                                            <span className="text-ruvera-gold font-medium">FREE</span>
                                        ) : (
                                            formatPrice(shippingFee)
                                        )}
                                    </span>
                                </div>
                                {amountToFreeShipping > 0 && (
                                    <div className="text-xs text-stone-500 italic -mt-2">
                                        Add {formatPrice(amountToFreeShipping)} more for free shipping
                                    </div>
                                )}


                                {discount > 0 && (
                                    <div className="flex justify-between text-ruvera-gold font-medium">
                                        <span>Discount ({appliedCoupon})</span>
                                        <span>-{formatPrice(discount)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-8">
                                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Coupon Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="Try WELCOME10"
                                        className="flex-1 bg-stone-50 border border-stone-200 px-4 py-2 text-sm focus:outline-none focus:border-ruvera-gold"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading}
                                        className="bg-stone-200 text-stone-600 px-4 py-2 text-xs uppercase tracking-wider font-medium hover:bg-ruvera-gold hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        {couponLoading ? '...' : 'Apply'}
                                    </button>
                                </div>
                                {couponError && <p className="text-[10px] text-red-500 mt-1">{couponError}</p>}
                            </div>


                            <div className="border-t border-stone-200 pt-6 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="font-serif text-lg text-stone-900">Total</span>
                                    <span className="text-2xl font-serif text-stone-900">{formatPrice(total)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-stone-900 text-white h-14 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm font-medium hover:bg-ruvera-gold transition-colors duration-500 group"
                            >
                                <span>Proceed to Checkout</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
