import React, { useState, FormEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';
import logger from '../utils/logger';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    React.useEffect(() => {
        logger.info('Page Mounted: ContactPage');
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        logger.info("[ContactPage] Contact form submission", { name: formData.name, email: formData.email });
        setIsSubmitting(true);

        // Simulate form submission
        setTimeout(() => {
            logger.info("[ContactPage] Contact form submission successful");
            setSubmitted(true);
            setIsSubmitting(false);
            setFormData({ name: '', email: '', phone: '', message: '' });

            // Reset success message after 5 seconds
            setTimeout(() => setSubmitted(false), 5000);
        }, 1500);
    };

    return (
        <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6">
            <SEO
                title="Contact Us"
                description="Get in touch with Ruvera Couture. We are here to assist you with any inquiries regarding our collections and services."
                keywords="contact ruvera, customer support, fashion queries, store location"
            />
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="font-serif text-5xl text-midnight mb-4">Get in Touch</h1>
                    <p className="text-stone-500 font-light max-w-2xl mx-auto">
                        Have a question or need assistance? We're here to help.
                        Reach out to us and we'll respond as soon as possible.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-8 rounded-xl shadow-sm border border-stone-100"
                    >
                        <h2 className="font-serif text-2xl text-midnight mb-6">Send us a Message</h2>

                        {submitted && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                                Thank you! Your message has been sent successfully. We'll get back to you soon.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-stone-50 border border-stone-200 p-3 rounded-lg focus:outline-none focus:border-ruvera-gold transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-stone-50 border border-stone-200 p-3 rounded-lg focus:outline-none focus:border-ruvera-gold transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-stone-50 border border-stone-200 p-3 rounded-lg focus:outline-none focus:border-ruvera-gold transition-colors"
                                    placeholder="+91 98765 43210"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="w-full bg-stone-50 border border-stone-200 p-3 rounded-lg focus:outline-none focus:border-ruvera-gold transition-colors resize-none"
                                    placeholder="Tell us how we can help you..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-ruvera-gold text-white py-4 rounded-lg font-medium uppercase tracking-widest hover:bg-midnight transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    'Sending...'
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-8"
                    >
                        {/* Contact Details */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
                            <h2 className="font-serif text-2xl text-midnight mb-6">Contact Information</h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-ruvera-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Mail className="text-ruvera-gold" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-midnight uppercase tracking-widest mb-1">Email</h3>
                                        <a href="mailto:info@ruveracouture.com" className="text-stone-600 hover:text-ruvera-gold transition-colors">
                                            info@ruveracouture.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-ruvera-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Phone className="text-ruvera-gold" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-midnight uppercase tracking-widest mb-1">Phone</h3>
                                        <a href="tel:+919895558511" className="text-stone-600 hover:text-ruvera-gold transition-colors">
                                            +91 98955 58511
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-ruvera-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MessageCircle className="text-ruvera-gold" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-midnight uppercase tracking-widest mb-1">WhatsApp</h3>
                                        <a href="https://wa.me/919895558533" target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:text-ruvera-gold transition-colors">
                                            +91 98955 58533
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-ruvera-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MapPin className="text-ruvera-gold" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-midnight uppercase tracking-widest mb-1">Address</h3>
                                        <p className="text-stone-600">
                                            123 Fashion Avenue<br />
                                            Mumbai, Maharashtra 400001<br />
                                            India
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Business Hours */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
                            <h2 className="font-serif text-2xl text-midnight mb-6">Business Hours</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-stone-600">Availability</span>
                                    <span className="text-midnight font-medium">24x7</span>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
                            <h2 className="font-serif text-2xl text-midnight mb-6">Follow Us</h2>
                            <div className="flex gap-4">
                                <a
                                    href="https://instagram.com/ruveracouture"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center hover:bg-ruvera-gold hover:text-white transition-all duration-300"
                                >
                                    <Instagram size={20} />
                                </a>
                                <a
                                    href="https://facebook.com/ruveracouture"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center hover:bg-ruvera-gold hover:text-white transition-all duration-300"
                                >
                                    <Facebook size={20} />
                                </a>
                                <a
                                    href="https://twitter.com/ruveracouture"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center hover:bg-ruvera-gold hover:text-white transition-all duration-300"
                                >
                                    <Twitter size={20} />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Map Section (Optional) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-16"
                >
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
                        <h2 className="font-serif text-2xl text-midnight mb-6">Visit Our Store</h2>
                        <div className="bg-stone-200 rounded-lg h-96 flex items-center justify-center text-stone-500">
                            <div className="text-center">
                                <MapPin size={48} className="mx-auto mb-4 text-stone-400" />
                                <p>Interactive map can be embedded here</p>
                                <p className="text-sm text-stone-400 mt-2">( Google Maps / Custom Map )</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactPage;
