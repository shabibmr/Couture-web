import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import LiquidGallery from '../components/LiquidGallery';
import Footer from '../components/Footer';
import { Banner } from '../types';
import { API_ENDPOINTS } from '../config/api.config';
import api from '../services/api.service';
import logger from '../utils/logger';

const HomePage: React.FC = () => {
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef as React.RefObject<HTMLElement>,
        offset: ["start start", "end start"]
    });
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    const [banner, setBanner] = React.useState<Banner | null>(null);

    React.useEffect(() => {
        logger.info('Page Mounted: HomePage');
        const fetchBanner = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.BANNERS, {
                    params: { active: true }
                });
                const data = response.data;

                if (data && data.length > 0) {
                    setBanner(data[0]);
                }
            } catch (error) {
                logger.error("Failed to fetch banner", { error });
            }
        };

        fetchBanner();
    }, []);

    // Default values if no banner is found
    const bgImage = banner?.image_url || "/hero_image.webp";
    const subtitle = banner?.description || "Everyday / Everywhere 2026";
    const link = banner?.link_url || "/shop";

    return (
        <div className="bg-beige-bg min-h-screen">
            <SEO
                title="Home"
                description="Discover the latest in everyday elegance with Ruvera Couture. Shop our exclusive collection."
                keywords="fashion, couture, everyday elegance, clothing"
            />
            {/* Hero Section - Split Layout */}
            <section ref={heroRef} className="relative min-h-screen grid grid-cols-1 md:grid-cols-2 pt-20 md:pt-0">

                {/* Left Column: Text */}
                <div className="relative z-20 flex flex-col justify-center px-6 md:px-20 py-20 bg-beige-bg order-2 md:order-2">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="space-y-6 md:space-y-8"
                    >
                        <h2 className="text-stone-500 text-xs font-sans tracking-[0.3em] uppercase">
                            {subtitle}
                        </h2>
                        <h1 className="text-6xl md:text-8xl font-serif text-ruvera-gold leading-[0.9]">
                            <span className="block">Your Everyday</span>
                            <span className="block pl-12 italic font-light">Elégance</span>
                        </h1>

                        <div className="pt-8">
                            <Link to={link} className="group inline-flex items-center gap-4 text-sm tracking-widest uppercase text-stone-800 hover:text-ruvera-gold transition-colors">
                                <span>Shop Collection</span>
                                <span className="w-8 h-[1px] bg-stone-800 group-hover:bg-ruvera-gold transition-colors"></span>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Image */}
                <motion.div
                    style={{ opacity }}
                    className="relative h-[60vh] md:h-screen w-full overflow-hidden order-1 md:order-1"
                >
                    <picture className="w-full h-full block">
                        {/* <source srcSet={bgImage?.replace(/\.(png|jpg|jpeg)$/i, '.webp')} type="image/webp" /> */}
                        <img
                            src={bgImage}
                            alt="Hero"
                            className="w-full h-full object-cover object-center"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = "/hero_image.webp";
                            }}
                        />
                    </picture>
                </motion.div>

                {/* Floating Scroll Indicator (Optional, centered or left) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 z-20 hidden md:block"
                >
                    <div className="text-[10px] uppercase tracking-widest text-stone-400 -rotate-90 origin-left translate-y-24">
                        Scroll to Explore
                    </div>
                </motion.div>
            </section>

            <section className="bg-gradient-to-b from-beige-bg to-white py-10">
                <LiquidGallery />
            </section>

            <Footer />
        </div>
    );
};

export default HomePage;
