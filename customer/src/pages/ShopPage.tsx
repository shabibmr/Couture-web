import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';
import { useShop } from '../context/ShopContext';
import { API_ENDPOINTS } from '../config/api.config';
import api from '../services/api.service';
import { Product } from '../types';
import { useAuthGuard } from '../hooks/useAuthGuard';
import logger from '../utils/logger';

// Determine shape based on index
const organicShapes = [
    "50% 50% 40% 60% / 60% 50% 60% 40%",
    "30% 70% 70% 30% / 30% 30% 70% 70%",
    "60% 40% 30% 70% / 60% 30% 70% 40%",
    "40% 60% 70% 30% / 40% 50% 60% 50%",
];

const ShopPage: React.FC = () => {
    const { toggleWishlist, isInWishlist, formatPrice } = useShop();
    const { requireAuth } = useAuthGuard();
    const [products, setProducts] = React.useState<Product[]>([]);
    const [categories, setCategories] = React.useState<{ name: string, slug: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
    const [isNewArrival, setIsNewArrival] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [hasMore, setHasMore] = React.useState(true);
    const loaderRef = React.useRef<HTMLDivElement>(null);
    const itemsPerPage = 12;
    const [currentPage, setCurrentPage] = React.useState(1); // Keep currentPage for internal tracking

    // Fetch products based on category, search, or new arrival status
    const fetchProducts = async (category?: string | null, search?: string, newArrival?: boolean, page: number = 1, append: boolean = false) => {
        if (!append) setLoading(true);
        try {
            let response;
            const params: any = { page, limit: itemsPerPage };

            if (search) {
                params.q = search;
                response = await api.get(API_ENDPOINTS.PRODUCTS.SEARCH, { params });
            } else {
                if (category) params.category_slug = category;
                if (newArrival) params.is_new_arrival = true;
                response = await api.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
            }
            // Handle paginated response: {total, pages, currentPage, data: [...]}
            const productsData = response.data.data || response.data;
            const normalizedProducts = (Array.isArray(productsData) ? productsData : []).map((p: any) => ({
                ...p,
                image: p.image || p.featured_image || ''
            }));

            if (append) {
                setProducts(prev => [...prev, ...normalizedProducts]);
            } else {
                setProducts(normalizedProducts);
            }

            // Determine if there are more products to load
            const total = response.data.total || 0;
            const pages = response.data.pages || 1;
            setHasMore(page < pages);

        } catch (err: any) {
            logger.error("Fetch products error", { error: err });
            setError(err.response?.data?.message || 'Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    React.useEffect(() => {
        logger.info('Page Mounted: ShopPage');
        const loadInitialData = async () => {
            // Fetch Categories
            try {
                const catResponse = await api.get(API_ENDPOINTS.PRODUCTS.CATEGORIES);
                setCategories(catResponse.data.map((c: any) => ({ name: c.name, slug: c.slug })));
            } catch (err) {
                logger.error("Fetch categories error", { error: err });
            }

            await fetchProducts();
        };
        loadInitialData();
    }, []);

    // Intersection Observer for Infinite Scroll
    React.useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading && hasMore) {
                setCurrentPage(prev => {
                    const nextPage = prev + 1;
                    fetchProducts(selectedCategory, searchQuery, isNewArrival, nextPage, true);
                    return nextPage;
                });
            }
        }, { threshold: 0.1 });

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [loading, hasMore, selectedCategory, searchQuery, isNewArrival]);

    const handleCategoryClick = (category: string | null) => {
        setSelectedCategory(category);
        setIsNewArrival(false);
        setSearchQuery('');
        setCurrentPage(1); // Reset to first page
        setHasMore(true);
        fetchProducts(category, '', false, 1, false);
    };

    const handleNewArrivalsClick = () => {
        setIsNewArrival(true);
        setSelectedCategory(null);
        setSearchQuery('');
        setCurrentPage(1);
        setHasMore(true);
        fetchProducts(null, '', true, 1, false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSelectedCategory(null);
        setIsNewArrival(false);
        setCurrentPage(1); // Reset to first page
        setHasMore(true);
        fetchProducts(null, searchQuery, false, 1, false);
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
    const selectedCategoryName = categories.find(c => c.slug === selectedCategory)?.name;

    return (
        <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6">
            <SEO
                title={isNewArrival ? 'New Arrivals' : (selectedCategoryName ? `${selectedCategoryName} Collection` : 'Shop All')}
                description="Explore our exclusive collection of high-fashion pieces. Find your perfect style at Ruvera Couture."
                keywords={`shop, fashion, ${selectedCategoryName || 'couture'}, luxury, clothing`}
            />
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
                <div className="flex flex-col gap-8 mb-16 border-b border-stone-200 pb-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        {/* Categories */}
                        <div className="flex flex-wrap justify-center gap-6">
                            <button
                                onClick={() => handleCategoryClick(null)}
                                className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${!selectedCategory && !isNewArrival ? 'text-ruvera-gold' : 'text-stone-400 hover:text-stone-900'}`}
                            >
                                All Pieces
                            </button>
                            <button
                                onClick={handleNewArrivalsClick}
                                className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${isNewArrival ? 'text-ruvera-gold' : 'text-stone-400 hover:text-stone-900'}`}
                            >
                                New Arrivals
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.slug}
                                    onClick={() => handleCategoryClick(category.slug)}
                                    className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${selectedCategory === category.slug ? 'text-ruvera-gold' : 'text-stone-400 hover:text-stone-900'}`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                    </div>

                </div>

                <div className="flex flex-col md:flex-row justify-end items-center gap-8 w-full">
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
                                .map((product, index) => {
                                    const shape = organicShapes[index % organicShapes.length];
                                    const isWishlisted = isInWishlist(product.id);

                                    // Map backend fields to UI expectations
                                    const displayTitle = product.name || product.title;
                                    const displayImage = product.image;
                                    const displayPrice = product.sale_price ? formatPrice(product.sale_price) : (product.base_price ? formatPrice(product.base_price) : (typeof product.price === 'number' ? formatPrice(product.price) : product.price));
                                    const displayId = product.slug || product.id;

                                    return (
                                        <motion.div
                                            key={`${product.id}-${index}`}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
                                        >
                                            <div className="group block h-full relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (!requireAuth({ action: 'wishlist' })) return;
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

                        {/* Infinite Scroll Loader Trigger */}
                        <div ref={loaderRef} className="h-20 flex items-center justify-center mt-20">
                            {loading && products.length > 0 && (
                                <div className="text-ruvera-gold font-serif italic animate-pulse">
                                    Curating more pieces...
                                </div>
                            )}
                            {!hasMore && products.length > 0 && (
                                <div className="text-stone-400 text-[10px] uppercase tracking-widest border-t border-stone-200 pt-8 w-full text-center">
                                    You have explored the entire collection
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ShopPage;
