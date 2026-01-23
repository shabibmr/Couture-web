// Global setup for Jest tests
import { jest } from '@jest/globals';

// Mock console.log and console.error to keep test output clean
global.console = {
    ...console,
    // log: jest.fn(), // Uncomment if you want to suppress console.log
    error: jest.fn(),
};
