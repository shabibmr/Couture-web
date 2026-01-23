
import { jest } from '@jest/globals';

// Mocks
const mockProduct = {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
};

const mockProductVariant = {
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(), // We expect this to be called
};

const mockInventory = {
    create: jest.fn(),
};

const mockSize = {
    findAll: jest.fn(),
};

// Mock module imports
jest.unstable_mockModule('../models/product.model.js', () => ({ default: mockProduct }));
jest.unstable_mockModule('../models/product_variant.model.js', () => ({ default: mockProductVariant }));
jest.unstable_mockModule('../../inventory/models/inventory.model.js', () => ({ default: mockInventory }));
jest.unstable_mockModule('../models/size.model.js', () => ({ default: mockSize }));
jest.unstable_mockModule('../models/product_image.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/review.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../../identity/models/customer.model.js', () => ({ default: {} }));

const { updateProduct } = await import('../product.controller.js');

describe('Product Variant Sync Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: 'prod-1' },
            body: {},
            files: []
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should remove variants that are no longer in the selected sizes list', async () => {
        // Setup initial state: Product has 2 variants (S, M)
        const product = {
            id: 'prod-1',
            slug: 't-shirt',
            update: jest.fn().mockResolvedValue(true)
        };
        mockProduct.findByPk.mockResolvedValue(product);

        // Existing variants WITH Size association
        mockProductVariant.findAll.mockResolvedValue([
            {
                id: 'var-1',
                size_id: 'size-s',
                sku: 'TS-S',
                Size: { name: 'S', code: 'S' },
                destroy: jest.fn().mockResolvedValue(true)
            },
            {
                id: 'var-2',
                size_id: 'size-m',
                sku: 'TS-M',
                Size: { name: 'M', code: 'M' },
                destroy: jest.fn().mockResolvedValue(true)
            }
        ]);

        // Selected sizes: Only 'S' is listed. 'M' is removed.
        req.body = {
            sizes: ['S']
        };

        // Mock Size lookup to validate incoming sizes
        mockSize.findAll.mockResolvedValue([
            { id: 'size-s', name: 'S', code: 'S' }
        ]);

        // Mock Inventory destroy
        mockInventory.destroy = jest.fn().mockResolvedValue(true);

        // Capture the mock instances to check their spies
        const existingVariants = await mockProductVariant.findAll();
        const variantMToRemove = existingVariants.find(v => v.id === 'var-2');
        const variantToKeep = existingVariants.find(v => v.id === 'var-1');

        await updateProduct(req, res);

        // Expectation: destroy should be called on the INSTANCE of var-2
        expect(variantMToRemove.destroy).toHaveBeenCalled();

        // Should NOT destroy var-1
        expect(variantToKeep.destroy).not.toHaveBeenCalled();
    });
});
