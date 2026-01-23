import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { API_ENDPOINTS } from '../config/api.config';
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

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('backend_token');
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Sync with Backend
                    const idToken = await firebaseUser.getIdToken();
                    const response = await fetch(API_ENDPOINTS.AUTH.SYNC, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken })
                    });

                    const data = await response.json();

                    if (response.ok) {
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
                        console.error("Backend sync failed:", data.message);
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL
                        });
                    }
                } catch (error) {
                    console.error("Authentication sync error:", error);
                }
            } else {
                setUser(null);
                localStorage.removeItem('backend_token');
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);


    const value: AuthContextType = {
        user,
        signInWithGoogle,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
