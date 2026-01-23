import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CartDrawer: React.FC = () => {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart } = useShop();
    const { user, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#FDFBF7] shadow-2xl z-[70] flex flex-col border-l border-stone-200"
                    >
                        <div className="p-6 flex items-center justify-between border-b border-stone-100">
                            <h2 className="text-2xl font-serif text-stone-800 italic">Your Selection</h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                            >
                                <X size={24} className="text-stone-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-stone-400">
                                    <ShoppingBag size={48} className="mb-4 opacity-20" />
                                    <p className="font-light tracking-wider uppercase text-sm">Your cart is empty</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={`${item.code}-${index}`}
                                        className="flex gap-4"
                                    >
                                        <div className="w-24 h-32 bg-stone-200 rounded-sm overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-stone-300 flex items-center justify-center text-stone-400 text-xs">
                                                    Img
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="font-serif text-lg text-stone-800">{item.title}</h3>
                                                <p className="text-[10px] tracking-widest text-stone-500 uppercase mt-1">Code: {item.code}</p>
                                                <p className="text-xs text-stone-600 mt-1">Size: M</p>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-medium text-stone-900">{item.price}</span>
                                                <button
                                                    onClick={() => removeFromCart(index)}
                                                    className="text-[10px] uppercase tracking-wider text-stone-400 hover:text-red-400 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div className="p-6 border-t border-stone-100 space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-serif text-lg text-stone-600">Subtotal</span>
                                <span className="font-medium text-xl text-stone-900">₹0.00</span>
                            </div>
                            <button
                                onClick={() => {
                                    if (!user) {
                                        signInWithGoogle();
                                    } else {
                                        setIsCartOpen(false);
                                        navigate('/cart');
                                    }
                                }}
                                className="block w-full text-center bg-stone-900 text-[#FDFBF7] py-4 text-sm font-medium tracking-[0.2em] uppercase hover:bg-ruvera-gold transition-colors duration-500"
                            >
                                {user ? "Checkout" : "Sign In to Checkout"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
