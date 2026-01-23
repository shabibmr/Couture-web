import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { API_ENDPOINTS } from '../config/api.config';
import api from '../services/api.service';
import { Product } from '../types';

// Determine shape based on index
const organicShapes = [
    "50% 50% 40% 60% / 60% 50% 60% 40%",
    "30% 70% 70% 30% / 30% 30% 70% 70%",
    "60% 40% 30% 70% / 60% 30% 70% 40%",
    "40% 60% 70% 30% / 40% 50% 60% 50%",
];

const ShopPage: React.FC = () => {
    const { toggleWishlist, isInWishlist, formatPrice } = useShop();
    const [products, setProducts] = React.useState<Product[]>([]);
    const [categories, setCategories] = React.useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 12;

    // Fetch products based on category or search
    const fetchProducts = async (category?: string | null, search?: string) => {
        setLoading(true);
        try {
            let response;
            if (search) {
                response = await api.get(API_ENDPOINTS.PRODUCTS.SEARCH, { params: { q: search } });
            } else if (category) {
                response = await api.get(API_ENDPOINTS.PRODUCTS.LIST, { params: { category } });
            } else {
                response = await api.get(API_ENDPOINTS.PRODUCTS.LIST);
            }
            // Handle paginated response: {total, pages, currentPage, data: [...]}
            const productsData = response.data.data || response.data;
            setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (err: any) {
            console.error("Fetch products error:", err);
            setError(err.response?.data?.message || 'Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    React.useEffect(() => {
        const loadInitialData = async () => {
            // Fetch Categories
            try {
                const catResponse = await api.get(API_ENDPOINTS.PRODUCTS.CATEGORIES);
                setCategories(catResponse.data.map((c: any) => c.name));
            } catch (err) {
                console.error("Fetch categories error:", err);
            }

            await fetchProducts();
        };
        loadInitialData();
    }, []);

    const handleCategoryClick = (category: string | null) => {
        setSelectedCategory(category);
        setSearchQuery('');
        setCurrentPage(1); // Reset to first page
        fetchProducts(category, '');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSelectedCategory(null);
        setCurrentPage(1); // Reset to first page
        fetchProducts(null, searchQuery);
    };

    if (error) {
        return (
            <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
                <div className="text-xl font-serif text-red-500 text-center">
                    <p>Error: {error}</p>
                    <button onClick={() => fetchProducts()} className="mt-4 text-stone-900 underline text-sm uppercase tracking-widest">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-[1400px] mx-auto">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="font-serif text-5xl md:text-7xl text-ruvera-gold mb-6">The Collection</h1>
                    <p className="text-stone-500 font-light max-w-xl mx-auto">
                        Discover our complete range of avant-garde pieces, meticulously designed for the modern connoisseur.
                    </p>
                </motion.div>

                {/* Filters & Search Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 border-b border-stone-200 pb-10">
                    <div className="flex flex-wrap justify-center gap-6">
                        <button
                            onClick={() => handleCategoryClick(null)}
                            className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${!selectedCategory ? 'text-ruvera-gold' : 'text-stone-400 hover:text-stone-900'}`}
                        >
                            All Pieces
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${selectedCategory === cat ? 'text-ruvera-gold' : 'text-stone-400 hover:text-stone-900'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Find a masterpiece..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/50 border border-stone-200 py-3 pl-10 pr-4 rounded-full text-xs focus:outline-none focus:border-ruvera-gold transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    </form>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-40">
                        <div className="text-xl font-serif text-ruvera-gold animate-pulse">Curating Selection...</div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-40">
                        <p className="text-stone-400 font-serif italic text-lg"> No pieces found matching your criteria.</p>
                        <button onClick={() => handleCategoryClick(null)} className="mt-6 text-stone-900 underline text-xs uppercase tracking-widest">Clear Filters</button>
                    </div>
                ) : (
                    <>
                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-12">
                            {(Array.isArray(products) ? products : [])
                                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                .map((product, index) => {
                                    const shape = organicShapes[index % organicShapes.length];
                                    const isWishlisted = isInWishlist(product.id);

                                    // Map backend fields to UI expectations
                                    const displayTitle = product.name || product.title;
                                    const displayImage = product.featured_image || product.image;
                                    const displayPrice = product.sale_price ? formatPrice(product.sale_price) : (product.base_price ? formatPrice(product.base_price) : (typeof product.price === 'number' ? formatPrice(product.price) : product.price));
                                    const displayId = product.slug || product.id;

                                    return (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
                                        >
                                            <div className="group block h-full relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleWishlist(product);
                                                    }}
                                                    className={`absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-all duration-300 ${isWishlisted ? 'text-red-500' : 'text-stone-400 hover:text-stone-900'}`}
                                                >
                                                    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                                                </button>

                                                <Link to={`/product/${displayId}`}>
                                                    <div className="relative aspect-[3/4] mb-6 w-full">
                                                        <div
                                                            style={{ borderRadius: shape }}
                                                            className="w-full h-full bg-stone-200 overflow-hidden relative shadow-lg group-hover:shadow-xl transition-all duration-500"
                                                        >
                                                            <img
                                                                src={displayImage}
                                                                alt={displayTitle}
                                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                                        </div>
                                                    </div>

                                                    <div className="text-center px-4">
                                                        <h3 className="font-serif text-xl text-midnight group-hover:text-ruvera-gold transition-colors duration-300">
                                                            {displayTitle}
                                                        </h3>
                                                        <p className="text-xs font-bold tracking-widest text-stone-400 uppercase mt-2">
                                                            {displayPrice}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                        </div>

                        {/* Pagination */}
                        {Array.isArray(products) && products.length > itemsPerPage && (
                            <div className="mt-20 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-stone-200 rounded hover:border-ruvera-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                {[...Array(Math.ceil(products.length / itemsPerPage))].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded text-sm transition-all ${currentPage === i + 1
                                            ? 'bg-ruvera-gold text-white'
                                            : 'border border-stone-200 hover:border-ruvera-gold'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(products.length / itemsPerPage), prev + 1))}
                                    disabled={currentPage === Math.ceil(products.length / itemsPerPage)}
                                    className="p-2 border border-stone-200 rounded hover:border-ruvera-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ShopPage;
