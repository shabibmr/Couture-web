import logRocketService from './logrocketService';

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
    level: LogLevel;
    message: string;
    data?: Record<string, unknown>;
    timestamp: string;
    page?: string;
}

const sendToFile = async (payload: LogPayload) => {
    if (!isDev) return;
    if (typeof window === 'undefined') return;

    try {
        const logLine = `[${payload.timestamp}] [${payload.level.toUpperCase()}] [customer] ${payload.page ? `[${payload.page}] ` : ''}${payload.message}${payload.data ? ` | Data: ${JSON.stringify(payload.data)}` : ''}`;

        await fetch('/api/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: logLine,
        });
    } catch {
        // Fail silently in browser to avoid infinite loops or noise
    }
};

export const logger = {
    log: (level: LogLevel, message: string, data?: Record<string, unknown>) => {
        const timestamp = new Date().toISOString();
        const page = typeof window !== 'undefined' ? window.location.pathname : 'server';
        const payload: LogPayload = { level, message, data, timestamp, page };

        // Use LogRocket service for structured logging
        logRocketService.customLog(level, message, data);

        // Send to local file via Vite middleware (Next.js might not have this, check later)
        sendToFile(payload);
    },

    info: (message: string, data?: Record<string, unknown>) => logger.log('info', message, data),
    warn: (message: string, data?: Record<string, unknown>) => logger.log('warn', message, data),
    error: (message: string, data?: Record<string, unknown>) => logger.log('error', message, data),
    debug: (message: string, data?: Record<string, unknown>) => logger.log('debug', message, data),
};

export default logger;
