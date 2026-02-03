import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import logRocketService from '../utils/logrocketService';
import { API_BASE_URL } from '../config/api.config';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Backend JWT if available and log requests
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const startTime = Date.now();
        config.metadata = { startTime };

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('backend_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;

                // Log token retrieval operation
                logRocketService.logTokenOperation({
                    operation: 'get',
                    tokenType: 'backend_token',
                    success: true,
                });
            }
        }

        // Log API request
        logRocketService.logApiCall({
            method: config.method?.toUpperCase() || 'UNKNOWN',
            url: config.url || 'unknown',
            requestData: config.data,
        });

        return config;
    },
    (error: unknown) => {
        logRocketService.logError('API request interceptor error', error);
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle errors globally and log responses
api.interceptors.response.use(
    (response: AxiosResponse) => {
        const duration = response.config.metadata?.startTime
            ? Date.now() - response.config.metadata.startTime
            : undefined;

        // Log successful API response
        logRocketService.logApiCall({
            method: response.config.method?.toUpperCase() || 'UNKNOWN',
            url: response.config.url || 'unknown',
            status: response.status,
            duration,
            // responseData: response.data, // Commented out to reduce log noise
        });

        return response;
    },
    (error: AxiosError) => {
        const duration = error.config?.metadata?.startTime
            ? Date.now() - error.config.metadata.startTime
            : undefined;

        // Log API error
        logRocketService.logApiCall({
            method: error.config?.method?.toUpperCase() || 'UNKNOWN',
            url: error.config?.url || 'unknown',
            status: error.response?.status,
            duration,
            error: {
                message: error.message,
                response: error.response?.data,
            },
        });

        if (typeof window !== 'undefined' && error.response && error.response.status === 401) {
            // Handle unauthorized (e.g., clear token, logout)
            localStorage.removeItem('backend_token');

            // Log token removal
            logRocketService.logTokenOperation({
                operation: 'remove',
                tokenType: 'backend_token',
                success: true,
            });
        }
        return Promise.reject(error);
    }
);

export default api;
