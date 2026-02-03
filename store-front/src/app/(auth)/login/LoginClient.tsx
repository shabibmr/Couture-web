'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import PhoneLogin from '@/components/auth/PhoneLogin';
import { useAuth } from '@/context/AuthContext';
import logger from '@/utils/logger';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, signIn } = useAuth();
    const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    // Get return URL from search params
    const from = searchParams.get('from') || '/';

    // Redirect if already logged in, unless registering (phone flow)
    useEffect(() => {
        if (user && !isRegistering) {
            logger.info("[LoginPage] User already logged in, redirecting", { destination: from });
            router.replace(from);
        }
    }, [user, isRegistering, router, from]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        logger.info("[LoginPage] Login attempt", { email: formData.email });
        setError(null);
        setIsLoading(true);

        try {
            await signIn(formData.email, formData.password);
            logger.info("[LoginPage] Sign-in successful");
            // router.replace handled by useEffect
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            logger.error('[LoginPage] Sign-in failed', { error: err, email: formData.email });
            setError(err.message || 'Failed to sign in. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneSuccess = () => {
        logger.info('[LoginPage] Phone authentication successful');
        // If we were registering (blocked auto-redirect), navigate manually now
        if (isRegistering) {
            router.replace(from);
        }
    };

    const handleUserTypeIdentified = (isNewUser: boolean) => {
        if (isNewUser) {
            logger.info('[LoginPage] New user detected, pausing auto-redirect');
            setIsRegistering(true);
        }
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

                {/* Tab Navigation */}
                <div className="flex border-b border-stone-200 mb-6">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('email');
                            setError(null);
                        }}
                        className={`flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'email'
                            ? 'text-ruvera-gold border-b-2 border-ruvera-gold'
                            : 'text-stone-500 border-b-2 border-transparent hover:text-ruvera-gold'
                            }`}
                    >
                        Email
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('phone');
                            setError(null);
                        }}
                        className={`flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'phone'
                            ? 'text-ruvera-gold border-b-2 border-ruvera-gold'
                            : 'text-stone-500 border-b-2 border-transparent hover:text-ruvera-gold'
                            }`}
                    >
                        Phone
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {/* Tab Content */}
                {activeTab === 'email' ? (
                    <motion.form
                        key="email-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
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

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-stone-600">
                                <input type="checkbox" className="mr-2 rounded text-ruvera-gold focus:ring-ruvera-gold" />
                                Remember me
                            </label>
                            <Link href="/forgot-password" className="text-ruvera-gold hover:text-midnight transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 bg-ruvera-gold text-white font-medium uppercase tracking-widest hover:bg-midnight transition-colors duration-300 shadow-lg hover:shadow-xl rounded-lg flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing In...
                                </>
                            ) : 'Sign In'}
                        </button>
                    </motion.form>
                ) : (
                    <motion.div
                        key="phone-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <PhoneLogin
                            onSuccess={handlePhoneSuccess}
                            onUserTypeIdentified={handleUserTypeIdentified}
                        />
                    </motion.div>
                )}

                <div className="my-6 flex items-center justify-between">
                    <div className="h-px bg-stone-200 flex-1"></div>
                    <span className="px-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Or</span>
                    <div className="h-px bg-stone-200 flex-1"></div>
                </div>

                <GoogleSignInButton />

                <div className="mt-8 text-center text-sm text-stone-500">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-ruvera-gold font-medium hover:text-midnight transition-colors">
                        Create Account
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
