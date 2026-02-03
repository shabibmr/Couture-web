import { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import LiquidGallery from '@/components/home/LiquidGallery';

export const metadata: Metadata = {
    title: 'Home | Ruvéra Couture',
    description: 'Discover the latest in everyday elegance with Ruvera Couture. Shop our exclusive collection.',
    keywords: 'fashion, couture, everyday elegance, clothing',
};

export default function HomePage() {
    return (
        <div className="bg-beige-bg min-h-screen">
            <Hero />
            <section className="bg-gradient-to-b from-beige-bg to-white py-10">
                <LiquidGallery />
            </section>
        </div>
    );
}
