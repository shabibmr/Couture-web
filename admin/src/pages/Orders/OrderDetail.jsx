import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, CreditCard, Printer, Truck } from 'lucide-react';
import api from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';

export default function OrderDetail() {
    const { id } = useParams();
    const { settings } = useSettings();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order details:', error);
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await api.put(`/orders/${id}/status`, { status: newStatus });
            setOrder(prev => ({ ...prev, status: newStatus }));
            // Add toast notification here
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) return <div className="p-12 text-center text-stone-400">Loading order details...</div>;
    if (!order) return <div className="p-12 text-center text-red-400">Order not found</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/orders" className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-serif text-midnight">Order {order.order_number || `#${order.id}`}</h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
                                {order.status}
                            </span>
                        </div>
                        <p className="text-stone-500 text-sm mt-1">
                            Placed on {new Date(order.order_date).toLocaleDateString()} at {new Date(order.order_date).toLocaleTimeString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">
                        <Printer size={18} />
                        <span>Print Invoice</span>
                    </button>
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-midnight text-white rounded-lg hover:bg-stone-800 transition-colors shadow-lg">
                            <span>Update Status</span>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 py-1 hidden group-hover:block z-10">
                            {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-ruvera-gold capitalize"
                                >
                                    Mark as {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                            <h3 className="font-medium text-midnight flex items-center gap-2">
                                <Package size={20} className="text-ruvera-gold" />
                                Order Items
                            </h3>
                            <span className="text-sm text-stone-400">{order.items.length} items</span>
                        </div>
                        <div className="divide-y divide-stone-100">
                            {order.items.map(item => (
                                <div key={item.id} className="p-4 flex gap-4">
                                    <div className="w-20 h-24 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex justify-between">
                                        <div>
                                            <h4 className="font-serif text-midnight font-medium">{item.product_name}</h4>
                                            <p className="text-sm text-stone-500 mt-1">{item.variant || 'Standard'}</p>
                                            <p className="text-xs font-mono text-stone-400 mt-1">SKU: {item.variant_sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-midnight">{settings.currency_symbol}{parseFloat(item.unit_price).toFixed(2)}</p>
                                            <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                                            <p className="font-medium text-ruvera-gold mt-1">{settings.currency_symbol}{parseFloat(item.total_price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-stone-50/50 space-y-2">
                            <div className="flex justify-between text-sm text-stone-600">
                                <span>Subtotal</span>
                                <span>{settings.currency_symbol}{parseFloat(order.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-stone-600">
                                <span>Shipping</span>
                                <span>{settings.currency_symbol}{parseFloat(order.shipping_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-stone-600">
                                <span>Tax</span>
                                <span>{settings.currency_symbol}{parseFloat(order.tax_amount).toFixed(2)}</span>
                            </div>
                            <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
                                <span className="font-serif font-medium text-lg text-midnight">Total</span>
                                <span className="font-serif font-medium text-lg text-midnight">{settings.currency_symbol}{parseFloat(order.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
                        <h3 className="font-medium text-midnight flex items-center gap-2 mb-4">
                            <Truck size={20} className="text-ruvera-gold" />
                            Shipment Details
                        </h3>
                        <div className="text-sm text-stone-500">
                            <p>No shipment information available yet.</p>
                            <button className="mt-2 text-ruvera-gold hover:underline">Create Shipment</button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Customer & Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
                        <h3 className="font-medium text-midnight flex items-center gap-2 mb-4">
                            <User size={20} className="text-ruvera-gold" />
                            Customer
                        </h3>
                        <div className="space-y-3">
                            <div>
                                {order.Customer ? (
                                    <>
                                        <p className="font-medium text-midnight">
                                            {order.Customer.first_name} {order.Customer.last_name}
                                        </p>
                                        <p className="text-sm text-stone-500">{order.Customer.email}</p>
                                        {order.Customer.phone && (
                                            <p className="text-sm text-stone-500">{order.Customer.phone}</p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p className="font-medium text-midnight">Customer ID</p>
                                        <p className="text-sm text-stone-500 font-mono">{order.customer_id}</p>
                                    </>
                                )}
                            </div>
                            <div className="pt-3 border-t border-stone-100">
                                <Link
                                    to={order.Customer ? `/customers/${order.customer_id}` : '/customers'}
                                    className="text-sm text-ruvera-gold hover:underline"
                                >
                                    {order.Customer ? 'View Profile' : 'View Customers'}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
                        <h3 className="font-medium text-midnight flex items-center gap-2 mb-4">
                            <MapPin size={20} className="text-ruvera-gold" />
                            Delivery Address
                        </h3>
                        <address className="not-italic text-sm text-stone-600 space-y-1">
                            {(() => {
                                try {
                                    const addr = typeof order.shipping_address === 'string'
                                        ? JSON.parse(order.shipping_address)
                                        : order.shipping_address;
                                    return (
                                        <>
                                            <p>{addr.line1 || addr.address || 'N/A'}</p>
                                            <p>{addr.city || ''}{addr.city && addr.state ? ', ' : ''}{addr.state || ''} {addr.zip || addr.postal_code || ''}</p>
                                            <p>{addr.country || ''}</p>
                                        </>
                                    );
                                } catch (e) {
                                    return <p className="text-stone-400">Address information unavailable</p>;
                                }
                            })()}
                        </address>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
                        <h3 className="font-medium text-midnight flex items-center gap-2 mb-4">
                            <CreditCard size={20} className="text-ruvera-gold" />
                            Payment Info
                        </h3>
                        <div className="space-y-2">
                            {order.PaymentTransactions && order.PaymentTransactions.length > 0 ? (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-500">Payment Method</span>
                                        <span className="font-medium text-midnight capitalize">
                                            {order.PaymentTransactions[0].PaymentGateway?.name || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-500">Payment Status</span>
                                        <span className={`font-medium ${order.PaymentTransactions[0].status === 'completed'
                                                ? 'text-green-600'
                                                : order.PaymentTransactions[0].status === 'failed'
                                                    ? 'text-red-600'
                                                    : 'text-amber-600'
                                            }`}>
                                            {order.PaymentTransactions[0].status}
                                        </span>
                                    </div>
                                    {order.PaymentTransactions[0].transaction_id && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-stone-500">Razorpay Order ID</span>
                                            <span className="font-mono text-xs text-stone-600">
                                                {order.PaymentTransactions[0].transaction_id}
                                            </span>
                                        </div>
                                    )}
                                    {order.PaymentTransactions[0].gateway_response?.payment_id && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-stone-500">Razorpay Payment ID</span>
                                            <span className="font-mono text-xs text-stone-600">
                                                {order.PaymentTransactions[0].gateway_response.payment_id}
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-sm text-stone-400">
                                    No payment information available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
