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
    const pendingRegistrationProfile = React.useRef<{ firstName: string; lastName: string; phone?: string } | null>(null);

    const signIn = async (email: string, password: string) => {
        console.log("[AuthContext] signIn called for email:", email);
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
        console.log("[AuthContext] signUp called for email:", email, "displayName:", displayName, "phone:", phone);

        // Store profile details temporarily for the listener to use in sync call
        pendingRegistrationProfile.current = { firstName, lastName, phone };

        logRocketService.logStateChange({
            context: 'AuthContext',
            action: 'signUp_attempt',
            newValue: { email, displayName },
        });

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("[AuthContext] signUp user created, updating profile for UID:", userCredential.user.uid);
            await updateProfile(userCredential.user, { displayName });
            console.log("[AuthContext] signUp profile updated");

            logRocketService.logStateChange({
                context: 'AuthContext',
                action: 'signUp_success',
                newValue: { uid: userCredential.user.uid, email, displayName },
            });
        } catch (error) {
            console.error("[AuthContext] Error signing up with email/password", error);
            logRocketService.logError('Sign up failed', error, { email, displayName });
            // Clear pending profile on error
            pendingRegistrationProfile.current = null;
            throw error;
        }
    };

    // ... (keep signInWithGoogle, signInWithPhone, verifyOtp, logout as is)
    const signInWithGoogle = async () => {
        console.log("[AuthContext] signInWithGoogle called");
        logRocketService.logStateChange({
            context: 'AuthContext',
            action: 'google_signin_attempt',
        });

        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log("[AuthContext] signInWithGoogle successful for UID:", result.user.uid);

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

    const signInWithPhone = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
        console.log("[AuthContext] signInWithPhone called for number:", phoneNumber);
        logRocketService.logStateChange({
            context: 'AuthContext',
            action: 'phone_signin_attempt',
            newValue: { phoneNumber },
        });

        try {
            const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(result);
            console.log("[AuthContext] OTP sent successfully");

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
        console.log("[AuthContext] verifyOtp called");
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
            console.log("[AuthContext] OTP verified successfully");

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

    const logout = async () => {
        console.log("[AuthContext] logout called");
        logRocketService.logStateChange({
            context: 'AuthContext',
            action: 'logout_attempt',
        });

        try {
            await signOut(auth);
            localStorage.removeItem('backend_token');

            // Log token removal
            logRocketService.logTokenOperation({
                operation: 'remove',
                tokenType: 'backend_token',
                success: true,
            });

            logRocketService.logStateChange({
                context: 'AuthContext',
                action: 'logout_success',
            });

            console.log("[AuthContext] logout successful");
        } catch (error) {
            console.error("[AuthContext] Error signing out", error);
            logRocketService.logError('Logout failed', error);
        }
    };

    useEffect(() => {
        console.log("[AuthContext] onAuthStateChanged listener initialized");
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("[AuthContext] Auth state changed, firebaseUser:", firebaseUser?.uid || "null");

            if (firebaseUser) {
                try {
                    console.log("[AuthContext] Syncing with backend...");

                    // Log auth state change
                    logRocketService.logStateChange({
                        context: 'AuthContext',
                        action: 'auth_state_changed',
                        newValue: {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            isAuthenticated: true,
                        },
                    });

                    // Prepare sync payload
                    const idToken = await firebaseUser.getIdToken();
                    const syncPayload: any = { idToken };

                    // Add registration profile details if available
                    if (pendingRegistrationProfile.current) {
                        syncPayload.first_name = pendingRegistrationProfile.current.firstName;
                        syncPayload.last_name = pendingRegistrationProfile.current.lastName;
                        if (pendingRegistrationProfile.current.phone) {
                            syncPayload.phone = pendingRegistrationProfile.current.phone;
                        }
                        console.log("[AuthContext] Including pending registration profile in sync:", pendingRegistrationProfile.current);
                        // Clear pending profile after use
                        pendingRegistrationProfile.current = null;
                    }

                    // Sync with Backend
                    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.SYNC}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(syncPayload)
                    });

                    const data = await response.json();
                    console.log("[AuthContext] Backend sync response status:", response.status);

                    if (response.ok) {
                        console.log("[AuthContext] Backend sync successful. DB ID:", data.user.id);
                        localStorage.setItem('backend_token', data.token);

                        // Log token storage
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
                            db_id: data.user.id,
                            backendToken: data.token
                        };

                        setUser(userData);

                        // Identify user to LogRocket
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
                            photoURL: firebaseUser.photoURL
                        });
                    }
                } catch (error) {
                    console.error("[AuthContext] Authentication sync error:", error);
                    logRocketService.logError('Authentication sync error', error);

                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL
                    });
                }
            } else {
                console.log("[AuthContext] User is logged out, clearing state");

                logRocketService.logStateChange({
                    context: 'AuthContext',
                    action: 'auth_state_changed',
                    newValue: { isAuthenticated: false },
                    previousValue: { isAuthenticated: true },
                });

                setUser(null);
                localStorage.removeItem('backend_token');

                logRocketService.logTokenOperation({
                    operation: 'remove',
                    tokenType: 'backend_token',
                    success: true,
                });
            }
            setLoading(false);
            console.log("[AuthContext] loading set to false");
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
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
