import { describe, it, expect } from 'vitest';
import { getProducts, getProductById, initialProducts } from '../mockProducts';

describe('mockProducts', () => {
    describe('getProducts', () => {
        it('should return all initial products', async () => {
            const products = await getProducts();
            expect(products).toHaveLength(initialProducts.length);
            expect(products).toEqual(initialProducts);
        });
    });

    describe('getProductById', () => {
        it('should return the correct product for a valid ID', async () => {
            const expectedProduct = initialProducts[0];
            const product = await getProductById(expectedProduct.id);
            expect(product).toEqual(expectedProduct);
        });

        it('should return undefined for an invalid ID', async () => {
            const product = await getProductById('invalid-id');
            expect(product).toBeUndefined();
        });
    });
});
