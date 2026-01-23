import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, DollarSign } from 'lucide-react';

import Pagination from '../../components/Pagination';
import api from '../../services/api';

export default function PaymentList() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchPayments(currentPage);
    }, [currentPage]);

    const fetchPayments = async (page) => {
        try {
            setLoading(true);
            const response = await api.get(`/payment?page=${page}&limit=${itemsPerPage}`);
            if (response.data.data) {
                setPayments(response.data.data);
                setTotalPages(response.data.pages);
                setTotalItems(response.data.total);
            } else {
                setPayments(response.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching payments:', error);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'failed': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-stone-100 text-stone-800 border-stone-200';
        }
    };

    const filteredPayments = payments.filter(payment =>
        (payment.id.toLowerCase().includes(searchTerm.toLowerCase()) || payment.orderId.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === 'all' || payment.status === filterStatus)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-serif text-midnight">Payments</h2>
                    <p className="text-stone-500 mt-1">Monitor transaction history.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search transaction or order ID..."
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
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-stone-400">Loading transactions...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-50 border-b border-stone-100">
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Transaction ID</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Order ID</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Amount</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Gateway</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Date</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Status</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {filteredPayments.map(payment => (
                                    <tr key={payment.id} className="group hover:bg-stone-50/50 transition-colors">
                                        <td className="p-4 font-mono text-sm font-medium text-midnight">{payment.id}</td>
                                        <td className="p-4 font-mono text-sm text-stone-600">
                                            <Link to={`/orders/${payment.orderId}`} className="hover:text-ruvera-gold hover:underline">
                                                {payment.orderId}
                                            </Link>
                                        </td>
                                        <td className="p-4 font-medium text-midnight">${payment.amount.toLocaleString()}</td>
                                        <td className="p-4 text-stone-600">{payment.gateway}</td>
                                        <td className="p-4 text-stone-500 text-sm">{payment.date}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(payment.status)} uppercase tracking-wide`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                to={`/payments/${payment.id}`}
                                                className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-ruvera-gold hover:bg-ruvera-gold/10 rounded-full transition-colors"
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
