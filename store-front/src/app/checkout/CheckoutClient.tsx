'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, ChevronRight } from 'lucide-react';
import Script from 'next/script';
import Image from 'next/image';
import { useShop } from '@/context/ShopContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api.service';
import { API_ENDPOINTS } from '@/config/api.config';
import logger from '@/utils/logger';

// Razorpay interface for window
declare global {
    interface Window {
        Razorpay: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
}

interface CheckoutState {
    subtotal: number;
    tax: number;
    discount: number;
    shippingFee: number;
    total: number;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, addOrder, clearCart, formatPrice, currency: shopCurrency } = useShop();
    const { user, loading: authLoading } = useAuth();

    const [loading, setLoading] = useState<boolean>(false);
    const [paymentMode, setPaymentMode] = useState<string>('');
    const [orderSummary, setOrderSummary] = useState<CheckoutState>({
        subtotal: 0,
        tax: 0,
        discount: 0,
        shippingFee: 0,
        total: 0
    });

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        zip: '',
        phone: ''
    });

    // Recalculate totals on mount/cart change
    useEffect(() => {
        const recalculateTotals = async () => {
            if (cart.length === 0) return;

            const subtotal = cart.reduce((acc, item) => {
                const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
                return acc + (price * (item.quantity || 1));
            }, 0);

            let shipping = 0;
            try {
                const response = await api.get(API_ENDPOINTS.ORDERS.CALCULATE_SHIPPING(subtotal));
                shipping = response.data.shipping_amount;
            } catch (e) {
                logger.error("Error fetching shipping in checkout", { error: e });
            }

            setOrderSummary({
                subtotal,
                tax: 0, // Simplified for now
                discount: 0,
                shippingFee: shipping,
                total: subtotal + shipping
            });
        };

        recalculateTotals();
    }, [cart]);

    // Auth Guard
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login?from=/checkout');
        }
    }, [user, authLoading, router]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e: FormEvent) => {
        e.preventDefault();
        if (!window.Razorpay) {
            alert('Payment SDK not loaded. Please try again in a moment.');
            return;
        }

        logger.info("[CheckoutPage] Payment initiated", { total: orderSummary.total });
        setLoading(true);

        try {
            // 1. Create Order in Backend
            const orderResponse = await api.post(API_ENDPOINTS.ORDERS.CREATE, {
                shipping_address: formData,
                billing_address: formData,
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity || 1,
                    size: item.selectedSize || 'M',
                    price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')),
                })),
                subtotal: orderSummary.subtotal,
                tax: orderSummary.tax,
                discount: orderSummary.discount,
                total_amount: orderSummary.total,
                payment_method: 'razorpay',
                currency: shopCurrency.code
            });

            const backendOrderId = orderResponse.data.order.id;

            // 2. Create Razorpay Order
            const rzpOrderResponse = await api.post(API_ENDPOINTS.PAYMENT.CREATE_ORDER, {
                order_id: backendOrderId
            });

            const { id: rzpOrderId, amount, currency: rzpCurrency, key_id, mode } = rzpOrderResponse.data;
            setPaymentMode(mode || 'test');

            // 3. Razorpay Options
            const options = {
                key: key_id,
                amount: amount,
                currency: rzpCurrency,
                name: 'Ruvera Couture',
                description: 'Purchase Payment',
                order_id: rzpOrderId,
                handler: async (response: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                    try {
                        const verifyResponse = await api.post(API_ENDPOINTS.PAYMENT.VERIFY, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyResponse.data.status === 'success') {
                            addOrder({
                                id: backendOrderId,
                                date: new Date().toLocaleDateString(),
                                total: orderSummary.total,
                                status: 'Confirmed',
                                items: cart.map(item => ({
                                    title: item.name || item.title || 'Product',
                                    price: item.price,
                                    image: item.image,
                                    quantity: item.quantity || 1
                                }))
                            });
                            clearCart();
                            router.push(`/order-success?orderId=${backendOrderId}`);
                        }
                    } catch (err) {
                        logger.error('Verification error', { error: err });
                        alert('Error verifying payment.');
                    }
                },
                prefill: {
                    name: formData.name,
                    contact: formData.phone
                },
                theme: { color: '#C5A059' }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            logger.error('Checkout error', { error });
            alert(error.response?.data?.message || 'Error initiating payment.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ruvera-gold"></div>
        </div>
    );

    if (cart.length === 0) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <h2 className="font-serif text-2xl text-midnight mb-4">Your cart is empty</h2>
            <button
                onClick={() => router.push('/shop')}
                className="text-ruvera-gold underline font-light tracking-widest uppercase text-sm"
            >
                Start Shopping
            </button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left Side: Form */}
                <div className="lg:col-span-7">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center text-stone-400 mb-10 hover:text-midnight transition-colors text-sm"
                    >
                        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Shopping
                    </button>

                    <h2 className="font-serif text-3xl text-midnight mb-10">Shipping Details</h2>

                    <form onSubmit={handlePayment} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">Full Name</label>
                                <input name="name" required onChange={handleChange} className="w-full bg-transparent border-b border-stone-200 py-3 focus:outline-none focus:border-ruvera-gold transition-colors font-light text-stone-800" placeholder="E.g. Jane Smith" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">Phone Number</label>
                                <input name="phone" required type="tel" onChange={handleChange} className="w-full bg-transparent border-b border-stone-200 py-3 focus:outline-none focus:border-ruvera-gold transition-colors font-light text-stone-800" placeholder="+91 98765 43210" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">Street Address</label>
                            <input name="address" required onChange={handleChange} className="w-full bg-transparent border-b border-stone-200 py-3 focus:outline-none focus:border-ruvera-gold transition-colors font-light text-stone-800" placeholder="123 Luxury Lane" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">City</label>
                                <input name="city" required onChange={handleChange} className="w-full bg-transparent border-b border-stone-200 py-3 focus:outline-none focus:border-ruvera-gold transition-colors font-light text-stone-800" placeholder="Mumbai" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">Postal Code</label>
                                <input name="zip" required onChange={handleChange} className="w-full bg-transparent border-b border-stone-200 py-3 focus:outline-none focus:border-ruvera-gold transition-colors font-light text-stone-800" placeholder="400001" />
                            </div>
                        </div>

                        <div className="pt-10">
                            {paymentMode === 'test' && (
                                <div className="mb-6 bg-amber-50 border border-amber-100 rounded px-4 py-3 flex items-center justify-center gap-2">
                                    <span className="text-amber-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        Payment is in Test Mode
                                    </span>
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-midnight text-white py-5 rounded-sm font-medium tracking-widest uppercase hover:bg-ruvera-gold transition-all duration-500 flex items-center justify-center gap-3 group shadow-xl shadow-midnight/5"
                            >
                                {loading ? 'Processing Transaction...' : (
                                    <>
                                        Authorize Payment {formatPrice(orderSummary.total)}
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            <p className="text-[9px] text-stone-400 text-center mt-6 flex items-center justify-center gap-2 uppercase tracking-[0.2em] font-light">
                                <Lock size={10} className="text-stone-300" /> Secure SSL Encrypted Checkout
                            </p>
                        </div>
                    </form>
                </div>

                {/* Right Side: Summary */}
                <div className="lg:col-span-5">
                    <div className="bg-stone-50 p-10 rounded-sm border border-stone-100 sticky top-32">
                        <h3 className="font-serif text-xl text-midnight mb-8">Order Summary</h3>

                        <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex gap-6 pb-6 border-b border-stone-200 last:border-0">
                                    <div className="relative w-24 h-32 bg-stone-200 rounded-sm overflow-hidden flex-shrink-0">
                                        {item.image && (
                                            <Image
                                                src={item.image}
                                                alt={item.name || item.title || 'Product'}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                        <div className="absolute top-0 right-0 bg-midnight text-white w-6 h-6 flex items-center justify-center text-[10px] rounded-bl-sm">
                                            {item.quantity}
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center py-2">
                                        <h4 className="font-serif text-base text-midnight mb-1">{item.name}</h4>
                                        <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-2">Size: {item.selectedSize || 'M'}</p>
                                        <p className="text-sm font-medium text-midnight">
                                            {formatPrice(typeof item.price === 'number' ? item.price : 0)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 text-sm font-light">
                            <div className="flex justify-between text-stone-500">
                                <span className="uppercase tracking-widest text-[10px]">Subtotal</span>
                                <span className="text-midnight">{formatPrice(orderSummary.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-stone-500">
                                <span className="uppercase tracking-widest text-[10px]">Shipping</span>
                                <span className="text-midnight">
                                    {orderSummary.shippingFee === 0 ? 'Complimentary' : formatPrice(orderSummary.shippingFee)}
                                </span>
                            </div>
                            <div className="h-px bg-stone-300 my-6" />
                            <div className="flex justify-between items-baseline font-serif">
                                <span className="text-lg text-midnight">Grand Total</span>
                                <span className="text-2xl text-midnight">{formatPrice(orderSummary.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
