import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

import { API_BASE_URL } from '../config/api.config';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Backend JWT if available
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('backend_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: unknown) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: any) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized (e.g., clear token, logout)
            localStorage.removeItem('backend_token');
        }
        return Promise.reject(error);
    }
);

export default api;
