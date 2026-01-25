import LogRocket from 'logrocket';

const isDev = import.meta.env.DEV;

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
    level: LogLevel;
    message: string;
    data?: any;
    timestamp: string;
    page?: string;
}

const sendToFile = async (payload: LogPayload) => {
    if (!isDev) return;

    try {
        const logLine = `[${payload.timestamp}] [${payload.level.toUpperCase()}] ${payload.page ? `[${payload.page}] ` : ''}${payload.message}${payload.data ? ` | Data: ${JSON.stringify(payload.data)}` : ''}`;

        await fetch('/api/log', {
            method: 'POST',
            body: logLine,
        });
    } catch (err) {
        // Fail silently in browser to avoid infinite loops or noise
    }
};

export const logger = {
    log: (level: LogLevel, message: string, data?: any) => {
        const timestamp = new Date().toISOString();
        const page = window.location.pathname;
        const payload: LogPayload = { level, message, data, timestamp, page };

        // 1. Log to LogRocket
        LogRocket.log(message, data);

        // 2. Console log for dev convenience
        if (isDev) {
            console[level](message, data);
        }

        // 3. Send to local file via Vite middleware
        sendToFile(payload);
    },

    info: (message: string, data?: any) => logger.log('info', message, data),
    warn: (message: string, data?: any) => logger.log('warn', message, data),
    error: (message: string, data?: any) => logger.log('error', message, data),
    debug: (message: string, data?: any) => logger.log('debug', message, data),
};

export default logger;
