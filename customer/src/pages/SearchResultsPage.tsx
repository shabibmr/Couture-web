import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { Heart, ChevronDown, SlidersHorizontal } from 'lucide-react';
import SEO from '../components/SEO';
import { useShop } from '../context/ShopContext';
import { API_ENDPOINTS } from '../config/api.config';
import api from '../services/api.service';
import { Product } from '../types';
import { useAuthGuard } from '../hooks/useAuthGuard';
import logger from '../utils/logger';
import firebaseAnalytics from '../utils/firebaseAnalytics';

// Organic shapes for product cards
const organicShapes = [
    "50% 50% 40% 60% / 60% 50% 60% 40%",
    "30% 70% 70% 30% / 30% 30% 70% 70%",
    "60% 40% 30% 70% / 60% 30% 70% 40%",
    "40% 60% 70% 30% / 40% 50% 60% 50%",
];

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest' | 'name-az';

const SearchResultsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const { toggleWishlist, isInWishlist, formatPrice } = useShop();
    const { requireAuth } = useAuthGuard();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter and Sort States
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('featured');

    // Available options
    const [categories, setCategories] = useState<string[]>([]);
    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    const sortOptions = [
        { value: 'featured' as SortOption, label: 'Featured' },
        { value: 'price-low' as SortOption, label: 'Price: Low to High' },
        { value: 'price-high' as SortOption, label: 'Price: High to Low' },
        { value: 'newest' as SortOption, label: 'Newest First' },
        { value: 'name-az' as SortOption, label: 'Name: A-Z' }
    ];

    // Fetch search results
    useEffect(() => {
        logger.info('Page Mounted: SearchResultsPage', { query });
        const fetchResults = async () => {
            if (!query) {
                setProducts([]);
                setFilteredProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await api.get(API_ENDPOINTS.PRODUCTS.SEARCH, { params: { q: query, limit: 100 } });
                const rawData = response.data.data || response.data || [];
                const normalizedData = rawData.map((p: any) => ({
                    ...p,
                    title: p.name || p.title || '',
                    category: p.Category?.name || p.category || '',
                    image: p.featured_image || p.image || (p.images && p.images[0]?.image_url) || ''
                }));
                setProducts(normalizedData);
                setFilteredProducts(normalizedData);

                // Extract unique categories from results
                const uniqueCategories = [...new Set(normalizedData.map((p: any) => p.category).filter(Boolean))];
                setCategories(uniqueCategories as string[]);

                // Firebase Analytics: View Search Results
                firebaseAnalytics.logEvent('view_search_results', {
                    search_term: query,
                    number_of_matches: normalizedData.length
                });

            } catch (err: any) {
                logger.error("Search error", { error: err, query });
                setError(err.response?.data?.message || 'Search failed');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    // Apply filters and sorting
    useEffect(() => {
        let result = [...products];

        // Filter by category
        if (selectedCategory) {
            result = result.filter(p => (p as any).category === selectedCategory);
        }

        // Filter by price range
        result = result.filter(p => {
            const price = (p as any).sale_price || (p as any).base_price || 0;
            return price >= priceRange[0] && price <= priceRange[1];
        });

        // Filter by size
        if (selectedSizes.length > 0) {
            result = result.filter(p =>
                p.variants && p.variants.some(v =>
                    v.Size && (selectedSizes.includes(v.Size.code) || selectedSizes.includes(v.Size.name))
                )
            );
        }

        // Sort
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => {
                    const priceA = (a as any).sale_price || (a as any).base_price || 0;
                    const priceB = (b as any).sale_price || (b as any).base_price || 0;
                    return priceA - priceB;
                });
                break;
            case 'price-high':
                result.sort((a, b) => {
                    const priceA = (a as any).sale_price || (a as any).base_price || 0;
                    const priceB = (b as any).sale_price || (b as any).base_price || 0;
                    return priceB - priceA;
                });
                break;
            case 'name-az':
                result.sort((a, b) => {
                    const nameA = (a.name || a.title || '').toLowerCase();
                    const nameB = (b.name || b.title || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                break;
            case 'newest':
                result.sort((a, b) => {
                    const dateA = new Date((a as any).createdAt || 0).getTime();
                    const dateB = new Date((b as any).createdAt || 0).getTime();
                    return dateB - dateA;
                });
                break;
            default:
                // Featured - keep original order
                break;
        }

        setFilteredProducts(result);
    }, [products, selectedCategory, priceRange, selectedSizes, sortBy]);

    const toggleSize = (size: string) => {
        setSelectedSizes(prev =>
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        );
    };

    const clearFilters = () => {
        setSelectedCategory(null);
        setPriceRange([0, 500000]);
        setSelectedSizes([]);
        setSortBy('featured');
    };

    const activeFiltersCount =
        (selectedCategory ? 1 : 0) +
        (selectedSizes.length > 0 ? 1 : 0) +
        (priceRange[0] > 0 || priceRange[1] < 500000 ? 1 : 0);

    if (error) {
        return (
            <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 font-serif text-xl mb-4">Error: {error}</p>
                    <Link to="/shop" className="text-stone-900 underline text-sm uppercase tracking-widest">
                        Browse All Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6">
            <SEO
                title={query ? `Search Results for "${query}"` : "Search Products"}
                description={query ? `View search results for "${query}" at Ruvera Couture.` : "Search for luxury fashion products at Ruvera Couture."}
                keywords={`search, products, ${query}, luxury fashion`}
            />
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="font-serif text-4xl md:text-5xl text-midnight mb-2">
                        Search Results
                    </h1>
                    {query && (
                        <p className="text-stone-500 font-light">
                            Showing {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "{query}"
                        </p>
                    )}
                </motion.div>

                {/* Filters and Sort Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-stone-200">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg hover:border-ruvera-gold transition-colors"
                        >
                            <SlidersHorizontal size={16} />
                            <span className="text-sm">Filters</span>
                            {activeFiltersCount > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-ruvera-gold text-white text-xs rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>

                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-stone-500 hover:text-ruvera-gold transition-colors uppercase tracking-widest"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs uppercase tracking-widest text-stone-500">Sort By:</span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="appearance-none bg-white border border-stone-200 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:border-ruvera-gold cursor-pointer"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-lg p-6 mb-8 border border-stone-200"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Category Filter */}
                            {categories.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium uppercase tracking-widest text-stone-900 mb-4">
                                        Category
                                    </h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setSelectedCategory(null)}
                                            className={`block w-full text-left px-3 py-2 rounded transition-colors ${!selectedCategory
                                                ? 'bg-ruvera-gold/10 text-ruvera-gold'
                                                : 'text-stone-600 hover:bg-stone-50'
                                                }`}
                                        >
                                            <span className="text-sm">All Categories</span>
                                        </button>
                                        {categories.map(category => (
                                            <button
                                                key={category}
                                                onClick={() => setSelectedCategory(category)}
                                                className={`block w-full text-left px-3 py-2 rounded transition-colors ${selectedCategory === category
                                                    ? 'bg-ruvera-gold/10 text-ruvera-gold'
                                                    : 'text-stone-600 hover:bg-stone-50'
                                                    }`}
                                            >
                                                <span className="text-sm">{category}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Filter */}
                            <div>
                                <h3 className="text-sm font-medium uppercase tracking-widest text-stone-900 mb-4">
                                    Size
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {availableSizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => toggleSize(size)}
                                            className={`w-12 h-12 rounded-full border transition-all ${selectedSizes.includes(size)
                                                ? 'border-ruvera-gold bg-ruvera-gold text-white'
                                                : 'border-stone-300 text-stone-600 hover:border-stone-900'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div>
                                <h3 className="text-sm font-medium uppercase tracking-widest text-stone-900 mb-4">
                                    Price Range
                                </h3>
                                <div className="space-y-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="500000"
                                        step="5000"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-sm text-stone-600">
                                        <span>{formatPrice(priceRange[0])}</span>
                                        <span>{formatPrice(priceRange[1])}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Results */}
                {loading ? (
                    <div className="flex items-center justify-center py-40">
                        <div className="text-xl font-serif text-ruvera-gold animate-pulse">Searching...</div>
                    </div>
                ) : !query ? (
                    <div className="text-center py-40">
                        <p className="text-stone-400 font-serif italic text-lg mb-4">
                            Enter a search query to find products
                        </p>
                        <Link to="/shop" className="text-stone-900 underline text-xs uppercase tracking-widest">
                            Browse All Products
                        </Link>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-40">
                        <p className="text-stone-400 font-serif italic text-lg mb-4">
                            No products found matching your criteria
                        </p>
                        <button
                            onClick={clearFilters}
                            className="text-stone-900 underline text-xs uppercase tracking-widest"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-20 gap-x-8">
                        {filteredProducts.map((product, index) => {
                            const shape = organicShapes[index % organicShapes.length];
                            const isWishlisted = isInWishlist(product.id);

                            // Map backend fields
                            const displayTitle = (product as any).name || product.title;
                            const displayImage = (product as any).image;
                            const displayPrice = (product as any).sale_price
                                ? formatPrice((product as any).sale_price)
                                : ((product as any).base_price ? formatPrice((product as any).base_price) : (typeof product.price === 'number' ? formatPrice(product.price) : product.price));
                            const displayId = (product as any).slug || product.id;

                            // Check if product has any stock across all variants
                            const hasStock = (product as any).variants?.some((v: any) =>
                                v.Inventory && (v.Inventory.quantity - v.Inventory.reserved_quantity) > 0
                            ) ?? true; // Default to true if no variant info

                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
                                >
                                    <div className="group block h-full relative">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (!requireAuth({ action: 'wishlist' })) return;
                                                toggleWishlist(product);
                                            }}
                                            className={`absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-all duration-300 ${isWishlisted ? 'text-red-500' : 'text-stone-400 hover:text-stone-900'
                                                }`}
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

                                                    {/* Sold Out Badge */}
                                                    {!hasStock && (
                                                        <div className="absolute top-4 left-4 bg-stone-900/90 text-white px-3 py-1 text-xs uppercase tracking-widest font-medium">
                                                            Sold Out
                                                        </div>
                                                    )}
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
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;
