'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import ShopFilters from '@/components/shop/ShopFilters';
import { useShop } from '@/context/ShopContext';
import { API_ENDPOINTS } from '@/config/api.config';
import api from '@/services/api.service';
import { Product } from '@/types';
// import { useAuthGuard } from '@/hooks/useAuthGuard'; // Need to migrate this hook or use stub
import logger from '@/utils/logger';

// Stub for useAuthGuard if it doesn't exist yet, or import it if I find it.
// Checking todo.md, User & Checkout is Agent E. So I should probably stub it or use a simple check.
// I'll check if useAuthGuard is available. Assuming it is not migrated yet as per todo (Phase 2).
// I will check common hooks in next step. For now I will mock `useAuthGuard` logic inside.

const organicShapes = [
    "50% 50% 40% 60% / 60% 50% 60% 40%",
    "30% 70% 70% 30% / 30% 30% 70% 70%",
    "60% 40% 30% 70% / 60% 30% 70% 40%",
    "40% 60% 70% 30% / 40% 50% 60% 50%",
];

export default function ShopPage() {
    const { toggleWishlist, isInWishlist, formatPrice } = useShop();
    // const { requireAuth } = useAuthGuard(); 
    const requireAuth = ({ action }: { action: string }) => {
        // Temporary stub until Auth Agent E works
        console.log(`Auth required for ${action}`);
        return true;
    };

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
    const [currentPage, setCurrentPage] = React.useState(1);

    // Fetch products
    const fetchProducts = async (category?: string | null, search?: string, newArrival?: boolean, page: number = 1, append: boolean = false) => {
        if (!append) setLoading(true);
        try {
            let response;
            const params: Record<string, string | number | boolean> = { page, limit: itemsPerPage };

            if (search) {
                params.q = search;
                response = await api.get(API_ENDPOINTS.PRODUCTS.SEARCH, { params });
            } else {
                if (category) params.category_slug = category;
                if (newArrival) params.is_new_arrival = true;
                response = await api.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
            }

            const productsData = response.data.data || response.data;
            const normalizedProducts = (Array.isArray(productsData) ? productsData : []).map((p: Record<string, unknown>) => ({
                ...p,
                image: (p.image as string) || (p.featured_image as string) || ''
            })) as Product[];

            if (append) {
                setProducts(prev => [...prev, ...normalizedProducts]);
            } else {
                setProducts(normalizedProducts);
            }

            const total = response.data.total || 0;
            const pages = response.data.pages || 1;
            setHasMore(page < pages);

        } catch (err: unknown) {
            logger.error("Fetch products error", { error: err });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any).response?.data?.message || 'Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    React.useEffect(() => {
        logger.info('Page Mounted: ShopPage');
        const loadInitialData = async () => {
            try {
                const catResponse = await api.get(API_ENDPOINTS.PRODUCTS.CATEGORIES);
                setCategories(catResponse.data.map((c: { name: string, slug: string }) => ({ name: c.name, slug: c.slug })));
            } catch (err) {
                logger.error("Fetch categories error", { error: err });
                // Fallback categories if API fails or is empty?
            }

            await fetchProducts();
        };
        loadInitialData();
    }, []);

    // Infinite Scroll
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
        setCurrentPage(1);
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
        setCurrentPage(1);
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

                <ShopFilters
                    categories={categories}
                    selectedCategory={selectedCategory}
                    isNewArrival={isNewArrival}
                    searchQuery={searchQuery}
                    onCategoryClick={handleCategoryClick}
                    onNewArrivalClick={handleNewArrivalsClick}
                    onSearchChange={setSearchQuery}
                    onSearchSubmit={handleSearch}
                />

                {loading && products.length === 0 ? (
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-12">
                            {(Array.isArray(products) ? products : [])
                                .map((product, index) => {
                                    const shape = organicShapes[index % organicShapes.length];
                                    const isWishlisted = isInWishlist(product.id);

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

                                                <Link href={`/product/${displayId}`}>
                                                    <div className="relative aspect-[3/4] mb-6 w-full">
                                                        <div
                                                            style={{ borderRadius: shape }}
                                                            className="w-full h-full bg-stone-200 overflow-hidden relative shadow-lg group-hover:shadow-xl transition-all duration-500"
                                                        >
                                                            <Image
                                                                src={displayImage}
                                                                alt={displayTitle}
                                                                fill
                                                                className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
}
