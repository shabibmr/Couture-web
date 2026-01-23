import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, AlertTriangle, Save, RefreshCw } from 'lucide-react';

import api from '../../services/api';

export default function StockList() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await api.get('/inventory');
            // Map API response to component structure
            const mappedInventory = response.data.map(item => ({
                id: item.id, // Inventory ID
                variant_id: item.variant_id,
                product: item.ProductVariant?.Product?.name || 'Unknown Product',
                variant: `${item.ProductVariant?.Color?.name || ''} / ${item.ProductVariant?.Size?.name || ''}`,
                sku: item.ProductVariant?.sku || 'N/A',
                quantity: item.quantity,
                reserved: item.reserved_quantity || 0,
                lowThreshold: item.low_stock_threshold,
                isDirty: false
            }));
            setInventory(mappedInventory);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setLoading(false);
        }
    };

    const handleQuantityChange = (id, newQuantity) => {
        setInventory(prev => prev.map(item =>
            item.id === id ? { ...item, quantity: parseInt(newQuantity) || 0, isDirty: true } : item
        ));
    };

    const saveChanges = async (id) => {
        try {
            const item = inventory.find(i => i.id === id);

            // Controller expects { variant_id, quantity }
            await api.put('/inventory/update', {
                variant_id: item.variant_id,
                quantity: item.quantity
            });

            setInventory(prev => prev.map(item =>
                item.id === id ? { ...item, isDirty: false } : item
            ));
            // Show success toast
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-serif text-midnight">Inventory Code</h2>
                    <p className="text-stone-500 mt-1">Manage stock levels and reservations.</p>
                </div>
                <button
                    onClick={fetchInventory}
                    className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors"
                >
                    <RefreshCw size={18} />
                    <span>Refresh</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by product containing name or SKU..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all placeholder:text-stone-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-500">
                    <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200 inline-block"></span>
                    <span>Low Stock</span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-stone-400">Loading inventory...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-50 border-b border-stone-100">
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Product Info</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">SKU</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs w-32">Stock</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Reserved</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs">Status</th>
                                    <th className="p-4 font-medium text-stone-500 uppercase tracking-wider text-xs text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {filteredInventory.map(item => (
                                    <tr key={item.id} className={`group hover:bg-stone-50/50 transition-colors ${item.quantity <= item.lowThreshold ? 'bg-red-50/30' : ''}`}>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium text-midnight">{item.product}</p>
                                                <p className="text-sm text-stone-500">{item.variant}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-sm text-stone-600">{item.sku}</td>
                                        <td className="p-4">
                                            <input
                                                type="number"
                                                min="0"
                                                className={`w-20 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-ruvera-gold ${item.isDirty ? 'border-ruvera-gold bg-amber-50' : 'border-stone-200'
                                                    }`}
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                            />
                                        </td>
                                        <td className="p-4 text-stone-600">{item.reserved}</td>
                                        <td className="p-4">
                                            {item.quantity <= item.lowThreshold ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                    <AlertTriangle size={12} />
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {item.isDirty && (
                                                <button
                                                    onClick={() => saveChanges(item.id)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-midnight text-white text-xs rounded-lg hover:bg-stone-800 transition-colors shadow-sm"
                                                >
                                                    <Save size={14} />
                                                    Update
                                                </button>
                                            )}
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
