import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log('Register attempt:', formData);
        // Mock authentication - Redirect to home
        navigate('/');
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
                    <h1 className="font-serif text-3xl text-midnight mb-2">Create Account</h1>
                    <p className="text-stone-500 font-light">Join the Ruvéra Couture family</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold transition-all"
                            placeholder="John Doe"
                            required
                        />
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
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-midnight text-white font-medium uppercase tracking-widest hover:bg-ruvera-gold transition-colors duration-300 shadow-lg hover:shadow-xl rounded-lg"
                    >
                        Create Account
                    </button>
                </form>

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
