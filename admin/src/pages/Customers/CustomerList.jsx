import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Mail, Phone, MapPin, ChevronRight, Star } from 'lucide-react';
import Pagination from '../../components/Pagination';
import api from '../../services/api';

import { formatCurrency } from '../../utils/currency';

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        loadCustomers(currentPage);
    }, [currentPage]);

    const loadCustomers = async (page) => {
        try {
            setLoading(true);
            const response = await api.get(`/customers?page=${page}&limit=${itemsPerPage}&search=${searchTerm}`);
            if (response.data.data) {
                const customersWithStats = response.data.data.map(c => ({
                    ...c,
                    name: `${c.first_name} ${c.last_name}`,
                    // Mocking stats for now as backend doesn't aggregate yet
                    totalSpent: 0,
                    ordersCount: 0
                }));
                setCustomers(customersWithStats);
                setTotalPages(response.data.pages);
                setTotalItems(response.data.total);
            } else {
                setCustomers(response.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading customers:', error);
            setLoading(false);
        }
    };

    // Client-side filtering removed in favor of API search
    const filteredCustomers = customers;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-serif text-midnight">Customers</h2>
                    <p className="text-stone-500 mt-1">View and manage your clientele.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm">
                        <span className="text-sm text-stone-500">Total Clients: <strong className="text-midnight">{customers.length}</strong></span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all placeholder:text-stone-300"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            // Ideally debounce this, but for now we rely on user hitting enter or just refetching logic if we added it to dependency array
                            // Actually, I didn't add searchTerm to useEffect dependency. Let's add it or a button. 
                            // For simplicity, let's keep it simple or just rely on the existing filter logic if we kept it? 
                            // Wait, I replaced Filter logic with API search in loadCustomers. 
                            // So I need to trigger loadCustomers. 
                            // But doing it on every keystroke is heavy. 
                            // Let's just modify the useEffect to depend on searchTerm with a debounce, 
                            // OR just add a search button. 
                            // The filteredCustomers logic below is now REDUNDANT if I do API search.
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setCurrentPage(1);
                                loadCustomers(1);
                            }
                        }}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">
                    <Filter size={18} />
                    <span>Filters</span>
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-stone-400">Loading clients...</div>
                ) : (
                    <div className="divide-y divide-stone-100">
                        {filteredCustomers.map(customer => (
                            <Link
                                key={customer.id}
                                to={`/customers/${customer.id}`}
                                className="flex flex-col md:flex-row items-center p-6 hover:bg-stone-50 transition-colors group cursor-pointer"
                            >
                                {/* Avatar & Basic Info */}
                                <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                                    <div className="w-12 h-12 rounded-full bg-stone-200 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                                        {customer.avatar ? (
                                            <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-stone-300 text-stone-500 font-serif font-bold text-lg">
                                                {customer.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-serif text-lg text-midnight group-hover:text-ruvera-gold transition-colors">{customer.name}</h3>
                                            {customer.status === 'VIP' && (
                                                <span className="bg-ruvera-gold/10 text-ruvera-gold text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                                    <Star size={10} fill="currentColor" /> VIP
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-stone-400 text-sm">{customer.email}</p>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex items-center gap-8 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Total Spent</p>
                                        <p className="font-medium text-midnight">{formatCurrency(customer.totalSpent)}</p>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Orders</p>
                                        <p className="font-medium text-midnight">{customer.ordersCount}</p>
                                    </div>
                                    <div className="text-right md:hidden">
                                        <p className="font-medium text-midnight">{formatCurrency(customer.totalSpent)}</p>
                                        <p className="text-xs text-stone-400">{customer.ordersCount} Orders</p>
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-ruvera-gold group-hover:text-white transition-colors">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </Link>
                        ))}
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
