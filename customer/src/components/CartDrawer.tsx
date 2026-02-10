import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { useAuthGuard } from '../hooks/useAuthGuard';
import api from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';

const CartDrawer: React.FC = () => {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart, formatPrice } = useShop();
    const { requireAuth } = useAuthGuard();
    const navigate = useNavigate();

    // Coupon state
    const [couponCode, setCouponCode] = useState<string>('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; freeShipping?: boolean } | null>(null);

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

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setCouponLoading(true);
        setCouponError(null);

        try {
            const subtotal = cart.reduce((acc, item) => {
                const itemPrice = parsePrice(item.price);
                const itemQuantity = item.quantity || 1;
                return acc + (itemPrice * itemQuantity);
            }, 0);

            const response = await api.post(API_ENDPOINTS.COUPONS.VALIDATE, {
                code: couponCode,
                cartTotal: subtotal,
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity || 1,
                    price: parsePrice(item.price),
                }))
            });

            if (response.data.isValid) {
                setAppliedCoupon({
                    code: couponCode.toUpperCase(),
                    discount: response.data.discountAmount,
                    freeShipping: response.data.freeShipping
                });
                setCouponError(null);
            } else {
                setCouponError(response.data.message || 'Invalid coupon code');
                setAppliedCoupon(null);
            }
        } catch (error: any) {
            setCouponError(error.response?.data?.message || 'Error validating coupon');
            setAppliedCoupon(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError(null);
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
                                        key={`${item.code}-${index}`}
                                        className="flex gap-4"
                                    >
                                        <div className="w-24 h-32 bg-stone-200 rounded-sm overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
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
                            {/* Coupon Code Section */}
                            <div className="mb-4">
                                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                                    Promo Code
                                </label>

                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded">
                                        <span className="text-green-700 font-medium text-sm">✓ {appliedCoupon.code}</span>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="text-red-400 hover:text-red-600 text-xs uppercase tracking-wider"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                            placeholder="Enter code"
                                            className="flex-1 bg-stone-50 border border-stone-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-ruvera-gold"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading || !couponCode.trim()}
                                            className="bg-stone-200 text-stone-600 px-4 py-2 text-xs uppercase tracking-wider font-medium rounded hover:bg-ruvera-gold hover:text-white transition-colors disabled:opacity-50"
                                        >
                                            {couponLoading ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                )}

                                {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                                {appliedCoupon && <p className="text-xs text-green-600 mt-1">Discount applied successfully!</p>}
                            </div>

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

                            {appliedCoupon && appliedCoupon.discount > 0 && (
                                <div className="flex justify-between items-center -mt-4 mb-2">
                                    <span className="text-sm text-ruvera-gold">Discount</span>
                                    <span className="text-sm font-medium text-ruvera-gold">
                                        -{formatPrice(appliedCoupon.discount)}
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={async () => {
                                    setIsCartOpen(false);
                                    if (!requireAuth({ returnTo: '/checkout' })) return;

                                    try {
                                        // Calculate order totals to pass to checkout
                                        const subtotal = cart.reduce((acc, item) => {
                                            const itemPrice = parsePrice(item.price);
                                            const itemQuantity = item.quantity || 1;
                                            return acc + (itemPrice * itemQuantity);
                                        }, 0);
                                        const tax = 0; // 0% tax - will be replaced with backend calculation
                                        const discount = appliedCoupon?.discount || 0;

                                        // Fetch shipping fee from backend
                                        const shippingResponse = await api.get(API_ENDPOINTS.ORDERS.CALCULATE_SHIPPING(subtotal));
                                        const shippingFee = appliedCoupon?.freeShipping ? 0 : (shippingResponse.data.shipping_amount || 0);

                                        const total = subtotal + tax + shippingFee - discount;

                                        setIsCartOpen(false);
                                        navigate('/checkout', {
                                            state: {
                                                subtotal,
                                                tax,
                                                discount,
                                                shippingFee,
                                                total,
                                                couponCode: appliedCoupon?.code || null
                                            }
                                        });
                                    } catch (error) {
                                        console.error('Error calculating shipping:', error);
                                        // Fallback to 0 shipping if API fails
                                        const subtotal = cart.reduce((acc, item) => {
                                            const itemPrice = parsePrice(item.price);
                                            const itemQuantity = item.quantity || 1;
                                            return acc + (itemPrice * itemQuantity);
                                        }, 0);
                                        const tax = 0;
                                        const discount = appliedCoupon?.discount || 0;
                                        const shippingFee = appliedCoupon?.freeShipping ? 0 : 0;
                                        const total = subtotal + tax + shippingFee - discount;
                                        navigate('/checkout', {
                                            state: {
                                                subtotal,
                                                tax,
                                                discount,
                                                shippingFee,
                                                total,
                                                couponCode: appliedCoupon?.code || null
                                            }
                                        });
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
