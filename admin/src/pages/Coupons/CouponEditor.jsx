import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Ticket } from 'lucide-react';

import api from '../../services/api';

export default function CouponEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;
    const [loading, setLoading] = useState(!isNew);

    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: '',
        minOrder: '',
        limit: '',
        validFrom: '',
        validUntil: '',
        isActive: true
    });

    useEffect(() => {
        if (!isNew) {
            // Fetch all and filter client-side for MVP since GET /:id is not yet implemented
            const fetchCoupon = async () => {
                try {
                    const response = await api.get('/coupons');
                    const coupon = response.data.find(c => c.id === id);
                    if (coupon) setFormData(coupon);
                    setLoading(false);
                } catch (error) {
                    console.error(error);
                }
            }
            fetchCoupon();
        }
    }, [id, isNew]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isNew) {
                await api.post('/coupons', formData);
            } else {
                await api.put(`/coupons/${id}`, formData);
            }
            navigate('/coupons');
        } catch (error) {
            console.error('Error saving coupon:', error);
        }
    };

    if (loading) return <div className="p-12 text-center text-stone-400">Loading editor...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/coupons" className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-2xl font-serif text-midnight">{isNew ? 'Create Coupon' : 'Edit Coupon'}</h2>
                    <p className="text-stone-500 text-sm mt-1">Configure discount rules and validity.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600">Coupon Code</label>
                        <div className="relative">
                            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all uppercase"
                                placeholder="e.g. SUMMER2024"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600">Discount Type</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all bg-white"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600">Discount Value</label>
                        <input
                            type="number"
                            required
                            min="0"
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                            value={formData.value}
                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600">Minimum Order Value</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                            value={formData.minOrder}
                            onChange={e => setFormData({ ...formData, minOrder: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600">Usage Limit (Total)</label>
                        <input
                            type="number"
                            min="1"
                            placeholder="Leave empty for unlimited"
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                            value={formData.limit}
                            onChange={e => setFormData({ ...formData, limit: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2 flex items-center h-full pt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-stone-300 text-ruvera-gold focus:ring-ruvera-gold"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <span className="font-medium text-midnight">Active</span>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600">Valid From</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                            value={formData.validFrom}
                            onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600">Valid Until</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                            value={formData.validUntil}
                            onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-stone-100 flex justify-end gap-3">
                    <Link to="/coupons" className="px-6 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">
                        Cancel
                    </Link>
                    <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-midnight text-white rounded-lg hover:bg-stone-800 transition-colors shadow-lg">
                        <Save size={18} />
                        <span>Save Coupon</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
