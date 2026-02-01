import React from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';


const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [status, setStatus] = React.useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setStatus(null);
        try {
            await api.post(API_ENDPOINTS.NEWSLETTER, { email });
            setStatus({ type: 'success', message: 'Subscribed successfully!' });
            setEmail('');
        } catch (error: any) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Subscription failed.' });
        } finally {
            setLoading(false);
        }
    };


    return (
        <footer className="bg-stone-200 text-stone-600 py-16 px-6 relative z-10 text-xs md:text-sm">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Brand Column */}
                <div className="space-y-6">
                    <Link to="/" className="block">
                        <h2 className="font-serif text-2xl text-ruvera-gold">RUVÉRA COUTURE</h2>
                    </Link>
                    <p className="font-light leading-relaxed max-w-xs text-stone-500">
                        Avant-garde elegance for the modern connoisseur.
                        Redefining luxury through organic forms and impeccable craftsmanship.
                    </p>
                </div>

                {/* Shop Column */}
                <div>
                    <h3 className="text-stone-900 font-medium uppercase tracking-widest text-xs mb-6">Shop</h3>
                    <ul className="space-y-4 font-light text-stone-600">
                        <li><Link to="/shop" className="hover:text-ruvera-gold transition-colors">New Arrivals</Link></li>
                        <li><Link to="/shop" className="hover:text-ruvera-gold transition-colors">Men</Link></li>
                        <li><Link to="/shop" className="hover:text-ruvera-gold transition-colors">Women</Link></li>
                        <li><Link to="/shop" className="hover:text-ruvera-gold transition-colors">Accessories</Link></li>
                    </ul>
                </div>

                {/* Service Column */}
                <div>
                    <h3 className="text-stone-900 font-medium uppercase tracking-widest text-xs mb-6">Service</h3>
                    <ul className="space-y-4 font-light text-stone-600">

                        <li><Link to="/orders" className="hover:text-ruvera-gold transition-colors">My Orders</Link></li>
                        <li><Link to="/shipping" className="hover:text-ruvera-gold transition-colors">Shipping & Returns</Link></li>
                        <li><Link to="/about" className="hover:text-ruvera-gold transition-colors">About Us</Link></li>
                        <li><Link to="/faq" className="hover:text-ruvera-gold transition-colors">FAQ</Link></li>
                        <li><Link to="/contact" className="hover:text-ruvera-gold transition-colors">Contact Concierge</Link></li>
                    </ul>
                </div>

                {/* Newsletter Column */}
                <div>
                    <h3 className="text-stone-900 font-medium uppercase tracking-widest text-xs mb-6">Newsletter</h3>
                    <p className="font-light mb-4 text-stone-500">Subscribe for exclusive early access to new collections.</p>
                    <form onSubmit={handleSubscribe} className="flex flex-col space-y-3">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            className="bg-stone-100 border border-stone-300 text-stone-800 px-4 py-3 rounded-none focus:outline-none focus:border-ruvera-gold transition-colors text-xs placeholder:text-stone-400"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-ruvera-gold text-white px-6 py-3 rounded-none text-xs font-medium uppercase tracking-widest hover:bg-stone-800 transition-colors duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Subscribing...' : 'Subscribe'}
                        </button>
                        {status && (
                            <p className={`text-[10px] mt-2 ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {status.message}
                            </p>
                        )}
                    </form>

                </div>

            </div>

            <div className="max-w-[1400px] mx-auto mt-16 pt-8 border-t border-stone-300 flex flex-col md:flex-row justify-between items-center text-[10px] font-light tracking-wide uppercase text-stone-400">
                <p>&copy; {currentYear} Ruvéra Couture. All rights reserved.</p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                    <Link to="/privacy" className="hover:text-stone-900 transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-stone-900 transition-colors">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
