import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Package, Calendar, Clock, Star, Trash2 } from 'lucide-react';
import api from '../../services/api';

import { formatCurrency } from '../../utils/currency';

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export default function CustomerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCustomer = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/customers/${id}`);
                const data = response.data;

                // Transform backend data to match UI expectations
                const mappedCustomer = {
                    ...data,
                    name: `${data.first_name} ${data.last_name}`,
                    joinedDate: data.created_at,
                    avatar: data.avatar_url,
                    location: 'N/A', // Not currently in customer model
                    ordersCount: data.orders ? data.orders.length : 0,
                    totalSpent: data.orders ? data.orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) : 0,
                    status: data.status || 'Active', // Default status
                    recentOrders: data.orders ? data.orders.map(order => ({
                        id: order.order_number || order.id,
                        date: order.order_date,
                        total: order.total_amount,
                        status: capitalizeFirstLetter(order.status),
                        items: 'N/A' // Items not included in current response
                    })) : []
                };

                setCustomer(mappedCustomer);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load customer:", error);
                setCustomer(null);
                setLoading(false);
            }
        };

        loadCustomer();
    }, [id]);

    const handleDeleteCustomer = async () => {
        if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            try {
                setLoading(true);
                await api.delete(`/customers/${id}`);
                navigate('/customers');
            } catch (error) {
                console.error('Error deleting customer:', error);
                setLoading(false);
                alert('Failed to delete customer. Please try again.');
            }
        }
    };

    if (loading) return <div className="p-12 text-center text-stone-400">Loading profile...</div>;
    if (!customer) return <div className="p-12 text-center text-red-500">Customer not found.</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Navigation */}
            <div className="flex justify-between items-center">
                <Link to="/customers" className="inline-flex items-center gap-2 text-stone-400 hover:text-midnight transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Customers</span>
                </Link>
                <button
                    onClick={handleDeleteCustomer}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                    <Trash2 size={16} />
                    <span>Delete Customer</span>
                </button>
            </div>

            {/* Header Profile Card */}
            <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-ruvera-gold/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-stone-200">
                        {customer.avatar ? (
                            <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-stone-300 text-stone-500 font-serif font-bold text-4xl">
                                {customer.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-4xl font-serif text-midnight">{customer.name}</h1>
                            {customer.status === 'VIP' && (
                                <span className="bg-ruvera-gold text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                                    <Star size={12} fill="currentColor" /> VIP
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-stone-500 mt-4">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-ruvera-gold" />
                                <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-ruvera-gold" />
                                <span>{customer.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-ruvera-gold" />
                                <span>{customer.location}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 min-w-[200px] border-l border-stone-100 pl-8">
                        <div>
                            <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Lifetime Value</p>
                            <p className="text-2xl font-serif text-midnight">{formatCurrency(customer.totalSpent)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Engagment</p>
                            <p className="text-sm font-medium text-stone-600">{customer.ordersCount} Orders</p>
                            <p className="text-xs text-stone-400 mt-1">Joined {new Date(customer.joinedDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 bg-stone-50/50">
                    <h3 className="font-serif text-xl text-midnight">Order History</h3>
                </div>

                {customer.recentOrders.length > 0 ? (
                    <div className="divide-y divide-stone-100">
                        {customer.recentOrders.map(order => (
                            <div key={order.id} className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-stone-100 rounded-lg text-stone-500">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-midnight font-mono mb-1">#{order.id.split('_')[1]}</p>
                                        <div className="flex items-center gap-3 text-xs text-stone-400">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(order.date).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{order.items} items</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                        order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                            order.status === 'Shipped' ? 'bg-amber-100 text-amber-700' :
                                                'bg-stone-100 text-stone-500'
                                        }`}>
                                        {order.status}
                                    </span>
                                    <p className="font-serif text-lg text-midnight w-24 text-right">{formatCurrency(order.total)}</p>
                                    <button className="text-stone-400 hover:text-midnight transition-colors">
                                        <ArrowLeft className="rotate-180" size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-stone-600 mb-1">No orders yet</h3>
                        <p className="text-stone-400">This customer hasn't placed any orders.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
