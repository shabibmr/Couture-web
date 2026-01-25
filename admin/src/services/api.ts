import axios, { InternalAxiosRequestConfig } from 'axios';
import logRocketService from '../utils/logrocketService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token if available and logging
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const startTime = Date.now();
        (config as any).metadata = { startTime };

        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;

            // Log token retrieval
            logRocketService.logTokenOperation({
                operation: 'get',
                tokenType: 'token',
                success: true,
            });
        }

        // Log API request
        logRocketService.logApiCall({
            method: config.method?.toUpperCase() || 'UNKNOWN',
            url: config.url || 'unknown',
            requestData: config.data,
        });

        return config;
    },
    (error) => {
        logRocketService.logError('API request interceptor error', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors and logging
api.interceptors.response.use(
    (response) => {
        const duration = (response.config as any).metadata?.startTime
            ? Date.now() - (response.config as any).metadata.startTime
            : undefined;

        // Log successful API response
        logRocketService.logApiCall({
            method: response.config.method?.toUpperCase() || 'UNKNOWN',
            url: response.config.url || 'unknown',
            status: response.status,
            duration,
            responseData: response.data,
        });

        return response;
    },
    (error) => {
        const duration = (error.config as any)?.metadata?.startTime
            ? Date.now() - (error.config as any).metadata.startTime
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

        if (error.response && error.response.status === 401) {
            // Handle unauthorized access by clearing invalid token and redirecting
            localStorage.removeItem('token');

            // Log token removal
            logRocketService.logTokenOperation({
                operation: 'remove',
                tokenType: 'token',
                success: true,
            });

            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
