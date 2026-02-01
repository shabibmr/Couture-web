import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CreditCard } from 'lucide-react';
import SEO from '../components/SEO';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { Order as OrderType } from '../types';
import api from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';
import logger from '../utils/logger';

// ... (keep declarations and interfaces)

// Add Window interface for Razorpay
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface CheckoutState {
    subtotal: number;
    tax: number;
    discount: number;
    shippingFee: number;
    total: number;
}

const CheckoutPage: React.FC = () => {
    // ... (keep all hooks and logic)
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, addOrder, clearCart, formatPrice, currency: shopCurrency } = useShop();
    const { user, loading: authLoading } = useAuth();

    // State for order summary, initialized from location state or defaults
    const [orderSummary, setOrderSummary] = useState<CheckoutState>(() => {
        const state = location.state as CheckoutState;
        return state || { subtotal: 0, tax: 0, discount: 0, shippingFee: 0, total: 0 };
    });

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

    // Recalculate totals if missing from state (e.g. page refresh or login redirect)
    React.useEffect(() => {
        const recalculateTotals = async () => {
            // If total is 0 but we have items, we likely lost state
            if (orderSummary.total === 0 && cart.length > 0) {
                logger.info("[CheckoutPage] Recalculating totals due to missing state");

                const calculatedSubtotal = cart.reduce((acc: number, item: any) => {
                    const itemPrice = parsePrice(item.price);
                    const itemQuantity = item.quantity || 1;
                    return acc + (itemPrice * itemQuantity);
                }, 0);

                let calculatedShipping = 0;
                try {
                    const response = await api.get(API_ENDPOINTS.ORDERS.CALCULATE_SHIPPING(calculatedSubtotal));
                    calculatedShipping = response.data.shipping_amount;
                } catch (e) {
                    logger.error("Error fetching shipping in checkout", { error: e });
                }

                setOrderSummary(prev => ({
                    ...prev,
                    subtotal: calculatedSubtotal,
                    shippingFee: calculatedShipping,
                    // Note: We cannot recover discount code without re-entering it, so discount is 0
                    total: calculatedSubtotal + calculatedShipping
                }));
            }
        };

        recalculateTotals();
    }, [cart.length, orderSummary.total]); // Only run when cart loads or total is checked

    const { total } = orderSummary;

    // Protect Route - use user state instead of localStorage
    React.useEffect(() => {
        logger.info('Page Mounted: CheckoutPage', { cartCount: cart.length, total: orderSummary.total });
        logger.debug("[CheckoutPage] Auth state check", { userId: user?.uid, authLoading });
        if (!authLoading && !user?.backendToken) {
            logger.warn("[CheckoutPage] No backend token found, redirecting to login");
            // Redirect to login with return url
            navigate('/login', { state: { from: '/checkout' } });
        } else if (user?.backendToken) {
            logger.info("[CheckoutPage] Authorized access granted");
        }
    }, [authLoading, user, navigate]);


    const [loading, setLoading] = useState<boolean>(false);
    const [paymentMode, setPaymentMode] = useState<string>(''); // 'test' or 'live'
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        zip: '',
        phone: ''
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e: FormEvent) => {
        e.preventDefault();
        logger.info("[CheckoutPage] Payment initiated", { total: orderSummary.total });
        setLoading(true);

        try {
            // 1. Create Order in Backend with complete order data
            logger.info("[CheckoutPage] Creating order in backend");
            const orderResponse = await api.post(API_ENDPOINTS.ORDERS.CREATE, {
                shipping_address: formData,
                billing_address: formData,
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity || 1,
                    size: item.selectedSize || 'M',
                    price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')),
                    variant_id: (item as any).variant_id || null
                })),
                subtotal: orderSummary.subtotal,
                tax: orderSummary.tax,
                discount: orderSummary.discount,
                total_amount: orderSummary.total,
                payment_method: 'razorpay',
                currency: shopCurrency.code,
                // Include coupon code if available from location state
                coupon_code: (location.state as any)?.couponCode || null
            });

            const backendOrderId = orderResponse.data.order.id || orderResponse.data.order.order_id;
            logger.info("[CheckoutPage] Backend order created", { backendOrderId });

            // 2. Create Razorpay Order
            const razorpayOrderResponse = await api.post(API_ENDPOINTS.PAYMENT.CREATE_ORDER, {
                order_id: backendOrderId
            });

            const { id: rzpOrderId, amount, currency: rzpCurrency, key_id, mode } = razorpayOrderResponse.data;
            setPaymentMode(mode || 'test'); // Set payment mode from backend response

            // 3. Open Razorpay Checkout
            const options = {
                key: key_id,
                amount: amount,
                currency: rzpCurrency,
                name: 'Ruvera Couture',
                description: 'Purchase Payment',
                order_id: rzpOrderId,
                handler: async (response: any) => {
                    try {
                        // 4. Verify Payment in Backend
                        const verifyResponse = await api.post(API_ENDPOINTS.PAYMENT.VERIFY, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyResponse.data.status === 'success') {
                            const newOrder: OrderType = {
                                id: backendOrderId,
                                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                total: total,
                                status: 'Confirmed',
                                items: cart.map(item => ({
                                    title: item.name || item.title,
                                    price: item.price,
                                    image: item.featured_image || item.image,
                                    quantity: item.quantity || 1
                                }))

                            };
                            addOrder(newOrder);
                            clearCart();
                            navigate('/order-success', { state: { orderId: backendOrderId } });
                        } else {
                            logger.error('Payment verification failed', { response });
                            alert('Payment verification failed. Please contact support.');
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
                theme: {
                    color: '#C5A059' // Ruvera Gold
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert(`Payment failed: ${response.error.description}`);
            });
            rzp.open();
        } catch (error: any) {
            logger.error('Checkout error', { error });
            alert(error.response?.data?.message || 'Error initiating payment.');
        } finally {
            setLoading(false);
        }
    };

    // Show loading while auth is initializing
    if (authLoading) {
        return (
            <div className="bg-beige-bg min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ruvera-gold mx-auto mb-4"></div>
                    <p className="text-stone-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return <div className="p-20 text-center">Your cart is empty. <button onClick={() => navigate('/shop')} className="text-ruvera-gold underline">Go Shopping</button></div>;
    }



    return (
        <div className="bg-beige-bg min-h-screen py-12 px-6">
            <SEO
                title="Secure Checkout"
                description="Complete your purchase securely at Ruvera Couture."
                keywords="checkout, payment, secure, fashion"
            />
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center text-stone-500 mb-8 hover:text-midnight">
                        <ArrowLeft size={16} className="mr-2" /> Back to Cart
                    </button>

                    <h1 className="font-serif text-3xl text-midnight mb-8 flex items-center gap-3">
                        <Lock size={24} className="text-ruvera-gold" />
                        Secure Checkout
                    </h1>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-6">Shipping Address</h2>

                        <form onSubmit={handlePayment} className="space-y-6">
                            <div>
                                <label className="block text-xs uppercase text-stone-400 mb-2">Full Name</label>
                                <input name="name" required onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-stone-400 mb-2">Address</label>
                                <input name="address" required onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold" placeholder="123 Fashion Ave" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase text-stone-400 mb-2">City</label>
                                    <input name="city" required onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold" placeholder="Mumbai" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-stone-400 mb-2">Zip Code</label>
                                    <input name="zip" required onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold" placeholder="400001" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-stone-400 mb-2">Phone</label>
                                <input name="phone" required type="tel" onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold" placeholder="+91 98765 43210" />
                            </div>

                            <div className="pt-6">
                                {paymentMode === 'test' && (
                                    <div className="mb-4 bg-orange-50 border border-orange-200 rounded px-4 py-2 flex items-center justify-center gap-2">
                                        <span className="text-orange-600 text-xs font-medium uppercase tracking-wider">⚠️ Test Mode</span>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-ruvera-gold text-white py-4 rounded font-medium tracking-widest uppercase hover:bg-midnight transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Processing...' : (
                                        <>
                                            Pay {formatPrice(total)}
                                            <CreditCard size={18} />
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-stone-400 text-center mt-4 flex items-center justify-center gap-1">
                                    <Lock size={10} /> Encrypted & Secure via Razorpay
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="lg:pl-12">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100 sticky top-12">
                        <h2 className="text-xl font-serif text-midnight mb-6">Order Summary</h2>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                            {cart.map((item, idx) => (
                                <div key={`${item.code}-${idx}`} className="flex gap-4">
                                    {item.image && <img src={item.image} alt="product" className="w-16 h-20 object-cover bg-stone-200 rounded" />}
                                    <div>
                                        <h4 className="font-serif text-sm text-midnight">{item.name || item.title}</h4>
                                        <p className="text-xs text-stone-500">Size: {item.selectedSize || 'M'}</p>
                                        <p className="text-sm font-medium text-stone-800">
                                            {typeof item.price === 'number' ? formatPrice(item.price) : item.price}
                                        </p>
                                    </div>

                                </div>
                            ))}
                        </div>

                        <div className="border-t border-stone-200 pt-4 space-y-2 text-sm text-stone-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatPrice(orderSummary.subtotal)}</span>
                            </div>

                            <div className="flex justify-between text-stone-600">
                                <span>Shipping</span>
                                <span>
                                    {orderSummary.shippingFee === 0 ? (
                                        <span className="text-ruvera-gold font-medium">Free Shipping</span>
                                    ) : (
                                        formatPrice(orderSummary.shippingFee)
                                    )}
                                </span>
                            </div>

                            {orderSummary.discount > 0 && (

                                <div className="flex justify-between text-ruvera-gold">
                                    <span>Discount</span>
                                    <span>-{formatPrice(orderSummary.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-serif text-lg text-midnight border-t border-stone-200 pt-4 mt-2">
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
