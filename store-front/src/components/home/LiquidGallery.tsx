'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { API_ENDPOINTS } from '@/config/api.config';
import api from '@/services/api.service';

const organicShapes = [
    "50% 50% 40% 60% / 60% 50% 60% 40%", // Blob 1
    "30% 70% 70% 30% / 30% 30% 70% 70%", // Blob 2
    "60% 40% 30% 70% / 60% 30% 70% 40%", // Blob 3
    "40% 60% 70% 30% / 40% 50% 60% 50%", // Blob 4
];

interface ProductCardProps extends Product {
    index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, title, name, code, price, sale_price, base_price, image, featured_image, index }) => {
    const shape = organicShapes[index % organicShapes.length];

    // Handle different field names from backend/frontend mismatch
    const displayTitle = name || title;
    const displayImage = image;
    const displayPrice = sale_price ? `₹${sale_price}` : (base_price ? `₹${base_price}` : price);

    return (
        <Link href={`/product/${id}`}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group flex flex-col items-center text-center w-full cursor-pointer"
            >
                <div className="relative w-full max-w-[280px] aspect-[3/5] mb-6 filter drop-shadow-xl transition-transform duration-500 group-hover:scale-105">
                    {/* Liquid Shape Mask */}
                    <div
                        style={{ borderRadius: shape }}
                        className="w-full h-full bg-stone-200 overflow-hidden relative shadow-inner bg-gradient-to-br from-stone-200 to-stone-300"
                    >
                        <Image
                            src={displayImage}
                            alt={displayTitle}
                            fill
                            className="object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        />
                        {/* Glossy Overlay for "Liquid" feel */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-xs font-bold tracking-widest text-stone-800 uppercase group-hover:text-ruvera-gold transition-colors">{displayTitle}</h3>
                    <div className="flex flex-col gap-0.5">
                        {code && <p className="text-[10px] text-stone-500 tracking-wider">| CODE: {code} |</p>}
                        <p className="text-[10px] text-stone-800 font-medium tracking-wider">PRICE: {displayPrice}</p>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}

const LiquidGallery: React.FC = () => {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch featured products
                const featuredResp = await api.get(API_ENDPOINTS.PRODUCTS.LIST, {
                    params: { is_featured: true, limit: 8 }
                });

                // Fetch new arrivals
                const newArrivalsResp = await api.get(API_ENDPOINTS.PRODUCTS.LIST, {
                    params: { is_new_arrival: true, limit: 4 }
                });

                if (featuredResp.data) {
                    const data = featuredResp.data.data || featuredResp.data;
                    setFeaturedProducts((Array.isArray(data) ? data : []).map((p: Record<string, unknown>) => ({
                        ...p,
                        image: (p.image as string) || (p.featured_image as string) || ''
                    })) as Product[]);
                }

                if (newArrivalsResp.data) {
                    const data = newArrivalsResp.data.data || newArrivalsResp.data;
                    setNewArrivals((Array.isArray(data) ? data : []).map((p: Record<string, unknown>) => ({
                        ...p,
                        image: (p.image as string) || (p.featured_image as string) || ''
                    })) as Product[]);
                }
            } catch (error) {
                console.error("Failed to fetch products for gallery", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="py-20 text-center text-stone-400 font-serif">Loading collection...</div>;
    }

    return (
        <div className="relative pb-40 px-8 pt-10">
            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column - Headline & Main Grid (Featured Products) */}
                    <div className="lg:col-span-8">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="text-6xl md:text-8xl font-serif text-ruvera-gold mb-16 leading-[0.9]"
                        >
                            <span className="block font-normal">Your Everyday</span>
                            <span className="block italic font-light ml-12">Élégance</span>
                        </motion.h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-16 gap-x-4">
                            {featuredProducts.slice(0, 4).map((p, i) => (
                                <ProductCard key={p.id || i} index={i} {...p} />
                            ))}
                            {featuredProducts.slice(4, 8).map((p, i) => (
                                <ProductCard key={p.id || i + 4} index={i + 4} {...p} />
                            ))}
                        </div>
                    </div>

                    {/* Right Column - "New Arrivals" & Data Grid */}
                    <div className="lg:col-span-4 flex flex-col pt-12">
                        <motion.h2
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="text-5xl md:text-6xl font-serif text-ruvera-gold mb-12 leading-[0.9] text-right"
                        >
                            <span className="block font-normal uppercase">New</span>
                            <span className="block font-normal uppercase">Arrivals</span>
                        </motion.h2>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {newArrivals.slice(0, 4).map((p, i) => (
                                <ProductCard key={p.id || i} index={i} {...p} />
                            ))}
                            {/* Fill empty slots with placeholders if needed */}
                            {newArrivals.length === 0 && (
                                <>
                                    <div className="aspect-[2/5] bg-stone-200 hidden md:block" />
                                    <div className="aspect-[2/5] bg-stone-200 hidden md:block" />
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LiquidGallery;
