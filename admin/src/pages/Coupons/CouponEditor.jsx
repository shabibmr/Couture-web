import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Ticket, Users, ShoppingBag, Tag, Truck } from 'lucide-react';

import api from '../../services/api';

export default function CouponEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;
    const [loading, setLoading] = useState(!isNew);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [customers, setCustomers] = useState([]);

    // Helper for date formatting
    const getToday = () => new Date().toISOString().split('T')[0];
    const getSixMonthsLater = () => {
        const d = new Date();
        d.setMonth(d.getMonth() + 6);
        return d.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_value: '',
        min_product_price: '',
        usage_limit: '',
        valid_from: getToday(),
        valid_until: getSixMonthsLater(),
        is_active: true,
        // Usage Control
        is_single_use: false,
        per_customer_limit: '',
        is_first_order_only: false,
        // Value Limits
        max_discount_amount: '',
        min_quantity: 1,
        // Targeting
        applies_to: 'all',
        applicable_product_ids: [],
        applicable_category_ids: [],
        // User Targeting
        is_private: false,
        allowed_customer_ids: [],
        // Stacking
        is_stackable: true
    });

    useEffect(() => {
        // Fetch products, categories, and customers for targeting selectors
        const fetchOptions = async () => {
            try {
                const [productsRes, categoriesRes, customersRes] = await Promise.all([
                    api.get('/products?limit=1000'),
                    api.get('/categories'),
                    api.get('/users/customers')
                ]);
                setProducts(productsRes.data?.data || productsRes.data || []);
                setCategories(categoriesRes.data || []);
                setCustomers(customersRes.data?.data || customersRes.data || []);
            } catch (error) {
                console.error('Error fetching options:', error);
            }
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        if (!isNew) {
            const fetchCoupon = async () => {
                try {
                    const response = await api.get(`/coupons/${id}`);
                    const coupon = response.data;
                    if (coupon) {
                        setFormData({
                            ...coupon,
                            valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
                            valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
                            min_product_price: coupon.min_product_price || '',
                            applicable_product_ids: coupon.applicable_product_ids || [],
                            applicable_category_ids: coupon.applicable_category_ids || [],
                            allowed_customer_ids: coupon.allowed_customer_ids || []
                        });
                    }
                    setLoading(false);
                } catch (error) {
                    console.error(error);
                    setLoading(false);
                }
            };
            fetchCoupon();
        }
    }, [id, isNew]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                discount_value: formData.discount_type === 'free_shipping' ? 0 : parseFloat(formData.discount_value) || 0,
                min_order_value: parseFloat(formData.min_order_value) || 0,
                min_product_price: parseFloat(formData.min_product_price) || 0,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
                valid_from: formData.valid_from || null,
                valid_until: formData.valid_until || null,
                per_customer_limit: formData.per_customer_limit ? parseInt(formData.per_customer_limit) : null,
                max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
                min_quantity: parseInt(formData.min_quantity) || 1,
                applicable_product_ids: formData.applies_to === 'products' ? formData.applicable_product_ids : null,
                applicable_category_ids: formData.applies_to === 'categories' ? formData.applicable_category_ids : null,
                allowed_customer_ids: formData.is_private ? formData.allowed_customer_ids : null
            };

            if (isNew) {
                await api.post('/coupons', payload);
            } else {
                await api.put(`/coupons/${id}`, payload);
            }
            navigate('/coupons');
        } catch (error) {
            console.error('Error saving coupon:', error);
        }
    };

    const handleMultiSelect = (field, value) => {
        const current = formData[field] || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        setFormData({ ...formData, [field]: updated });
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
                {/* Basic Info Section */}
                <div>
                    <h3 className="text-lg font-medium text-midnight mb-4 flex items-center gap-2">
                        <Ticket size={20} className="text-ruvera-gold" />
                        Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-600">Coupon Code</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all uppercase"
                                placeholder="e.g. SUMMER2024"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-600">Discount Type</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all bg-white"
                                value={formData.discount_type}
                                onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                                <option value="free_shipping">Free Shipping</option>
                                <option value="bogo">Buy One Get One</option>
                            </select>
                        </div>

                        {formData.discount_type !== 'free_shipping' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-600">Discount Value</label>
                                <input
                                    type="number"
                                    required={formData.discount_type !== 'free_shipping'}
                                    min="0"
                                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                                    value={formData.discount_value}
                                    onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-600">Minimum Order Value</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                                value={formData.min_order_value}
                                onChange={e => setFormData({ ...formData, min_order_value: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-600">Minimum Product Price (per item)</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                                value={formData.min_product_price}
                                onChange={e => setFormData({ ...formData, min_product_price: e.target.value })}
                            />
                            <p className="text-xs text-stone-400">Only applies to items more expensive than this amount</p>
                        </div>

                        {formData.discount_type === 'percentage' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-600">Max Discount Cap (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 500"
                                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                                    value={formData.max_discount_amount}
                                    onChange={e => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                />
                                <p className="text-xs text-stone-400">Maximum discount amount for percentage coupons</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-600">Valid From</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                                value={formData.valid_from}
                                onChange={e => setFormData({ ...formData, valid_from: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-600">Valid Until</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                                value={formData.valid_until}
                                onChange={e => setFormData({ ...formData, valid_until: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Usage Controls Section */}
                <div className="border-t border-stone-100 pt-6">
                    <h3 className="text-lg font-medium text-midnight mb-4 flex items-center gap-2">
                        <Users size={20} className="text-ruvera-gold" />
                        Usage Controls
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-600">Global Usage Limit</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="Leave empty for unlimited"
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                                value={formData.usage_limit}
                                onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-600">Per Customer Limit</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="Leave empty for unlimited"
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                                value={formData.per_customer_limit}
                                onChange={e => setFormData({ ...formData, per_customer_limit: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-600">Minimum Cart Items</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                                value={formData.min_quantity}
                                onChange={e => setFormData({ ...formData, min_quantity: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col justify-center gap-4 pt-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-stone-300 text-ruvera-gold focus:ring-ruvera-gold"
                                    checked={formData.is_single_use}
                                    onChange={e => setFormData({ ...formData, is_single_use: e.target.checked })}
                                />
                                <span className="font-medium text-midnight">Single Use Per Customer</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-stone-300 text-ruvera-gold focus:ring-ruvera-gold"
                                    checked={formData.is_first_order_only}
                                    onChange={e => setFormData({ ...formData, is_first_order_only: e.target.checked })}
                                />
                                <span className="font-medium text-midnight">First Order Only</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Targeting Section */}
                <div className="border-t border-stone-100 pt-6">
                    <h3 className="text-lg font-medium text-midnight mb-4 flex items-center gap-2">
                        <ShoppingBag size={20} className="text-ruvera-gold" />
                        Product Targeting
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-600">Applies To</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all bg-white"
                                value={formData.applies_to}
                                onChange={e => setFormData({ ...formData, applies_to: e.target.value })}
                            >
                                <option value="all">All Products</option>
                                <option value="products">Specific Products</option>
                                <option value="categories">Specific Categories</option>
                            </select>
                        </div>

                        {formData.applies_to === 'products' && products.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-600">Select Products</label>
                                <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-lg p-3 space-y-2">
                                    {products.map(product => (
                                        <label key={product.id} className="flex items-center gap-2 cursor-pointer hover:bg-stone-50 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-stone-300 text-ruvera-gold focus:ring-ruvera-gold"
                                                checked={(formData.applicable_product_ids || []).includes(product.id)}
                                                onChange={() => handleMultiSelect('applicable_product_ids', product.id)}
                                            />
                                            <span className="text-sm text-stone-700">{product.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.applies_to === 'categories' && categories.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-600">Select Categories</label>
                                <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-lg p-3 space-y-2">
                                    {categories.map(category => (
                                        <label key={category.id} className="flex items-center gap-2 cursor-pointer hover:bg-stone-50 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-stone-300 text-ruvera-gold focus:ring-ruvera-gold"
                                                checked={(formData.applicable_category_ids || []).includes(category.id)}
                                                onChange={() => handleMultiSelect('applicable_category_ids', category.id)}
                                            />
                                            <span className="text-sm text-stone-700">{category.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Targeting Section */}
                <div className="border-t border-stone-100 pt-6">
                    <h3 className="text-lg font-medium text-midnight mb-4 flex items-center gap-2">
                        <Tag size={20} className="text-ruvera-gold" />
                        User Targeting & Settings
                    </h3>
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-stone-300 text-ruvera-gold focus:ring-ruvera-gold"
                                    checked={formData.is_private}
                                    onChange={e => setFormData({ ...formData, is_private: e.target.checked })}
                                />
                                <span className="font-medium text-midnight">Private Coupon (VIP Only)</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-stone-300 text-ruvera-gold focus:ring-ruvera-gold"
                                    checked={formData.is_stackable}
                                    onChange={e => setFormData({ ...formData, is_stackable: e.target.checked })}
                                />
                                <span className="font-medium text-midnight">Stackable with Other Coupons</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-stone-300 text-ruvera-gold focus:ring-ruvera-gold"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <span className="font-medium text-midnight">Active</span>
                            </label>
                        </div>

                        {formData.is_private && customers.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-600">Select Allowed Customers</label>
                                <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-lg p-3 space-y-2">
                                    {customers.map(customer => (
                                        <label key={customer.id} className="flex items-center gap-2 cursor-pointer hover:bg-stone-50 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-stone-300 text-ruvera-gold focus:ring-ruvera-gold"
                                                checked={(formData.allowed_customer_ids || []).includes(customer.id)}
                                                onChange={() => handleMultiSelect('allowed_customer_ids', customer.id)}
                                            />
                                            <span className="text-sm text-stone-700">
                                                {customer.first_name} {customer.last_name} ({customer.email})
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit */}
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
