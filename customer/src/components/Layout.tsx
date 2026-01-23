import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag, Search, Menu, Heart, User } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import CartDrawer from './CartDrawer';
import SearchOverlay from './SearchOverlay';
import BreezeLeaf from './BreezeLeaf';
import logo from '../assets/ruvera_logo.png';

const Layout: React.FC = () => {
    const { setIsCartOpen, setIsSearchOpen, cart, wishlist } = useShop();
    const { user } = useAuth();

    return (
        <div className="relative min-h-screen bg-beige-bg">
            <BreezeLeaf />

            {/* Header/Nav */}
            <nav className="fixed top-0 left-0 w-full px-6 md:px-12 py-6 flex justify-between items-center z-50 bg-transparent pointer-events-none">

                {/* Left: Logo */}
                <div className="pointer-events-auto">
                    <Link to="/">
                        <img src={logo} alt="Ruvéra Couture" className="w-28 md:w-40 h-auto mix-blend-multiply" />
                    </Link>
                </div>

                {/* Right: Navigation & Icons */}
                <div className="pointer-events-auto flex items-center gap-8 md:gap-12">

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-xs font-normal tracking-wide text-stone-800">
                        <Link to="/shop" className="hover:text-ruvera-gold transition-colors">New Arrivals</Link>
                        <Link to="/about" className="hover:text-ruvera-gold transition-colors">About</Link>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-6 text-stone-800">
                        <button onClick={() => setIsSearchOpen(true)} className="hover:text-ruvera-gold transition-colors">
                            <Search size={18} strokeWidth={1.5} />
                        </button>

                        {/* Wishlist - Only when signed in */}
                        {user && (
                            <Link to="/wishlist" className="relative hover:text-ruvera-gold transition-colors hidden md:block">
                                <Heart size={18} strokeWidth={1.5} />
                                {wishlist.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-ruvera-gold rounded-full" />
                                )}
                            </Link>
                        )}

                        {/* Profile - Only when signed in */}
                        {user ? (
                            <Link to="/profile" className="hover:text-ruvera-gold transition-colors hidden md:block">
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || 'Profile'}
                                        className="w-8 h-8 rounded-full border border-stone-200 p-0.5 object-cover"
                                    />
                                ) : (
                                    <User size={18} strokeWidth={1.5} />
                                )}
                            </Link>
                        ) : (
                            /* Sign In - Only when guest */
                            <Link to="/login" className="hover:text-ruvera-gold transition-colors hidden md:block group flex items-center gap-2">
                                <span className="text-xs uppercase tracking-widest hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity -mr-1">Sign In</span>
                                <User size={18} strokeWidth={1.5} />
                            </Link>
                        )}

                        {/* Cart - Only when signed in and has items */}
                        {user && cart.length > 0 && (
                            <button onClick={() => setIsCartOpen(true)} className="relative hover:text-ruvera-gold transition-colors">
                                <ShoppingBag size={18} strokeWidth={1.5} />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-ruvera-gold rounded-full" />
                            </button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button className="md:hidden">
                            <Menu size={24} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <main className="pt-10 min-h-screen">
                <Outlet />
            </main>

            {/* Overlays */}
            <CartDrawer />
            <SearchOverlay />
        </div>
    );
};

export default Layout;
