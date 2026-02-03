'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, Menu, Heart, User, X } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import CartDrawer from '../cart/CartDrawer';
// import SearchOverlay from '../SearchOverlay'; // TODO: Migrate in Phase 3
import logo from '../../assets/ruvera_logo.svg';

const Navbar: React.FC = () => {
    const { setIsCartOpen, setIsSearchOpen, cart, wishlist } = useShop();
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 left-0 w-full px-6 md:px-12 py-6 flex justify-between items-center z-50 bg-transparent pointer-events-none">

                {/* Left: Logo */}
                <div className="pointer-events-auto">
                    <Link href="/">
                        <Image
                            src={logo}
                            alt="Ruvéra Couture"
                            width={160}
                            height={40}
                            className="w-auto h-8 md:h-10 mix-blend-multiply"
                            style={{ height: 'auto' }}
                        />
                    </Link>
                </div>

                {/* Right: Navigation & Icons */}
                <div className="pointer-events-auto flex items-center gap-8 md:gap-12">

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-xs font-normal tracking-wide text-stone-800">
                        <Link href="/shop" className="hover:text-ruvera-gold transition-colors">New Arrivals</Link>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-6 text-stone-800">
                        <button onClick={() => setIsSearchOpen(true)} className="hover:text-ruvera-gold transition-colors">
                            <Search size={18} strokeWidth={1.5} />
                        </button>

                        {/* Wishlist - Only when signed in */}
                        {user && (
                            <Link href="/wishlist" className="relative hover:text-ruvera-gold transition-colors hidden md:block">
                                <Heart size={18} strokeWidth={1.5} />
                                {wishlist.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-ruvera-gold rounded-full" />
                                )}
                            </Link>
                        )}

                        {/* Profile - Only when signed in */}
                        {user ? (
                            <Link href="/profile" className="hover:text-ruvera-gold transition-colors hidden md:block">
                                {user.photoURL ? (
                                    <Image
                                        src={user.photoURL}
                                        alt={user.displayName || 'Profile'}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full border border-stone-200 p-0.5 object-cover"
                                    />
                                ) : (
                                    <User size={18} strokeWidth={1.5} />
                                )}
                            </Link>
                        ) : (
                            /* Sign In - Only when guest */
                            <Link href="/login" className="hover:text-ruvera-gold transition-colors hidden md:block group flex items-center gap-2">
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
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden">
                            <Menu size={24} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Drawer */}
            <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Menu Panel */}
                <div className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-6 border-b border-stone-200">
                        <h2 className="text-lg font-light tracking-wide text-stone-800">Menu</h2>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-stone-600 hover:text-stone-900 transition-colors"
                        >
                            <X size={24} strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* Menu Content */}
                    <div className="px-6 py-8 space-y-6">
                        {/* Navigation Links */}
                        <div className="space-y-4">
                            <Link
                                href="/shop"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-base font-light tracking-wide text-stone-800 hover:text-ruvera-gold transition-colors"
                            >
                                New Arrivals
                            </Link>

                        </div>

                        {/* Divider */}
                        <div className="border-t border-stone-200" />

                        {/* User Actions */}
                        <div className="space-y-4">
                            {user ? (
                                <>
                                    {/* Profile */}
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 text-base font-light tracking-wide text-stone-800 hover:text-ruvera-gold transition-colors"
                                    >
                                        {user.photoURL ? (
                                            <Image
                                                src={user.photoURL}
                                                alt={user.displayName || 'Profile'}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full border border-stone-200 object-cover"
                                            />
                                        ) : (
                                            <User size={20} strokeWidth={1.5} />
                                        )}
                                        <span>Profile</span>
                                    </Link>

                                    {/* Wishlist */}
                                    <Link
                                        href="/wishlist"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 text-base font-light tracking-wide text-stone-800 hover:text-ruvera-gold transition-colors"
                                    >
                                        <Heart size={20} strokeWidth={1.5} />
                                        <span>Wishlist</span>
                                        {wishlist.length > 0 && (
                                            <span className="ml-auto text-xs text-ruvera-gold">
                                                {wishlist.length}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            ) : (
                                /* Sign In for guests */
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 text-base font-light tracking-wide text-stone-800 hover:text-ruvera-gold transition-colors"
                                >
                                    <User size={20} strokeWidth={1.5} />
                                    <span>Sign In</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <CartDrawer />
            {/* Note: SearchOverlay is deliberately omitted for now as it is part of future tasks */}        </>
    );
};

export default Navbar;
