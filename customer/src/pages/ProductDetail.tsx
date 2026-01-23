import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import { API_ENDPOINTS } from '../config/api.config';
import api from '../services/api.service';

// Organic shapes for related products
const organicShapes = [
    "50% 50% 40% 60% / 60% 50% 60% 40%",
    "30% 70% 70% 30% / 30% 30% 70% 70%",
    "60% 40% 30% 70% / 60% 30% 70% 40%",
    "40% 60% 70% 30% / 40% 50% 60% 50%",
];

interface Review {
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
    verified: boolean;
}

const ProductDetail: React.FC = () => {
    const { id: productSlug } = useParams<{ id: string }>();
    const { addToCart, toggleWishlist, isInWishlist } = useShop();
    const [selectedSize, setSelectedSize] = useState<string>('M');
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Mock reviews (would come from backend in production)
    const [reviews] = useState<Review[]>([
        {
            id: '1',
            author: 'Priya Sharma',
            rating: 5,
            date: '2026-01-15',
            comment: 'Absolutely stunning piece! The craftsmanship is exceptional and the fit is perfect. Worth every rupee.',
            verified: true
        },
        {
            id: '2',
            author: 'Raj Malhotra',
            rating: 5,
            date: '2026-01-10',
            comment: 'Exceeded my expectations. The quality of the fabric and the attention to detail is remarkable.',
            verified: true
        },
        {
            id: '3',
            author: 'Ananya Desai',
            rating: 4,
            date: '2026-01-08',
            comment: 'Beautiful design and comfortable to wear. Delivery was prompt and packaging was elegant.',
            verified: true
        }
    ]);

    const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    React.useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.PRODUCTS.BY_SLUG(productSlug || ''));
                setProduct(response.data);

                // Fetch related products (same category)
                if (response.data.category) {
                    const relatedResponse = await api.get(API_ENDPOINTS.PRODUCTS.LIST, {
                        params: { category: response.data.category }
                    });
                    // Filter out current product and limit to 4
                    const filtered = relatedResponse.data
                        .filter((p: Product) => p.id !== response.data.id)
                        .slice(0, 4);
                    setRelatedProducts(filtered);
                }
            } catch (err: any) {
                console.error("Fetch product detail error:", err);
                setError(err.response?.data?.message || 'Product not found');
            } finally {
                setLoading(false);
            }
        };

        if (productSlug) {
            fetchProduct();
        }
    }, [productSlug]);

    if (loading) {
        return (
            <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
                <div className="text-xl font-serif text-ruvera-gold animate-pulse">Revealing Masterpiece...</div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
                <div className="text-xl font-serif text-red-500">Error: {error || 'Product not found'}</div>
            </div>
        );
    }

    const isWishlisted = isInWishlist(product.id);

    // Map backend fields
    const displayTitle = product.name || product.title;
    const displayImage = product.featured_image || product.image;
    const displayPrice = product.sale_price ? `₹${product.sale_price}` : (product.base_price ? `₹${product.base_price}` : product.price);
    const displayCode = product.code || product.slug || 'N/A';
    const displayDescription = product.description || 'No description available.';
    const displaySizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];

    return (
        <div className="bg-beige-bg">
            <div className="container mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-32">
                    {/* Product Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full h-full bg-stone-200 overflow-hidden relative shadow-2xl"
                    >
                        <img
                            src={displayImage}
                            alt={displayTitle}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                    </motion.div>

                    {/* Product Bio */}
                    <div className="flex flex-col justify-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-serif text-stone-900 mb-4"
                        >
                            {displayTitle}
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-4 mb-8"
                        >
                            <span className="text-xl font-medium text-stone-800">{displayPrice}</span>
                            <span className="text-xs text-stone-500 tracking-widest uppercase">| Code: {displayCode}</span>
                        </motion.div>

                        {/* Rating */}
                        {reviews.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.25 }}
                                className="flex items-center gap-2 mb-6"
                            >
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={i < Math.round(averageRating) ? 'fill-ruvera-gold text-ruvera-gold' : 'text-stone-300'}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-stone-600">
                                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                                </span>
                            </motion.div>
                        )}

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-stone-600 font-light leading-relaxed mb-10 max-w-md"
                        >
                            {displayDescription}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mb-10"
                        >
                            <span className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-4">Select Size</span>
                            <div className="flex gap-4">
                                {displaySizes.map((size: string) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-12 h-12 flex items-center justify-center border rounded-full text-sm transition-all duration-300 ${selectedSize === size
                                            ? 'border-stone-900 bg-stone-900 text-white'
                                            : 'border-stone-300 text-stone-600 hover:border-stone-900'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex gap-4"
                        >
                            <button
                                onClick={() => addToCart({ ...product, selectedSize } as any)}
                                className="bg-stone-900 text-white px-8 py-4 flex-1 flex items-center justify-center gap-3 tracking-[0.2em] uppercase text-xs font-medium hover:bg-ruvera-gold transition-colors duration-500 shadow-xl"
                            >
                                <ShoppingBag size={18} />
                                Add to Bag
                            </button>

                            <button
                                onClick={() => toggleWishlist(product)}
                                className={`p-4 border border-stone-200 hover:border-stone-900 transition-colors ${isWishlisted ? 'text-red-500' : 'text-stone-400'}`}
                            >
                                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-12 pt-12 border-t border-stone-100 grid grid-cols-2 gap-8 text-[10px] tracking-widest uppercase text-stone-400 font-medium"
                        >
                            <div>
                                <span className="block text-stone-900 mb-2">Composition</span>
                                100% Sustainable Linen
                            </div>
                            <div>
                                <span className="block text-stone-900 mb-2">Care</span>
                                Professional Clean Only
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Reviews Section */}
                {reviews.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mt-32"
                    >
                        <h2 className="font-serif text-4xl text-midnight mb-12 text-center">Customer Reviews</h2>

                        <div className="max-w-4xl mx-auto space-y-6">
                            {reviews.map((review, index) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white p-8 rounded-xl shadow-sm border border-stone-100"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <p className="font-medium text-midnight">{review.author}</p>
                                                {review.verified && (
                                                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                                        Verified Purchase
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className={i < review.rating ? 'fill-ruvera-gold text-ruvera-gold' : 'text-stone-300'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-xs text-stone-400">
                                            {new Date(review.date).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-stone-600 font-light leading-relaxed">{review.comment}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mt-32"
                    >
                        <h2 className="font-serif text-4xl text-midnight mb-12 text-center">You May Also Like</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map((relatedProduct, index) => {
                                const shape = organicShapes[index % organicShapes.length];
                                const isRelatedWishlisted = isInWishlist(relatedProduct.id);
                                const relatedTitle = (relatedProduct as any).name || relatedProduct.title;
                                const relatedImage = (relatedProduct as any).featured_image || relatedProduct.image;
                                const relatedPrice = (relatedProduct as any).sale_price
                                    ? `₹${(relatedProduct as any).sale_price.toLocaleString('en-IN')}`
                                    : ((relatedProduct as any).base_price ? `₹${(relatedProduct as any).base_price.toLocaleString('en-IN')}` : relatedProduct.price);
                                const relatedId = (relatedProduct as any).slug || relatedProduct.id;

                                return (
                                    <motion.div
                                        key={relatedProduct.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="group block h-full relative">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleWishlist(relatedProduct);
                                                }}
                                                className={`absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-all duration-300 ${isRelatedWishlisted ? 'text-red-500' : 'text-stone-400 hover:text-stone-900'
                                                    }`}
                                            >
                                                <Heart size={18} fill={isRelatedWishlisted ? "currentColor" : "none"} />
                                            </button>

                                            <Link to={`/product/${relatedId}`}>
                                                <div className="relative aspect-[3/4] mb-6 w-full">
                                                    <div
                                                        style={{ borderRadius: shape }}
                                                        className="w-full h-full bg-stone-200 overflow-hidden relative shadow-lg group-hover:shadow-xl transition-all duration-500"
                                                    >
                                                        <img
                                                            src={relatedImage}
                                                            alt={relatedTitle}
                                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                                    </div>
                                                </div>

                                                <div className="text-center px-4">
                                                    <h3 className="font-serif text-xl text-midnight group-hover:text-ruvera-gold transition-colors duration-300">
                                                        {relatedTitle}
                                                    </h3>
                                                    <p className="text-xs font-bold tracking-widest text-stone-400 uppercase mt-2">
                                                        {relatedPrice}
                                                    </p>
                                                </div>
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
