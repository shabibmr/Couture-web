import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Filter, Eye, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/Pagination';

import { formatCurrency } from '../../utils/currency';

export default function OrderList() {
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState(location.state?.filter || 'all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        if (location.state?.filter) {
            setFilterStatus(location.state.filter);
        }
    }, [location.state]);

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage]);

    const fetchOrders = async (page) => {
        try {
            setLoading(true);
            const response = await api.get(`/orders?page=${page}&limit=${itemsPerPage}`);
            if (response.data.data) {
                setOrders(response.data.data);
                setTotalPages(response.data.pages);
                setTotalItems(response.data.total);
            } else {
                // Fallback for non-paginated response if any
                setOrders(response.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-stone-100 text-stone-800 border-stone-200';
        }
    };

    const filteredOrders = orders.filter(order => {
        const customerName = order.Customer
            ? `${order.Customer.first_name || ''} ${order.Customer.last_name || ''}`.trim()
            : '';

        const matchesSearch =
            order.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            customerName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-serif text-midnight">Orders</h2>
                    <p className="text-stone-500 mt-1">Manage customer orders and shipments.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search order number or customer..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all placeholder:text-stone-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 focus:border-ruvera-gold outline-none bg-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                <button className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">
                    <Filter size={18} />
                    <span>More Filters</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-stone-400">Loading orders...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-50 border-b border-stone-100">
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Order ID</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Customer</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Date</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Items</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Total</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Status</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="group hover:bg-stone-50/50 transition-colors">
                                        <td className="p-4 font-mono text-sm font-medium text-midnight">{order.order_number || `#${order.id}`}</td>
                                        <td className="p-4 text-stone-600">
                                            {order.Customer
                                                ? `${order.Customer.first_name || ''} ${order.Customer.last_name || ''}`.trim() || 'Guest'
                                                : 'Guest'}
                                        </td>
                                        <td className="p-4 text-stone-500 text-sm">{new Date(order.order_date).toLocaleDateString()}</td>
                                        <td className="p-4 text-stone-500 text-sm">{order.items?.length || 0} items</td>
                                        <td className="p-4 font-serif text-midnight">{formatCurrency(order.total_amount)}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)} uppercase tracking-wide`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                to={`/orders/${order.id}`}
                                                className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-ruvera-gold hover:bg-ruvera-gold/10 rounded-full transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
            />
        </div>
    );
}
