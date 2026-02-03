import LogRocket from 'logrocket';

const isDev = process.env.NODE_ENV === 'development';
const PORTAL_TYPE = 'customer';

interface BaseLogData {
    timestamp: string;
    page: string;
    portal: string;
}

interface StateChangeLogData extends BaseLogData {
    context: string;
    previousValue?: unknown;
    newValue?: unknown;
    action?: string;
}

interface ApiCallLogData extends BaseLogData {
    method: string;
    url: string;
    status?: number;
    duration?: number;
    requestData?: unknown;
    responseData?: unknown;
    error?: unknown;
}

interface NavigationLogData extends BaseLogData {
    from: string;
    to: string;
    trigger?: string;
}

interface TokenLogData extends BaseLogData {
    operation: 'set' | 'get' | 'remove';
    tokenType: string;
    success: boolean;
    error?: string;
}

interface CookieLogData extends BaseLogData {
    operation: 'set' | 'get' | 'remove';
    cookieName: string;
    value?: unknown;
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class LogRocketService {
    private initialized = false;
    private logFilePath = `${PORTAL_TYPE}.log`;

    /**
     * Initialize LogRocket with user identification
     */
    identify(userId: string, userInfo?: { name?: string; email?: string;[key: string]: unknown }) {
        if (typeof window === 'undefined') return;
        try {
            LogRocket.identify(userId, {
                name: userInfo?.name || '',
                email: userInfo?.email || '',
                ...userInfo,
            });
            this.log('info', 'User identified', { userId, userInfo });
        } catch (error) {
            console.error('[LogRocket] Failed to identify user:', error);
        }
    }

    /**
     * Log state changes in contexts or components
     */
    logStateChange(data: Omit<StateChangeLogData, 'timestamp' | 'page' | 'portal'>) {
        if (typeof window === 'undefined') return;
        const logData: StateChangeLogData = {
            ...data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            portal: PORTAL_TYPE,
        };

        this.log('info', `[STATE CHANGE] ${data.context}${data.action ? ` - ${data.action}` : ''}`, logData);

        // Sanitize for LogRocket
        const trackData = {
            ...logData,
            previousValue: typeof logData.previousValue === 'object' ? JSON.stringify(logData.previousValue) : logData.previousValue,
            newValue: typeof logData.newValue === 'object' ? JSON.stringify(logData.newValue) : logData.newValue,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        LogRocket.track('StateChange', trackData as any);
    }

    /**
     * Log API calls (requests and responses)
     */
    logApiCall(data: Omit<ApiCallLogData, 'timestamp' | 'page' | 'portal'>) {
        if (typeof window === 'undefined') return;
        const logData: ApiCallLogData = {
            ...data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            portal: PORTAL_TYPE,
        };

        const level: LogLevel = data.error ? 'error' : data.status && data.status >= 400 ? 'warn' : 'info';
        this.log(level, `[API ${data.method}] ${data.url} - ${data.status || 'pending'}`, logData);

        // LogRocket.track only accepts primitive types, so stringify objects
        const trackData = {
            method: logData.method,
            url: logData.url,
            status: logData.status,
            duration: logData.duration,
            timestamp: logData.timestamp,
            page: logData.page,
            portal: logData.portal,
            requestData: logData.requestData ? JSON.stringify(logData.requestData) : undefined,
            responseData: logData.responseData ? JSON.stringify(logData.responseData) : undefined,
            error: logData.error ? JSON.stringify(logData.error) : undefined,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        LogRocket.track('ApiCall', trackData as any);
    }

    /**
     * Log navigation events
     */
    logNavigation(data: Omit<NavigationLogData, 'timestamp' | 'portal'>) {
        if (typeof window === 'undefined') return;
        const logData: NavigationLogData = {
            ...data,
            timestamp: new Date().toISOString(),
            portal: PORTAL_TYPE,
            page: data.to,
        };

        this.log('info', `[NAVIGATION] ${data.from} → ${data.to}`, logData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        LogRocket.track('Navigation', logData as any);
    }

    /**
     * Log token operations (localStorage/sessionStorage)
     */
    logTokenOperation(data: Omit<TokenLogData, 'timestamp' | 'page' | 'portal'>) {
        if (typeof window === 'undefined') return;
        const logData: TokenLogData = {
            ...data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            portal: PORTAL_TYPE,
        };

        const level: LogLevel = data.success ? 'info' : 'warn';
        this.log(level, `[TOKEN ${data.operation.toUpperCase()}] ${data.tokenType}`, logData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        LogRocket.track('TokenOperation', logData as any);
    }

    /**
     * Log cookie operations
     */
    logCookieOperation(data: Omit<CookieLogData, 'timestamp' | 'page' | 'portal'>) {
        if (typeof window === 'undefined') return;
        const logData: CookieLogData = {
            ...data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            portal: PORTAL_TYPE,
        };

        this.log('info', `[COOKIE ${data.operation.toUpperCase()}] ${data.cookieName}`, logData);
        const trackData = {
            ...logData,
            value: typeof logData.value === 'object' ? JSON.stringify(logData.value) : logData.value
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        LogRocket.track('CookieOperation', trackData as any);
    }

    /**
     * Log errors with enhanced tracking
     */
    logError(message: string, error: unknown, additionalData?: unknown) {
        if (typeof window === 'undefined') return;
        const logData = {
            message,
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
            } : error,
            additionalData,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            portal: PORTAL_TYPE,
        };

        this.log('error', `[ERROR] ${message}`, logData);

        // Capture exception in LogRocket
        if (error instanceof Error) {
            LogRocket.captureException(error, {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                extra: { message, additionalData: additionalData as any },
            });
        }
    }

    /**
     * Core logging method
     */
    private log(level: LogLevel, message: string, data?: unknown) {
        if (typeof window === 'undefined') return;
        // 1. Log to LogRocket
        LogRocket.log(message, data);

        // 2. Console log for dev convenience
        if (isDev) {
            console[level](message, data);
        }

        // 3. Send to log file via backend
        this.sendToFile(level, message, data);
    }

    /**
     * Send log to file via backend endpoint
     */
    private async sendToFile(level: LogLevel, message: string, data?: unknown) {
        if (!isDev) return;

        try {
            const logLine = `[${new Date().toISOString()}] [${level.toUpperCase()}] [${PORTAL_TYPE}] ${message}${data ? ` | Data: ${JSON.stringify(data)}` : ''}`;

            await fetch('/api/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: logLine,
            });
        } catch {
            // Fail silently to avoid infinite loops
        }
    }

    /**
     * Generic log method for custom logging
     */
    customLog(level: LogLevel, message: string, data?: Record<string, unknown>) {
        if (typeof window === 'undefined') return;
        this.log(level, message, { ...data, timestamp: new Date().toISOString(), page: window.location.pathname, portal: PORTAL_TYPE });
    }
}

// Export singleton instance
export const logRocketService = new LogRocketService();
export default logRocketService;
