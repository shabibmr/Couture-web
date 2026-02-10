import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, Package } from 'lucide-react';
import SEO from '../components/SEO';
import { useShop } from '../context/ShopContext';
import logger from '../utils/logger';
import api from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';

interface BackendOrder {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    subtotal: number;
    created_at: string;
    order_date: string;
    items?: any[];
}

const OrderHistoryPage: React.FC = () => {
    const { formatPrice } = useShop();
    const [orders, setOrders] = useState<BackendOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                logger.info('[OrderHistoryPage] Fetching orders from backend');
                const response = await api.get(API_ENDPOINTS.ORDERS.LIST);

                // Backend returns { total, pages, currentPage, data: [] }
                const ordersData = response.data.data || [];
                logger.info('[OrderHistoryPage] Orders fetched', { count: ordersData.length });
                setOrders(ordersData);
                setError(null);
            } catch (err: any) {
                logger.error('[OrderHistoryPage] Error fetching orders', { error: err });
                setError(err.response?.data?.message || 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    React.useEffect(() => {
        logger.info('Page Mounted: OrderHistoryPage', { orderCount: orders.length });
    }, [orders.length]);

    if (loading) {
        return (
            <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ruvera-gold mx-auto mb-4"></div>
                    <p className="text-stone-500">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Link to="/shop" className="text-ruvera-gold hover:underline">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6">
            <SEO
                title="Order History"
                description="View your past orders, track shipments, and manage returns at Ruvera Couture."
                keywords="order history, purchase history, order tracking"
            />
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="font-serif text-4xl text-midnight mb-2">Order History</h1>
                    <p className="text-stone-500 font-light">Track and manage your recent purchases.</p>
                </motion.div>

                {orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-stone-100 text-center">
                        <Package size={48} className="text-stone-300 mx-auto mb-4" />
                        <h2 className="font-serif text-2xl text-midnight mb-2">No Orders Yet</h2>
                        <p className="text-stone-500 mb-6">Start shopping to see your orders here</p>
                        <Link
                            to="/shop"
                            className="inline-block bg-ruvera-gold text-white px-6 py-3 rounded hover:bg-midnight transition-colors"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-bold text-lg text-midnight">{order.order_number}</span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${order.status === 'completed' || order.status === 'delivered'
                                                ? 'bg-green-100 text-green-700'
                                                : order.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : order.status === 'confirmed'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-stone-100 text-stone-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-stone-500 flex items-center gap-2">
                                            <Clock size={14} /> {new Date(order.order_date || order.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Total Amount</p>
                                        <p className="font-serif text-xl text-midnight">{formatPrice(order.total_amount)}</p>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="flex items-center gap-2 text-sm font-medium text-ruvera-gold hover:text-midnight transition-colors uppercase tracking-widest"
                                    >
                                        View Details <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage;

