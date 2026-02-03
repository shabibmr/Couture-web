import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface AuthGuardOptions {
    returnTo?: string;
    action?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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
        // Convert searchParams to string if present
        const currentSearch = searchParams.toString();
        const currentUrl = pathname + (currentSearch ? `?${currentSearch}` : '');
        const returnUrl = returnTo || currentUrl;

        // Encode state params into the URL as Next.js router.push doesn't support state object like react-router
        // We will pass them as query params to login page
        const loginParams = new URLSearchParams();
        if (returnUrl) loginParams.set('from', returnUrl);
        if (action) loginParams.set('action', action);
        if (context) loginParams.set('context', JSON.stringify(context));

        router.push(`/login?${loginParams.toString()}`);

        return false;
    };

    /**
     * Navigate to login page with return URL
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const redirectToLogin = (returnTo?: string, context?: any) => {
        const currentSearch = searchParams.toString();
        const currentUrl = pathname + (currentSearch ? `?${currentSearch}` : '');
        const returnUrl = returnTo || currentUrl;

        const loginParams = new URLSearchParams();
        if (returnUrl) loginParams.set('from', returnUrl);
        if (context) loginParams.set('context', JSON.stringify(context));

        router.push(`/login?${loginParams.toString()}`);
    };

    return {
        requireAuth,
        redirectToLogin,
        isAuthenticated: !!user && !loading,
        loading
    };
};

export default useAuthGuard;
