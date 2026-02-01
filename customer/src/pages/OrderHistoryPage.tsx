import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock } from 'lucide-react';
import SEO from '../components/SEO';
import { useShop } from '../context/ShopContext';
import logger from '../utils/logger';

const OrderHistoryPage: React.FC = () => {
    const { orders, formatPrice } = useShop();

    React.useEffect(() => {
        logger.info('Page Mounted: OrderHistoryPage', { orderCount: orders.length });
    }, [orders.length]);

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
                                        <span className="font-bold text-lg text-midnight">{order.id}</span>
                                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-stone-500 flex items-center gap-2">
                                        <Clock size={14} /> {order.date}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Total Amount</p>
                                    <p className="font-serif text-xl text-midnight">{formatPrice(order.total)}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 overflow-x-auto pb-4 mb-4 border-b border-stone-100 custom-scrollbar">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex-shrink-0 w-20 h-24 bg-stone-200 rounded overflow-hidden">
                                        <img src={item.image} alt="item" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end">
                                <Link
                                    to={`/orders/${order.id}`}
                                    className="flex items-center gap-2 text-sm font-medium text-ruvera-gold hover:text-midnight transition-colors uppercase tracking-widest"
                                >
                                    Track Order <ChevronRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrderHistoryPage;
