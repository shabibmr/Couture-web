import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft, Loader2, User, Mail } from 'lucide-react';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api.config';

interface PhoneLoginProps {
    onBack?: () => void;
    onSuccess?: () => void;
    onUserTypeIdentified?: (isNewUser: boolean) => void;
}

type Step = 'phone' | 'otp' | 'profile';

const PhoneLogin: React.FC<PhoneLoginProps> = ({ onBack, onSuccess, onUserTypeIdentified }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<Step>('phone');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isNewUser, setIsNewUser] = useState<boolean | null>(null);

    // Profile collection fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
    const { signInWithPhone, verifyOtp, completePhoneProfile } = useAuth();

    useEffect(() => {
        if (!recaptchaVerifierRef.current) {
            try {
                logger.info('[PhoneLogin] Initializing reCAPTCHA');
                recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    size: 'invisible',
                    callback: () => {
                        logger.info('[PhoneLogin] reCAPTCHA verified');
                    },
                    'expired-callback': () => {
                        logger.warn('[PhoneLogin] reCAPTCHA expired');
                    }
                });
            } catch (err) {
                logger.error('[PhoneLogin] Failed to initialize reCAPTCHA', err);
            }
        }

        return () => {
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        };
    }, []);

    const formatPhoneNumber = (value: string): string => {
        const cleaned = value.replace(/\D/g, '');
        if (!cleaned.startsWith('91')) {
            return '+91' + cleaned;
        }
        return '+' + cleaned;
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        logger.info('[PhoneLogin] Sending OTP', { phoneNumber });
        setError(null);
        setIsLoading(true);

        try {
            if (!recaptchaVerifierRef.current) {
                throw new Error('reCAPTCHA not initialized');
            }

            const formattedPhone = formatPhoneNumber(phoneNumber);

            // Parallel operations: Send OTP and check if user exists
            const [, checkResponse] = await Promise.all([
                signInWithPhone(formattedPhone, recaptchaVerifierRef.current),
                fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.CHECK_PHONE}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: formattedPhone })
                })
            ]);

            const checkData = await checkResponse.json();
            logger.info('[PhoneLogin] Check phone response:', checkData);

            if (checkResponse.ok) {
                const isNew = !checkData.exists;
                setIsNewUser(isNew);
                if (onUserTypeIdentified) onUserTypeIdentified(isNew);
                logger.info('[PhoneLogin] User status determined:', checkData.exists ? 'Returning user' : 'New user');
            } else {
                logger.warn('[PhoneLogin] Failed to check user status, assuming new user');
                setIsNewUser(true);
                if (onUserTypeIdentified) onUserTypeIdentified(true);
            }

            setStep('otp');
            logger.info('[PhoneLogin] OTP sent successfully');
        } catch (err: any) {
            logger.error('[PhoneLogin] Failed to send OTP', err);
            setError(err.message || 'Failed to send OTP. Please check your phone number.');
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        logger.info('[PhoneLogin] Verifying OTP');
        setError(null);
        setIsLoading(true);

        try {
            await verifyOtp(otp);
            logger.info('[PhoneLogin] OTP verified successfully');

            // Check if this is a new user
            if (isNewUser) {
                logger.info('[PhoneLogin] New user detected, showing profile form');
                setStep('profile');
            } else {
                logger.info('[PhoneLogin] Returning user, proceeding to app');
                if (onSuccess) onSuccess();
            }
        } catch (err: any) {
            logger.error('[PhoneLogin] Failed to verify OTP', err);
            setError(err.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        logger.info('[PhoneLogin] Submitting profile', { firstName, lastName, email });
        setError(null);
        setIsLoading(true);

        try {
            // Validate required fields
            if (!firstName.trim() || !lastName.trim()) {
                throw new Error('First name and last name are required');
            }

            // Complete the profile
            await completePhoneProfile(firstName, lastName, email || undefined);
            logger.info('[PhoneLogin] Profile completed successfully');

            // Navigate to success
            if (onSuccess) onSuccess();
        } catch (err: any) {
            logger.error('[PhoneLogin] Failed to complete profile', err);
            setError(err.message || 'Failed to complete profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 'otp') {
            setStep('phone');
            setOtp('');
            setError(null);
        } else if (step === 'profile') {
            // Allow going back from profile to OTP
            setStep('otp');
            setError(null);
        } else if (onBack) {
            onBack();
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div id="recaptcha-container"></div>

            {/* Phone Number Step */}
            {step === 'phone' && (
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleSendOtp}
                    className="space-y-6"
                >
                    <div>
                        <label className="text-sm text-gray-600 mb-2 block">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter phone number"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Format: 9876543210 (without +91)
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="flex gap-3">
                        {onBack && (
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading || !phoneNumber}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send OTP'
                            )}
                        </button>
                    </div>
                </motion.form>
            )}

            {/* OTP Verification Step */}
            {step === 'otp' && (
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleVerifyOtp}
                    className="space-y-6"
                >
                    <div>
                        <label className="text-sm text-gray-600 mb-2 block">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 text-center text-2xl tracking-widest"
                            required
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            OTP sent to {phoneNumber}
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || otp.length !== 6}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify OTP'
                            )}
                        </button>
                    </div>
                </motion.form>
            )}

            {/* Profile Collection Step */}
            {step === 'profile' && (
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleProfileSubmit}
                    className="space-y-6"
                >
                    <div className="text-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Complete Your Profile</h3>
                        <p className="text-sm text-gray-500">
                            Please provide your details to continue
                        </p>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 mb-2 block">
                            First Name *
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter first name"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 mb-2 block">
                            Last Name *
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter last name"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 mb-2 block">
                            Email (Optional)
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email (optional)"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !firstName.trim() || !lastName.trim()}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Completing...
                                </>
                            ) : (
                                'Complete Profile'
                            )}
                        </button>
                    </div>
                </motion.form>
            )}
        </div>
    );
};

export default PhoneLogin;
