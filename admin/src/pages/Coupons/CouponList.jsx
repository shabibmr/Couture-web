import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Ticket, Calendar } from 'lucide-react';

import api from '../../services/api';

export default function CouponList() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await api.get('/coupons');
            setCoupons(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                await api.delete(`/coupons/${id}`);
                setCoupons(prev => prev.filter(c => c.id !== id));
            } catch (error) {
                console.error('Error deleting coupon:', error);
            }
        }
    };

    const filteredCoupons = coupons.filter(coupon =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-serif text-midnight">Coupons</h2>
                    <p className="text-stone-500 mt-1">Manage discount codes and promotions.</p>
                </div>
                <Link
                    to="/coupons/new"
                    className="inline-flex items-center justify-center gap-2 bg-midnight text-white px-6 py-3 rounded-lg hover:bg-stone-800 transition-colors shadow-lg hover:shadow-xl group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-medium tracking-wide">Create Coupon</span>
                </Link>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by coupon code..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all placeholder:text-stone-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full p-12 text-center text-stone-400">Loading coupons...</div>
                ) : (
                    filteredCoupons.map(coupon => (
                        <div key={coupon.id} className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-stone-50 rounded-lg text-ruvera-gold">
                                    <Ticket size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/coupons/${coupon.id}`} className="p-2 text-stone-400 hover:text-ruvera-gold hover:bg-stone-50 rounded-full transition-colors">
                                        <Edit2 size={16} />
                                    </Link>
                                    <button onClick={() => handleDelete(coupon.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-serif text-midnight mb-1">{coupon.code}</h3>
                            <p className="text-stone-500 text-sm mb-4">
                                {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `$${coupon.value} OFF`}
                                {coupon.minOrder > 0 && ` on orders over $${coupon.minOrder}`}
                            </p>

                            <div className="space-y-2 text-sm text-stone-600 border-t border-stone-100 pt-4">
                                <div className="flex justify-between">
                                    <span>Usage</span>
                                    <span>{coupon.usage} / {coupon.limit || '∞'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        Expires
                                    </span>
                                    <span>{new Date(coupon.validUntil).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span>Status</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
