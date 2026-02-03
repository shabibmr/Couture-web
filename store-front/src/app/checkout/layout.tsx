import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function CheckoutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-beige-bg">
            {/* Minimal Header */}
            <header className="bg-white border-b border-stone-100 py-6 px-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="font-serif text-2xl tracking-tighter text-midnight">
                        RUVERA<span className="text-ruvera-gold">.</span>
                    </Link>
                    <div className="flex items-center gap-2 text-stone-400 text-sm font-light">
                        <Lock size={14} />
                        Secure Checkout
                    </div>
                </div>
            </header>

            <main>
                {children}
            </main>

            {/* Minimal Footer */}
            <footer className="py-12 px-6 border-t border-stone-200 mt-20">
                <div className="max-w-7xl mx-auto text-center text-stone-400 text-xs font-light tracking-widest uppercase">
                    &copy; {new Date().getFullYear()} Ruvera Couture. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}
