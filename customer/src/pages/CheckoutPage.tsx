import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CreditCard } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { Order as OrderType } from '../types';
import axios from 'axios';

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
    total: number;
}

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, addOrder, clearCart, formatPrice, currency: shopCurrency } = useShop();
    const { user } = useAuth();

    // Protect Route
    React.useEffect(() => {
        if (!localStorage.getItem('backend_token')) {
            // Redirect to login with return url
            navigate('/login', { state: { from: '/checkout' } });
        }
    }, [navigate, user]);

    const orderData = (location.state as CheckoutState) || { subtotal: 0, tax: 0, discount: 0, total: 0 };
    const { total } = orderData;

    const [loading, setLoading] = useState<boolean>(false);
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
        setLoading(true);

        try {
            // 1. Create Order in Backend
            const orderResponse = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders`, {
                shipping_address: formData,
                billing_address: formData, // Simplified for now
                // items are implicitly taken from cart on backend or we send them
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('backend_token')}` }
            });

            const backendOrderId = orderResponse.data.order.id;

            // 2. Create Razorpay Order
            const razorpayOrderResponse = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payment/create-order`, {
                order_id: backendOrderId
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('backend_token')}` }
            });

            const { id: rzpOrderId, amount, currency: rzpCurrency, key_id } = razorpayOrderResponse.data;

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
                        const verifyResponse = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payment/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('backend_token')}` }
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
                            alert('Payment verification failed. Please contact support.');
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
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
            console.error('Checkout error:', error);
            alert(error.response?.data?.message || 'Error initiating payment.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return <div className="p-20 text-center">Your cart is empty. <button onClick={() => navigate('/shop')} className="text-ruvera-gold underline">Go Shopping</button></div>;
    }



    return (
        <div className="bg-beige-bg min-h-screen py-12 px-6">
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
                                    {(item.featured_image || item.image) && <img src={item.featured_image || item.image} alt="product" className="w-16 h-20 object-cover bg-stone-200 rounded" />}
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
                                <span>{formatPrice(orderData.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>{formatPrice(orderData.tax)}</span>
                            </div>
                            {orderData.discount > 0 && (
                                <div className="flex justify-between text-ruvera-gold">
                                    <span>Discount</span>
                                    <span>-{formatPrice(orderData.discount)}</span>
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
