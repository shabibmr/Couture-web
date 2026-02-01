import { analytics } from '../firebase';
import { logEvent, Analytics } from 'firebase/analytics';

class FirebaseAnalyticsService {
    private analytics: Analytics | null = null;

    constructor() {
        this.analytics = analytics;
    }

    /**
     * Log a standard or custom event to Firebase Analytics
     * @param eventName Name of the event
     * @param eventParams Optional parameters for the event
     */
    logEvent(eventName: string, eventParams?: Record<string, any>) {
        if (this.analytics) {
            try {
                logEvent(this.analytics, eventName, eventParams);
                // console.log(`[FirebaseAnalytics] Logged event: ${eventName}`, eventParams);
            } catch (error) {
                console.warn(`[FirebaseAnalytics] Failed to log event: ${eventName}`, error);
            }
        } else {
            console.warn('[FirebaseAnalytics] Analytics not initialized');
        }
    }

    /**
     * Log user navigation (screen view)
     * Note: GA4 automatically tracks page_view with Enhanced Measurement, 
     * but for SPAs explicit screen_view or page_view can be useful if needed.
     * However, normally updating the route is enough. 
     * We will log a custom 'navigation' event or rely on GA4's history listener.
     * To be safe and consistent with LogRocket, we can log a specific event.
     */
    logPageView(pagePath: string) {
        this.logEvent('page_view', {
            page_path: pagePath,
            page_title: document.title
        });
    }

    /**
     * Log specific user actions
     */
    logLogin(method: string) {
        this.logEvent('login', { method });
    }

    logSignUp(method: string) {
        this.logEvent('sign_up', { method });
    }

    logAddToCart(itemId: string, itemName: string, currency: string, value: number) {
        this.logEvent('add_to_cart', {
            currency,
            value,
            items: [{
                item_id: itemId,
                item_name: itemName
            }]
        });
    }
}

export const firebaseAnalytics = new FirebaseAnalyticsService();
export default firebaseAnalytics;
