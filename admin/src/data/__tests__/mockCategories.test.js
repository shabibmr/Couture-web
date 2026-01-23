import { describe, it, expect } from 'vitest';
import { initialCategories } from '../mockCategories';

describe('mockCategories', () => {
    it('should export initial categories data', () => {
        expect(Array.isArray(initialCategories)).toBe(true);
        expect(initialCategories.length).toBeGreaterThan(0);
    });

    it('should have required category fields', () => {
        const category = initialCategories[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        // Add more specific field checks if known
    });
});
