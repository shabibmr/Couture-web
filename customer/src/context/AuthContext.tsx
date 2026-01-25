import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, googleProvider } from '../firebase';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api.config';
import { AuthContextType, User as AppUser } from '../types';


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

    const signIn = async (email: string, password: string) => {
        console.log("[AuthContext] signIn called for email:", email);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("[AuthContext] signIn successful for UID:", userCredential.user.uid);
        } catch (error) {
            console.error("[AuthContext] Error signing in with email/password", error);
            throw error;
        }
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        console.log("[AuthContext] signUp called for email:", email, "displayName:", displayName);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("[AuthContext] signUp user created, updating profile for UID:", userCredential.user.uid);
            await updateProfile(userCredential.user, { displayName });
            console.log("[AuthContext] signUp profile updated");
        } catch (error) {
            console.error("[AuthContext] Error signing up with email/password", error);
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        console.log("[AuthContext] signInWithGoogle called");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log("[AuthContext] signInWithGoogle successful for UID:", result.user.uid);
        } catch (error) {
            console.error("[AuthContext] Error signing in with Google", error);
        }
    };

    const logout = async () => {
        console.log("[AuthContext] logout called");
        try {
            await signOut(auth);
            localStorage.removeItem('backend_token');
            console.log("[AuthContext] logout successful");
        } catch (error) {
            console.error("[AuthContext] Error signing out", error);
        }
    };

    useEffect(() => {
        console.log("[AuthContext] onAuthStateChanged listener initialized");
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("[AuthContext] Auth state changed, firebaseUser:", firebaseUser?.uid || "null");
            if (firebaseUser) {
                try {
                    console.log("[AuthContext] Syncing with backend...");
                    // Sync with Backend
                    const idToken = await firebaseUser.getIdToken();
                    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.SYNC}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken })
                    });

                    const data = await response.json();
                    console.log("[AuthContext] Backend sync response status:", response.status);

                    if (response.ok) {
                        console.log("[AuthContext] Backend sync successful. DB ID:", data.user.id);
                        localStorage.setItem('backend_token', data.token);
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            db_id: data.user.id,
                            backendToken: data.token
                        });
                    } else {
                        console.error("[AuthContext] Backend sync failed:", data.message);
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL
                        });
                    }
                } catch (error) {
                    console.error("[AuthContext] Authentication sync error:", error);
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL
                    });
                }
            } else {
                console.log("[AuthContext] User is logged out, clearing state");
                setUser(null);
                localStorage.removeItem('backend_token');
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
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
