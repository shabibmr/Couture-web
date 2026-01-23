import { describe, it, expect } from 'vitest';
import { initialCustomers } from '../mockCustomers';

describe('mockCustomers', () => {
    // Assuming there might be getter functions similar to products, but if not, just testing the data structure export
    it('should export initial customers data', () => {
        expect(Array.isArray(initialCustomers)).toBe(true);
        expect(initialCustomers.length).toBeGreaterThan(0);
    });

    it('should have required customer fields', () => {
        const customer = initialCustomers[0];
        expect(customer).toHaveProperty('id');
        expect(customer).toHaveProperty('name');
        expect(customer).toHaveProperty('email');
    });
});
