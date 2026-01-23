import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Tag } from 'lucide-react';
import api from '../../services/api';

export default function CategoryList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadCategories = async () => {
            setLoading(true);
            try {
                const response = await api.get('/products/categories');

                // Map API response to expected structure if needed
                // Backend returns: [{ id, name, slug, description, sort_order, is_active }]
                const mappedCategories = response.data.map(cat => ({
                    ...cat,
                    status: cat.is_active ? 'Active' : 'Inactive',
                    productsCount: 0 // TODO: Add products count from backend if available
                }));

                setCategories(mappedCategories);
            } catch (error) {
                console.error('Error loading categories:', error);
            }
            setLoading(false);
        };

        loadCategories();
    });

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
            try {
                await api.delete(`/products/categories/${id}`);
                setCategories(categories.filter(c => c.id !== id));
            } catch (error) {
                console.error('Error deleting category:', error);
                alert(error.response?.data?.message || 'Failed to delete category');
            }
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-serif text-midnight">Categories</h2>
                    <p className="text-stone-500 mt-1">Organize the catalogue architecture.</p>
                </div>
                <Link
                    to="/categories/new"
                    className="inline-flex items-center justify-center gap-2 bg-midnight text-white px-6 py-3 rounded-lg hover:bg-stone-800 transition-colors shadow-lg hover:shadow-xl group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-medium tracking-wide">Add Category</span>
                </Link>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-stone-400">{filteredCategories.length} items</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-stone-400">Loading taxonomy...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-50 border-b border-stone-100">
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs w-1/3">Name</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Slug</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Products</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Status</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {filteredCategories.map(category => (
                                    <tr key={category.id} className="group hover:bg-stone-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                                                    <Tag size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-serif text-lg text-midnight">{category.name}</p>
                                                    <p className="text-xs text-stone-400 truncate max-w-[200px]">{category.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <code className="px-2 py-1 bg-stone-100 rounded text-stone-600 text-xs font-mono">{category.slug}</code>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-midnight">{category.productsCount}</span>
                                                <span className="text-xs text-stone-400">products</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${category.status === 'Active'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-stone-50 text-stone-500 border-stone-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${category.status === 'Active' ? 'bg-emerald-500' : 'bg-stone-400'}`}></span>
                                                {category.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    to={`/categories/${category.id}`}
                                                    className="p-2 text-stone-400 hover:text-ruvera-gold hover:bg-ruvera-gold/10 rounded-full transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(category.id, category.name)}
                                                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
