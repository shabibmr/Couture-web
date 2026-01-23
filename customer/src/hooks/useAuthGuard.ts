import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthGuardOptions {
    returnTo?: string;
    action?: string;
    context?: any;
}

/**
 * Custom hook to guard actions that require authentication.
 * If user is not authenticated, redirects to login page with return URL.
 * 
 * @example
 * const { requireAuth } = useAuthGuard();
 * 
 * const handleWishlistClick = () => {
 *   if (!requireAuth({ action: 'wishlist' })) return;
 *   // Proceed with wishlist operation
 *   toggleWishlist(product);
 * };
 */
export const useAuthGuard = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Check if user is authenticated. If not, redirect to login.
     * @param options - Configuration for the auth guard
     * @returns true if authenticated, false if redirected to login
     */
    const requireAuth = (options: AuthGuardOptions = {}): boolean => {
        // Don't check during loading state
        if (loading) return false;

        // User is authenticated
        if (user) return true;

        // User is not authenticated - redirect to login
        const { returnTo, action, context } = options;

        // Determine return URL (use provided or current location)
        const returnUrl = returnTo || location.pathname + location.search;

        // Navigate to login with state
        navigate('/login', {
            state: {
                from: returnUrl,
                action,
                context
            }
        });

        return false;
    };

    /**
     * Navigate to login page with return URL
     */
    const redirectToLogin = (returnTo?: string, context?: any) => {
        const returnUrl = returnTo || location.pathname + location.search;
        navigate('/login', {
            state: {
                from: returnUrl,
                context
            }
        });
    };

    return {
        requireAuth,
        redirectToLogin,
        isAuthenticated: !!user && !loading,
        loading
    };
};

export default useAuthGuard;
