'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, googleProvider } from '../firebase';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    ConfirmationResult
} from 'firebase/auth';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api.config';
import { AuthContextType, User as AppUser } from '../types';
import logRocketService from '../utils/logrocketService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const pendingRegistrationProfile = React.useRef<{ firstName: string; lastName: string; phone?: string; email?: string } | null>(null);

    const signIn = async (email: string, password: string) => {
        logRocketService.logStateChange({
            context: 'AuthContext',
            action: 'signIn_attempt',
            newValue: { email },
        });

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("[AuthContext] signIn successful for UID:", userCredential.user.uid);

            logRocketService.logStateChange({
                context: 'AuthContext',
                action: 'signIn_success',
                newValue: { uid: userCredential.user.uid, email },
            });
        } catch (error) {
            console.error("[AuthContext] Error signing in with email/password", error);
            logRocketService.logError('Sign in failed', error, { email });
            throw error;
        }
    };

    const signUp = async (email: string, password: string, firstName: string, lastName: string, phone?: string) => {
        const displayName = `${firstName} ${lastName}`.trim();

        // Store profile details temporarily for the listener to use in sync call
        pendingRegistrationProfile.current = { firstName, lastName, phone };

        logRocketService.logStateChange({
            context: 'AuthContext',
            action: 'signUp_attempt',
            newValue: { email, displayName },
        });

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName });

            logRocketService.logStateChange({
                context: 'AuthContext',
                action: 'signUp_success',
                newValue: { uid: userCredential.user.uid, email, displayName },
            });
        } catch (error) {
            console.error("[AuthContext] Error signing up with email/password", error);
            logRocketService.logError('Sign up failed', error, { email, displayName });
            pendingRegistrationProfile.current = null;
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        logRocketService.logStateChange({
            context: 'AuthContext',
            action: 'google_signin_attempt',
        });

        try {
            const result = await signInWithPopup(auth, googleProvider);
            logRocketService.logStateChange({
                context: 'AuthContext',
                action: 'google_signin_success',
                newValue: { uid: result.user.uid, email: result.user.email },
            });
        } catch (error) {
            console.error("[AuthContext] Error signing in with Google", error);
            logRocketService.logError('Google sign in failed', error);
        }
    };

    const signInWithPhone = async (phoneNumber: string, appVerifier: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        logRocketService.logStateChange({
            context: 'AuthContext',
            action: 'phone_signin_attempt',
            newValue: { phoneNumber },
        });

        try {
            // Cast appVerifier to RecaptchaVerifier as needed by Firebase types if strictly checked
            const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier as RecaptchaVerifier);
            setConfirmationResult(result);

            logRocketService.logStateChange({
                context: 'AuthContext',
                action: 'otp_sent_success',
                newValue: { phoneNumber },
            });
        } catch (error) {
            console.error("[AuthContext] Error sending OTP", error);
            logRocketService.logError('Phone sign in failed', error, { phoneNumber });
            throw error;
        }
    };

    const verifyOtp = async (otp: string) => {
        logRocketService.logStateChange({
            context: 'AuthContext',
            action: 'otp_verify_attempt',
        });

        if (!confirmationResult) {
            const error = new Error('No confirmation result available. Please request OTP first.');
            logRocketService.logError('OTP verification failed', error);
            throw error;
        }

        try {
            await confirmationResult.confirm(otp);
            logRocketService.logStateChange({
                context: 'AuthContext',
                action: 'otp_verify_success',
            });
            setConfirmationResult(null);
        } catch (error) {
            console.error("[AuthContext] Error verifying OTP", error);
            logRocketService.logError('OTP verification failed', error);
            throw error;
        }
    };

    const completePhoneProfile = async (firstName: string, lastName: string, email?: string) => {
        logRocketService.logStateChange({
            context: 'AuthContext',
            action: 'complete_phone_profile_attempt',
            newValue: { firstName, lastName, hasEmail: !!email },
        });

        const currentUser = auth.currentUser;
        if (!currentUser) {
            const error = new Error('No authenticated user');
            logRocketService.logError('Profile completion failed', error);
            throw error;
        }

        try {
            const displayName = `${firstName} ${lastName}`.trim();
            await updateProfile(currentUser, { displayName });

            pendingRegistrationProfile.current = {
                firstName,
                lastName,
                phone: currentUser.phoneNumber || undefined,
                email: email || undefined
            };

            logRocketService.logStateChange({
                context: 'AuthContext',
                action: 'complete_phone_profile_success',
            });

            await currentUser.reload();
        } catch (error) {
            console.error("[AuthContext] Error completing phone profile", error);
            logRocketService.logError('Profile completion failed', error);
            throw error;
        }
    };

    const logout = async () => {
        logRocketService.logStateChange({
            context: 'AuthContext',
            action: 'logout_attempt',
        });

        try {
            await signOut(auth);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('backend_token');
            }

            logRocketService.logTokenOperation({
                operation: 'remove',
                tokenType: 'backend_token',
                success: true,
            });

            logRocketService.logStateChange({
                context: 'AuthContext',
                action: 'logout_success',
            });
        } catch (error) {
            console.error("[AuthContext] Error signing out", error);
            logRocketService.logError('Logout failed', error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    logRocketService.logStateChange({
                        context: 'AuthContext',
                        action: 'auth_state_changed',
                        newValue: {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            isAuthenticated: true,
                        },
                    });

                    const idToken = await firebaseUser.getIdToken();
                    const syncPayload: any = { idToken }; // eslint-disable-line @typescript-eslint/no-explicit-any

                    if (pendingRegistrationProfile.current) {
                        syncPayload.first_name = pendingRegistrationProfile.current.firstName;
                        syncPayload.last_name = pendingRegistrationProfile.current.lastName;
                        if (pendingRegistrationProfile.current.phone) {
                            syncPayload.phone = pendingRegistrationProfile.current.phone;
                        }
                        if (pendingRegistrationProfile.current.email) {
                            syncPayload.email = pendingRegistrationProfile.current.email;
                        }
                        pendingRegistrationProfile.current = null;
                    }

                    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.SYNC}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(syncPayload)
                    });

                    const data = await response.json();

                    if (response.ok) {
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('backend_token', data.token);
                        }

                        logRocketService.logTokenOperation({
                            operation: 'set',
                            tokenType: 'backend_token',
                            success: true,
                        });

                        const userData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            phone: firebaseUser.phoneNumber,
                            db_id: data.user.id,
                            backendToken: data.token
                        };

                        setUser(userData);

                        logRocketService.identify(firebaseUser.uid, {
                            name: firebaseUser.displayName || undefined,
                            email: firebaseUser.email || undefined,
                            db_id: data.user.id,
                        });

                        logRocketService.logStateChange({
                            context: 'AuthContext',
                            action: 'backend_sync_success',
                            newValue: { db_id: data.user.id },
                        });
                    } else {
                        console.error("[AuthContext] Backend sync failed:", data.message);
                        logRocketService.logError('Backend sync failed', new Error(data.message), {
                            status: response.status
                        });

                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            phone: firebaseUser.phoneNumber
                        });
                    }
                } catch (error) {
                    console.error("[AuthContext] Authentication sync error:", error);
                    logRocketService.logError('Authentication sync error', error);

                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        phone: firebaseUser.phoneNumber
                    });
                }
            } else {
                logRocketService.logStateChange({
                    context: 'AuthContext',
                    action: 'auth_state_changed',
                    newValue: { isAuthenticated: false },
                    previousValue: { isAuthenticated: true },
                });

                setUser(null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('backend_token');
                }

                logRocketService.logTokenOperation({
                    operation: 'remove',
                    tokenType: 'backend_token',
                    success: true,
                });
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value: AuthContextType = {
        user,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithPhone,
        verifyOtp,
        completePhoneProfile,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
