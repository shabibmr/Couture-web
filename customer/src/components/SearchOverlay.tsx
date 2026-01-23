import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';

const SearchOverlay: React.FC = () => {
    const { isSearchOpen, setIsSearchOpen } = useShop();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");

    // Prevent scrolling when overlay is open
    useEffect(() => {
        if (isSearchOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isSearchOpen]);

    return (
        <AnimatePresence>
            {isSearchOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[80] bg-[#FDFBF7]/95 backdrop-blur-xl flex flex-col p-8 md:p-20"
                >
                    <button
                        onClick={() => setIsSearchOpen(false)}
                        className="absolute top-8 right-8 p-2 hover:bg-stone-200 rounded-full transition-colors"
                    >
                        <X size={32} className="text-stone-800" strokeWidth={1} />
                    </button>

                    <div className="max-w-4xl mx-auto w-full mt-20">
                        <div className="relative border-b border-stone-300">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-400" size={32} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search the collection..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && query.trim()) {
                                        setIsSearchOpen(false);
                                        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                                    }
                                }}
                                className="w-full bg-transparent text-4xl md:text-6xl font-serif text-stone-900 placeholder:text-stone-300 py-6 pl-16 focus:outline-none"
                            />
                        </div>

                        <div className="mt-20">
                            {!query && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-50">
                                    <div>
                                        <h4 className="text-xs uppercase tracking-widest text-stone-500 mb-6">Trending</h4>
                                        <ul className="space-y-4 text-2xl font-serif text-stone-800 italic cursor-pointer">
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
