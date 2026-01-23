import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Get return URL from location state
    const from = (location.state as any)?.from || '/';

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log('Login attempt:', formData);
        // TODO: Implement actual email/password authentication
        // For now, redirect to return URL
        navigate(from, { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-beige-bg px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-stone-100"
            >
                <div className="text-center mb-8">
                    <h1 className="font-serif text-3xl text-midnight mb-2">Welcome Back</h1>
                    <p className="text-stone-500 font-light">Sign in to continue your journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                            required
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
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-stone-600">
                            <input type="checkbox" className="mr-2 rounded text-ruvera-gold focus:ring-ruvera-gold" />
                            Remember me
                        </label>
                        <a href="#" className="text-ruvera-gold hover:text-midnight transition-colors">
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-ruvera-gold text-white font-medium uppercase tracking-widest hover:bg-midnight transition-colors duration-300 shadow-lg hover:shadow-xl rounded-lg"
                    >
                        Sign In
                    </button>
                </form>

                <div className="my-6 flex items-center justify-between">
                    <div className="h-px bg-stone-200 flex-1"></div>
                    <span className="px-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Or</span>
                    <div className="h-px bg-stone-200 flex-1"></div>
                </div>

                <GoogleSignInButton />

                <div className="mt-8 text-center text-sm text-stone-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-ruvera-gold font-medium hover:text-midnight transition-colors">
                        Create Account
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
