import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import api from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';

import Pagination from '../../components/Pagination';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;
    const { settings } = useSettings();

    useEffect(() => {
        loadProducts(currentPage, searchTerm);
    }, [currentPage]);

    // Debounced search re-fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 1) {
                loadProducts(1, searchTerm);
            } else {
                setCurrentPage(1); // This will trigger the currentPage effect above
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadProducts = async (page, search = '') => {
        try {
            setLoading(true);
            // Request all products (both active and inactive) for admin view
            const response = await api.get(`/products?page=${page}&limit=${itemsPerPage}&status=all&search=${search}`);
            if (response.data.data) {
                const mappedProducts = response.data.data.map(product => ({
                    ...product,
                    title: product.name,
                    code: product.slug, // Using slug as code fallback
                    price: parseFloat(product.base_price),
                    image: product.featured_image,
                    sizes: [], // Variant data not currently fetched in list view
                    status: product.is_active ? 'Active' : 'Inactive'
                }));
                setProducts(mappedProducts);
                setTotalPages(response.data.pages);
                setTotalItems(response.data.total);
            } else {
                setProducts([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading products:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p.id !== id));
                setTotalItems(prev => prev - 1);
            } catch (error) {
                console.error('Error deleting product:', error);
                alert(error.response?.data?.message || 'Failed to delete product');
            }
        }
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-serif text-midnight">Products</h2>
                    <p className="text-stone-500 mt-1">Manage your couture catalogue.</p>
                </div>
                <Link
                    to="/products/new"
                    className="inline-flex items-center justify-center gap-2 bg-midnight text-white px-6 py-3 rounded-lg hover:bg-stone-800 transition-colors shadow-lg hover:shadow-xl group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-medium tracking-wide">Add Product</span>
                </Link>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all placeholder:text-stone-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">
                    <Filter size={18} />
                    <span>Filters</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-stone-50 border-b border-stone-100">
                                <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Product</th>
                                <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Code</th>
                                <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Price</th>
                                <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Status</th>
                                <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={`skeleton-${i}`}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg animate-shimmer" />
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 rounded animate-shimmer" />
                                                    <div className="h-3 w-16 rounded animate-shimmer" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="h-4 w-20 rounded animate-shimmer" />
                                        </td>
                                        <td className="p-4">
                                            <div className="h-4 w-16 rounded animate-shimmer" />
                                        </td>
                                        <td className="p-4">
                                            <div className="h-6 w-16 rounded-full animate-shimmer" />
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <div className="w-8 h-8 rounded-full animate-shimmer" />
                                                <div className="w-8 h-8 rounded-full animate-shimmer" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                products.map(product => (
                                    <tr key={product.id || product.slug} className="group hover:bg-stone-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-stone-200 overflow-hidden relative">
                                                    {product.image && <img src={product.image} alt={product.title} className="w-full h-full object-cover" />}
                                                </div>
                                                <div>
                                                    <p className="font-serif text-midnight font-medium group-hover:text-ruvera-gold transition-colors">{product.title}</p>
                                                    <p className="text-xs text-stone-400">{product.sizes.length} variants</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-stone-600 font-mono">{product.code}</td>
                                        <td className="p-4 text-sm font-medium text-midnight">{settings.currency_symbol}{product.price.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'Active'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-stone-100 text-stone-600'
                                                }`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    to={`/products/${product.id}`}
                                                    className="p-2 text-stone-400 hover:text-ruvera-gold hover:bg-ruvera-gold/10 rounded-full transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id, product.title)}
                                                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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
