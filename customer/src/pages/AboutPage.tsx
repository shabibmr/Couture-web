import React from 'react';
import { motion } from 'framer-motion';
import { Award, Heart, Users, Sparkles } from 'lucide-react';

const AboutPage: React.FC = () => {
    const values = [
        {
            icon: Heart,
            title: 'Passion for Excellence',
            description: 'Every piece is crafted with meticulous attention to detail and an unwavering commitment to quality.'
        },
        {
            icon: Sparkles,
            title: 'Timeless Elegance',
            description: 'We create designs that transcend fleeting trends, offering enduring beauty and sophistication.'
        },
        {
            icon: Users,
            title: 'Customer First',
            description: 'Your satisfaction drives everything we do. We\'re dedicated to providing exceptional service and experiences.'
        },
        {
            icon: Award,
            title: 'Craftsmanship',
            description: 'Collaborating with master artisans to bring you garments that celebrate traditional techniques and modern innovation.'
        }
    ];

    return (
        <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center"
                >
                    <h1 className="font-serif text-5xl md:text-6xl text-midnight mb-6">Our Story</h1>
                    <p className="text-xl text-stone-500 font-light max-w-3xl mx-auto leading-relaxed">
                        Redefining luxury through organic forms, impeccable craftsmanship,
                        and a dedication to timeless elegance.
                    </p>
                </motion.div>

                {/* Brand Story */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-10 md:p-16 rounded-xl shadow-sm border border-stone-100 mb-16"
                >
                    <div className="max-w-4xl mx-auto space-y-6 text-stone-700 leading-relaxed">
                        <p className="text-lg font-light">
                            Founded in 2020, <span className="font-serif text-ruvera-gold">Ruvéra Couture</span> was born from a vision to create
                            fashion that speaks to the modern connoisseur—someone who appreciates the marriage of
                            avant-garde design and traditional artistry.
                        </p>
                        <p className="text-lg font-light">
                            Our name, derived from the French term for "dream state," reflects our philosophy:
                            fashion should transport you, evoke emotion, and become an extension of your identity.
                            Each collection is a carefully curated narrative, blending fluid silhouettes with
                            unexpected textures and sustainable materials.
                        </p>
                        <p className="text-lg font-light">
                            We work exclusively with master craftsmen and artisans who share our commitment to
                            excellence. From hand-stitched embroidery to ethically sourced fabrics, every garment
                            tells a story of passion, precision, and purpose.
                        </p>
                        <p className="text-lg font-light">
                            At Ruvéra Couture, we don't just create clothes—we create experiences.
                            Our pieces are designed for those who seek to express their individuality
                            with confidence and grace.
                        </p>
                    </div>
                </motion.div>

                {/* Our Mission */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-20"
                >
                    <h2 className="font-serif text-4xl text-midnight text-center mb-12">Our Mission</h2>
                    <div className="bg-gradient-to-br from-ruvera-gold/5 to-stone-100 p-10 rounded-xl">
                        <p className="text-center text-lg md:text-xl font-light text-stone-700 max-w-4xl mx-auto italic">
                            "To empower individuals to express their unique style through
                            exceptional design, superior quality, and sustainable practices—creating
                            fashion that is as responsible as it is beautiful."
                        </p>
                    </div>
                </motion.div>

                {/* Core Values */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-16"
                >
                    <h2 className="font-serif text-4xl text-midnight text-center mb-12">Our Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                className="bg-white p-8 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
                            >
                                <div className="w-14 h-14 bg-ruvera-gold/10 rounded-full flex items-center justify-center mb-6">
                                    <value.icon className="text-ruvera-gold" size={24} />
                                </div>
                                <h3 className="font-serif text-2xl text-midnight mb-3">{value.title}</h3>
                                <p className="text-stone-600 font-light leading-relaxed">
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Sustainability Commitment */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white p-10 md:p-16 rounded-xl shadow-sm border border-stone-100"
                >
                    <h2 className="font-serif text-4xl text-midnight text-center mb-8">Sustainability Commitment</h2>
                    <div className="max-w-4xl mx-auto space-y-4 text-stone-700">
                        <p className="font-light text-lg">
                            We believe luxury and sustainability are not mutually exclusive.
                            Ruvéra Couture is committed to:
                        </p>
                        <ul className="space-y-3 ml-6">
                            <li className="flex items-start gap-3">
                                <span className="text-ruvera-gold mt-1">•</span>
                                <span>Using ethically sourced, organic, and recycled materials wherever possible</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-ruvera-gold mt-1">•</span>
                                <span>Partnering with fair-trade certified artisans and workshops</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-ruvera-gold mt-1">•</span>
                                <span>Minimizing waste through conscious production and packaging</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-ruvera-gold mt-1">•</span>
                                <span>Supporting local communities and preserving traditional crafts</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-ruvera-gold mt-1">•</span>
                                <span>Continuously innovating to reduce our environmental footprint</span>
                            </li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AboutPage;
