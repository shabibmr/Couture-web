import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Hoist shared state to capture callbacks registered during module initialization
const sharedState = vi.hoisted(() => ({
    request: null,
    requestError: null,
    response: null,
    responseError: null
}));

const mocks = vi.hoisted(() => ({
    requestUse: vi.fn((success, error) => {
        sharedState.request = success;
        sharedState.requestError = error;
    }),
    responseUse: vi.fn((success, error) => {
        sharedState.response = success;
        sharedState.responseError = error;
    }),
}));

vi.mock('axios', async (importOriginal) => {
    const actual = await importOriginal();
    const mockInstance = {
        interceptors: {
            request: { use: mocks.requestUse },
            response: { use: mocks.responseUse }
        },
        defaults: { headers: { common: {} } },
        get: vi.fn(),
        // add other methods if needed, but not critical for this test
    };

    return {
        default: {
            ...actual.default,
            create: vi.fn(() => mockInstance),
        }
    };
});

// Import executes the module code, which runs axios.create and registers interceptors
import api from '../api';

describe('API Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should register interceptors', () => {
        expect(sharedState.request).toBeTypeOf('function');
        expect(sharedState.response).toBeTypeOf('function');
    });

    describe('Request Interceptor', () => {
        it('should add Authorization header if token exists', () => {
            const token = 'test-token';
            localStorage.setItem('token', token);

            const config = { headers: {} };
            // Manually invoke the captured interceptor callback
            const modifiedConfig = sharedState.request(config);

            expect(modifiedConfig.headers['Authorization']).toBe(`Bearer ${token}`);
        });

        it('should not add Authorization header if no token', () => {
            const config = { headers: {} };
            const modifiedConfig = sharedState.request(config);
            expect(modifiedConfig.headers['Authorization']).toBeUndefined();
        });

        it('should return config intact', () => {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const modifiedConfig = sharedState.request(config);
            expect(modifiedConfig).toBe(config);
        });
    });

    describe('Response Interceptor', () => {
        it('should return response on success', () => {
            const response = { data: 'test' };
            const result = sharedState.response(response);
            expect(result).toBe(response);
        });

        it('should reject error', async () => {
            const error = { response: { status: 500 } };
            // The error handler should return a rejected promise
            await expect(sharedState.responseError(error)).rejects.toEqual(error);
        });

        // Test the 401 handling logic if you want
        it('should handles 401 (e.g., checks logic)', async () => {
            const error = { response: { status: 401 } };
            // The current implementation just rejects, but we can verify it doesn't crash
            await expect(sharedState.responseError(error)).rejects.toEqual(error);
        });
    });
});
