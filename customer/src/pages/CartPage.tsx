import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import api from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';

const CartPage: React.FC = () => {
    const { cart, removeFromCart, formatPrice } = useShop();
    const navigate = useNavigate();

    // Coupon State
    const [couponCode, setCouponCode] = useState<string>('');
    const [discount, setDiscount] = useState<number>(0);
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);

    // Helper to parse price string or number to number for calculation
    const parsePrice = (price: string | number): number => {
        if (typeof price === 'number') return price;
        return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
    };

    const subtotal = cart.reduce((acc: number, item: CartItem) => acc + parsePrice(item.price), 0);
    const tax = subtotal * 0.18; // Assuming 18% tax
    const total = subtotal + tax - discount;



    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponLoading(true);
        setCouponError(null);
        try {
            const response = await api.post(API_ENDPOINTS.MARKETING.COUPONS, {
                code: couponCode,
                order_amount: subtotal
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
        navigate('/checkout', { state: { subtotal, tax, discount, total } });
    };

    return (
        <div className="container mx-auto px-6 pt-10 pb-20 min-h-screen">
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
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
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
                                            <button className="text-stone-400 hover:text-stone-900">-</button>
                                            <span className="text-sm font-medium text-stone-900">1</span>
                                            <button className="text-stone-400 hover:text-stone-900">+</button>
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
                                    <span className="text-xs uppercase tracking-widest text-stone-400">Calculated at Checkout</span>
                                </div>
                                <div className="flex justify-between text-stone-600">
                                    <span>Estimated Tax</span>
                                    <span>{formatPrice(tax)}</span>
                                </div>

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
