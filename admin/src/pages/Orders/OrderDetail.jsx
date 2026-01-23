import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, CreditCard, Printer, Truck } from 'lucide-react';
import api from '../../services/api';

export default function OrderDetail() {
    const { id } = useParams();
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
                            <h2 className="text-2xl font-serif text-midnight">Order #{order.id}</h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
                                {order.status}
                            </span>
                        </div>
                        <p className="text-stone-500 text-sm mt-1">
                            Placed on {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
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
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex justify-between">
                                        <div>
                                            <h4 className="font-serif text-midnight font-medium">{item.name}</h4>
                                            <p className="text-sm text-stone-500 mt-1">{item.variant}</p>
                                            <p className="text-xs font-mono text-stone-400 mt-1">SKU: {item.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-midnight">${item.price.toFixed(2)}</p>
                                            <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                                            <p className="font-medium text-ruvera-gold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-stone-50/50 space-y-2">
                            <div className="flex justify-between text-sm text-stone-600">
                                <span>Subtotal</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-stone-600">
                                <span>Shipping</span>
                                <span>${order.shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-stone-600">
                                <span>Tax</span>
                                <span>${order.tax.toFixed(2)}</span>
                            </div>
                            <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
                                <span className="font-serif font-medium text-lg text-midnight">Total</span>
                                <span className="font-serif font-medium text-lg text-midnight">${order.total.toFixed(2)}</span>
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
                                <p className="font-medium text-midnight">{order.customer.name}</p>
                                <p className="text-sm text-stone-500">{order.customer.email}</p>
                                <p className="text-sm text-stone-500">{order.customer.phone}</p>
                            </div>
                            <div className="pt-3 border-t border-stone-100">
                                <Link to={`/customers/1`} className="text-sm text-ruvera-gold hover:underline">View Profile</Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
                        <h3 className="font-medium text-midnight flex items-center gap-2 mb-4">
                            <MapPin size={20} className="text-ruvera-gold" />
                            Delivery Address
                        </h3>
                        <address className="not-italic text-sm text-stone-600 space-y-1">
                            <p>{order.shipping_address.line1}</p>
                            <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
                            <p>{order.shipping_address.country}</p>
                        </address>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
                        <h3 className="font-medium text-midnight flex items-center gap-2 mb-4">
                            <CreditCard size={20} className="text-ruvera-gold" />
                            Payment Info
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-stone-500">Method</span>
                                <span className="font-medium text-midnight">{order.payment.method}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-stone-500">Status</span>
                                <span className="font-medium text-emerald-600 capitalize">{order.payment.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-stone-500">Transaction ID</span>
                                <span className="font-mono text-xs text-stone-400">{order.payment.transaction_id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
