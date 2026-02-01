import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import SEO from '../components/SEO';
import { useShop } from '../context/ShopContext';
import logger from '../utils/logger';

const WishlistPage: React.FC = () => {
    const { wishlist, removeFromWishlist, addToCart, formatPrice } = useShop();

    React.useEffect(() => {
        logger.info('Page Mounted: WishlistPage', { wishlistCount: wishlist.length });
    }, []);

    return (
        <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6">
            <SEO
                title="Wishlist"
                description="Save your favorite Ruvera Couture items for later. Create your personalized collection of luxury fashion."
                keywords="wishlist, saved items, luxury fashion, favorites"
            />
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">Your Wishlist</h1>
                    <p className="text-stone-500 font-light">
                        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
                    </p>
                </motion.div>

                {wishlist.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-stone-400 text-lg mb-8 font-light italic">Your heart is empty, but our collection is full.</p>
                        <Link
                            to="/shop"
                            className="inline-block px-8 py-3 bg-stone-900 text-white font-medium tracking-[0.2em] uppercase hover:bg-ruvera-gold transition-colors duration-300"
                        >
                            Explore Collection
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        <AnimatePresence>
                            {wishlist.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative"
                                >
                                    <div className="relative aspect-[3/4] mb-4 bg-stone-200 overflow-hidden">
                                        <Link to={`/product/${product.slug || product.id}`} className="block w-full h-full">
                                            <img
                                                src={product.image}
                                                alt={product.name || product.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </Link>

                                        <button
                                            onClick={() => removeFromWishlist(product.id)}
                                            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-400 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                                        >
                                            <X size={16} />
                                        </button>

                                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90 backdrop-blur-md">
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold text-stone-900 hover:text-ruvera-gold transition-colors"
                                            >
                                                <ShoppingBag size={14} />
                                                Add to Bag
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <Link to={`/product/${product.slug || product.id}`}>
                                            <h3 className="font-serif text-lg text-midnight hover:text-ruvera-gold transition-colors">
                                                {product.name || product.title}
                                            </h3>
                                        </Link>
                                        <p className="text-xs font-bold tracking-widest text-stone-400 uppercase mt-1">
                                            {typeof product.price === 'number' ? formatPrice(product.price) : product.price}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
