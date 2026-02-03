import { Metadata } from 'next';
import ShopClient from './ShopClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Shop All | Ruvéra Couture',
    description: 'Explore our latest collection of avant-garde luxury fashion. Shop Ruvéra Couture today.',
    keywords: 'fashion, online shop, luxury clothing, boutique',
};

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-beige-bg animate-pulse" />}>
            <ShopClient />
        </Suspense>
    );
}
