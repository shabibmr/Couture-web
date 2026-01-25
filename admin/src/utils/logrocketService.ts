import LogRocket from 'logrocket';

const isDev = import.meta.env.DEV;
const PORTAL_TYPE = 'admin';

interface BaseLogData {
    timestamp: string;
    page: string;
    portal: string;
}

interface StateChangeLogData extends BaseLogData {
    context: string;
    previousValue?: any;
    newValue?: any;
    action?: string;
}

interface ApiCallLogData extends BaseLogData {
    method: string;
    url: string;
    status?: number;
    duration?: number;
    requestData?: any;
    responseData?: any;
    error?: any;
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
    value?: any;
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class LogRocketService {
    private initialized = false;
    private logFilePath = `${PORTAL_TYPE}.log`;

    /**
     * Initialize LogRocket with user identification
     */
    identify(userId: string, userInfo?: { name?: string; email?: string;[key: string]: any }) {
        try {
            LogRocket.identify(userId, {
                name: userInfo?.name,
                email: userInfo?.email,
                ...userInfo,
            });
            this.log('info', 'Admin user identified', { userId, userInfo });
        } catch (error) {
            console.error('[LogRocket Admin] Failed to identify user:', error);
        }
    }

    /**
     * Log state changes in contexts or components
     */
    logStateChange(data: Omit<StateChangeLogData, 'timestamp' | 'page' | 'portal'>) {
        const logData: StateChangeLogData = {
            ...data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            portal: PORTAL_TYPE,
        };

        this.log('info', `[STATE CHANGE] ${data.context}${data.action ? ` - ${data.action}` : ''}`, logData);
        LogRocket.track('StateChange', logData);
    }

    /**
     * Log API calls (requests and responses)
     */
    logApiCall(data: Omit<ApiCallLogData, 'timestamp' | 'page' | 'portal'>) {
        const logData: ApiCallLogData = {
            ...data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            portal: PORTAL_TYPE,
        };

        const level: LogLevel = data.error ? 'error' : data.status && data.status >= 400 ? 'warn' : 'info';
        this.log(level, `[API ${data.method}] ${data.url} - ${data.status || 'pending'}`, logData);
        LogRocket.track('ApiCall', logData);
    }

    /**
     * Log navigation events
     */
    logNavigation(data: Omit<NavigationLogData, 'timestamp' | 'portal'>) {
        const logData: NavigationLogData = {
            ...data,
            timestamp: new Date().toISOString(),
            portal: PORTAL_TYPE,
            page: data.to,
        };

        this.log('info', `[NAVIGATION] ${data.from} → ${data.to}`, logData);
        LogRocket.track('Navigation', logData);
    }

    /**
     * Log token operations (localStorage/sessionStorage)
     */
    logTokenOperation(data: Omit<TokenLogData, 'timestamp' | 'page' | 'portal'>) {
        const logData: TokenLogData = {
            ...data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            portal: PORTAL_TYPE,
        };

        const level: LogLevel = data.success ? 'info' : 'warn';
        this.log(level, `[TOKEN ${data.operation.toUpperCase()}] ${data.tokenType}`, logData);
        LogRocket.track('TokenOperation', logData);
    }

    /**
     * Log cookie operations
     */
    logCookieOperation(data: Omit<CookieLogData, 'timestamp' | 'page' | 'portal'>) {
        const logData: CookieLogData = {
            ...data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            portal: PORTAL_TYPE,
        };

        this.log('info', `[COOKIE ${data.operation.toUpperCase()}] ${data.cookieName}`, logData);
        LogRocket.track('CookieOperation', logData);
    }

    /**
     * Log errors with enhanced tracking
     */
    logError(message: string, error: any, additionalData?: any) {
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
                extra: { message, additionalData },
            });
        }
    }

    /**
     * Core logging method
     */
    private log(level: LogLevel, message: string, data?: any) {
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
    private async sendToFile(level: LogLevel, message: string, data?: any) {
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
        } catch (err) {
            // Fail silently to avoid infinite loops
        }
    }

    /**
     * Generic log method for custom logging
     */
    customLog(level: LogLevel, message: string, data?: any) {
        this.log(level, message, { ...data, timestamp: new Date().toISOString(), page: window.location.pathname, portal: PORTAL_TYPE });
    }
}

// Export singleton instance
export const logRocketService = new LogRocketService();
export default logRocketService;
