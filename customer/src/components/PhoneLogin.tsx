import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { RecaptchaVerifier } from 'firebase/auth';
import logger from '../utils/logger';

interface PhoneLoginProps {
    onSuccess?: () => void;
}

const PhoneLogin: React.FC<PhoneLoginProps> = ({ onSuccess }) => {
    const { signInWithPhone, verifyOtp } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const recaptchaContainerRef = useRef<HTMLDivElement>(null);
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

    useEffect(() => {
        // Initialize invisible reCAPTCHA when component mounts
        if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
            try {
                recaptchaVerifierRef.current = new RecaptchaVerifier(
                    auth,
                    recaptchaContainerRef.current,
                    {
                        size: 'invisible',
                        callback: () => {
                            logger.info('[PhoneLogin] reCAPTCHA verified');
                        },
                        'expired-callback': () => {
                            logger.error('[PhoneLogin] reCAPTCHA expired');
                            setError('reCAPTCHA expired. Please try again.');
                        }
                    }
                );
            } catch (err) {
                logger.error('[PhoneLogin] Error initializing reCAPTCHA', err);
            }
        }

        // Cleanup on unmount
        return () => {
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        };
    }, []);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        logger.info('[PhoneLogin] Sending OTP', { phoneNumber });
        setError(null);
        setIsLoading(true);

        try {
            if (!recaptchaVerifierRef.current) {
                throw new Error('reCAPTCHA not initialized');
            }

            await signInWithPhone(phoneNumber, recaptchaVerifierRef.current);
            setStep('otp');
            logger.info('[PhoneLogin] OTP sent successfully');
        } catch (err: any) {
            logger.error('[PhoneLogin] Failed to send OTP', err);
            setError(err.message || 'Failed to send OTP. Please check your phone number.');
            // Reset reCAPTCHA on error
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
            if (onSuccess) onSuccess();
        } catch (err: any) {
            logger.error('[PhoneLogin] Failed to verify OTP', err);
            setError(err.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setStep('phone');
        setOtp('');
        setError(null);
    };

    return (
        <div>
            {/* reCAPTCHA container - invisible */}
            <div ref={recaptchaContainerRef} />

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                    {error}
                </div>
            )}

            {step === 'phone' ? (
                <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSendOtp}
                    className="space-y-6"
                >
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                            Phone Number
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                                <Phone size={18} />
                            </div>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold transition-all"
                                placeholder="+1 234 567 8900"
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <p className="mt-2 text-xs text-stone-500">
                            Enter with country code (e.g., +1 for US)
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 bg-ruvera-gold text-white font-medium uppercase tracking-widest hover:bg-midnight transition-colors duration-300 shadow-lg hover:shadow-xl rounded-lg flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Sending OTP...
                            </>
                        ) : (
                            'Send OTP'
                        )}
                    </button>
                </motion.form>
            ) : (
                <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleVerifyOtp}
                    className="space-y-6"
                >
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold transition-all text-center text-2xl tracking-widest"
                            placeholder="000000"
                            maxLength={6}
                            disabled={isLoading}
                            required
                        />
                        <p className="mt-2 text-xs text-stone-500">
                            Enter the 6-digit code sent to {phoneNumber}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 bg-ruvera-gold text-white font-medium uppercase tracking-widest hover:bg-midnight transition-colors duration-300 shadow-lg hover:shadow-xl rounded-lg flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Verifying...
                            </>
                        ) : (
                            'Verify OTP'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={isLoading}
                        className="w-full text-sm text-stone-500 hover:text-ruvera-gold transition-colors"
                    >
                        ← Change phone number
                    </button>
                </motion.form>
            )}
        </div>
    );
};

export default PhoneLogin;
