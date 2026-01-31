import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import GoogleSignInButton from '../components/GoogleSignInButton';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signUp } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Get return URL from location state
    const from = (location.state as any)?.from || '/';

    // Redirect if already logged in
    useEffect(() => {
        logger.info('Page Mounted: RegisterPage');
        if (user) {
            logger.info("[RegisterPage] User already logged in, redirecting");
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            logger.info("[RegisterPage] Registration attempt", { email: formData.email });
            await signUp(formData.email, formData.password, formData.firstName, formData.lastName, formData.phone);
            logger.info("[RegisterPage] Registration successful");
            // navigate is handled by the useEffect above
        } catch (err: any) {
            logger.error('Registration error', { error: err, email: formData.email });
            setError(err.message || 'Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-beige-bg px-6 py-12">
            <SEO
                title="Create Account"
                description="Join Ruvera Couture to access exclusive collections, track your orders, and enjoy a personalized shopping experience."
                keywords="register, create account, sign up, ruvera couture"
            />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-stone-100"
            >
                <div className="text-center mb-8">
                    <h1 className="font-serif text-3xl text-midnight mb-2">Create Account</h1>
                    <p className="text-stone-500 font-light">Join the Ruvéra Couture family</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold transition-all"
                                placeholder="John"
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold transition-all"
                                placeholder="Doe"
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold transition-all"
                            placeholder="you@example.com"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold transition-all"
                            placeholder="+1234567890"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold transition-all"
                            placeholder="••••••••"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold transition-all"
                            placeholder="••••••••"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 bg-midnight text-white font-medium uppercase tracking-widest hover:bg-ruvera-gold transition-colors duration-300 shadow-lg hover:shadow-xl rounded-lg flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Account...
                            </>
                        ) : 'Create Account'}
                    </button>
                </form>

                <div className="my-6 flex items-center justify-between">
                    <div className="h-px bg-stone-200 flex-1"></div>
                    <span className="px-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Or continue with</span>
                    <div className="h-px bg-stone-200 flex-1"></div>
                </div>

                <GoogleSignInButton />

                <div className="mt-8 text-center text-sm text-stone-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-ruvera-gold font-medium hover:text-midnight transition-colors">
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
