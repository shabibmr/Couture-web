import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { Product } from '../types';

const SearchOverlay: React.FC = () => {
    const { isSearchOpen, setIsSearchOpen, formatPrice } = useShop();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    // Prevent scrolling when overlay is open
    useEffect(() => {
        if (isSearchOpen) {
            document.body.style.overflow = 'hidden';
            // Focus input when opened
            const input = document.getElementById('search-input');
            if (input) input.focus();
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isSearchOpen]);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim()) {
                setLoading(true);
                try {
                    const response = await api.get(API_ENDPOINTS.PRODUCTS.SEARCH, { params: { q: query, limit: 5 } });
                    const rawData = response.data.data || response.data || [];
                    const normalizedData = rawData.map((p: any) => ({
                        ...p,
                        title: p.name || p.title || '',
                        category: p.Category?.name || p.category || '',
                        image: p.featured_image || p.image || (p.images && p.images[0]?.image_url) || ''
                    }));
                    setResults(normalizedData);
                } catch (error) {
                    console.error("Search failed", error);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleSearchSubmit = () => {
        if (query.trim()) {
            setIsSearchOpen(false);
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <AnimatePresence>
            {isSearchOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[80] bg-[#FDFBF7]/95 backdrop-blur-xl flex flex-col p-6 md:p-12 items-center"
                >
                    <button
                        onClick={() => setIsSearchOpen(false)}
                        className="absolute top-6 right-6 p-2 hover:bg-stone-200 rounded-full transition-colors"
                    >
                        <X size={32} className="text-stone-800" strokeWidth={1} />
                    </button>

                    <div className="w-full max-w-3xl mt-12 md:mt-20">
                        <div className="relative border-b border-stone-300 pb-2">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-400" size={28} />
                            <input
                                id="search-input"
                                autoFocus
                                type="text"
                                placeholder="Search the collection..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSearchSubmit();
                                }}
                                className="w-full bg-transparent text-3xl md:text-5xl font-serif text-stone-900 placeholder:text-stone-300 py-4 pl-12 focus:outline-none"
                            />
                        </div>

                        <div className="mt-8 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin scrollbar-thumb-stone-300">
                            {loading ? (
                                <div className="text-center py-8 text-stone-400 animate-pulse font-serif">
                                    Searching...
                                </div>
                            ) : results.length > 0 ? (
                                <div className="space-y-6">
                                    <h4 className="text-xs uppercase tracking-widest text-stone-500 mb-4">Top Results</h4>
                                    {results.map((product) => (
                                        <Link
                                            key={product.id}
                                            to={`/product/${product.slug || product.id}`}
                                            onClick={() => setIsSearchOpen(false)}
                                            className="flex items-center gap-4 group hover:bg-white/50 p-2 rounded-lg transition-colors"
                                        >
                                            <div className="w-16 h-20 bg-stone-200 overflow-hidden rounded">
                                                <img
                                                    src={(product as any).image}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-serif text-lg text-stone-800 group-hover:text-ruvera-gold transition-colors">
                                                    {(product as any).title}
                                                </h5>
                                                <p className="text-xs text-stone-500 uppercase tracking-wider">
                                                    {product.price ? formatPrice(typeof product.price === 'number' ? product.price : parseFloat(product.price.toString())) : ''}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                    <button
                                        onClick={handleSearchSubmit}
                                        className="w-full py-4 text-center text-sm uppercase tracking-widest text-stone-900 hover:text-ruvera-gold border-t border-stone-200 mt-4"
                                    >
                                        View All Results
                                    </button>
                                </div>
                            ) : query ? (
                                <div className="text-center py-8 text-stone-400 font-serif italic">
                                    No products found for "{query}"
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-50 mt-8">
                                    <div>
                                        <h4 className="text-xs uppercase tracking-widest text-stone-500 mb-6">Trending</h4>
                                        <ul className="space-y-4 text-xl font-serif text-stone-800 italic cursor-pointer">
                                            <li className="hover:text-ruvera-gold transition-colors">Evening Gowns</li>
                                            <li className="hover:text-ruvera-gold transition-colors">Silk Blouses</li>
                                            <li className="hover:text-ruvera-gold transition-colors">Winter Coats</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchOverlay;
