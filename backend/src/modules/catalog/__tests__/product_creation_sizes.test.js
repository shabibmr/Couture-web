
import { jest } from '@jest/globals';

// Mocks
const mockProduct = {
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
};
const mockProductVariant = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
};
const mockInventory = {
    create: jest.fn(),
};
const mockSize = {
    findAll: jest.fn(),
};
const mockProductImage = {
    create: jest.fn(),
    destroy: jest.fn(),
};

// Mock Dependencies
jest.unstable_mockModule('../models/product.model.js', () => ({ default: mockProduct }));
jest.unstable_mockModule('../models/product_variant.model.js', () => ({ default: mockProductVariant }));
jest.unstable_mockModule('../../inventory/models/inventory.model.js', () => ({ default: mockInventory }));
jest.unstable_mockModule('../models/size.model.js', () => ({ default: mockSize }));
jest.unstable_mockModule('../models/product_image.model.js', () => ({ default: mockProductImage }));
jest.unstable_mockModule('../models/category.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/brand.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/color.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/review.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../../identity/models/customer.model.js', () => ({ default: {} }));

// Import Controller
const { createProduct, updateProduct } = await import('../product.controller.js');

describe('Product Creation with Sizes', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                name: 'Test Product',
                price: 100,
                code: 'TP-001',
                sizes: ['S', 'M']
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should create variants and inventory when sizes are provided', async () => {
        // Mock Product Creation
        mockProduct.create.mockResolvedValue({ id: 1, name: 'Test Product' });

        // Mock Size Lookup
        mockSize.findAll.mockResolvedValue([
            { id: 10, name: 'S', code: 'S' },
            { id: 11, name: 'M', code: 'M' }
        ]);

        // Mock Variant Creation
        mockProductVariant.create.mockResolvedValue({ id: 100 });

        await createProduct(req, res);

        // Verify Product Created
        expect(mockProduct.create).toHaveBeenCalled();

        // Verify Sizes Looked Up
        expect(mockSize.findAll).toHaveBeenCalledWith({ where: { name: ['S', 'M'] } });

        // Verify Variants Created (2 calls)
        expect(mockProductVariant.create).toHaveBeenCalledTimes(2);

        // Verify Inventory Created (2 calls)
        expect(mockInventory.create).toHaveBeenCalledTimes(2);

        // Verify Response
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should not create variants if no sizes provided', async () => {
        req.body.sizes = [];
        mockProduct.create.mockResolvedValue({ id: 1 });

        await createProduct(req, res);

        expect(mockProductVariant.create).not.toHaveBeenCalled();
        expect(mockInventory.create).not.toHaveBeenCalled();
    });
});

describe('Product Update with Sizes', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: 1 },
            body: {
                sizes: ['L'] // Adding Large
            }
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    it('should add new variants when updating product with new sizes', async () => {
        // Mock Product Find
        const mockProd = {
            id: 1,
            base_price: 100,
            slug: 'prod-slug',
            update: jest.fn(),
            featured_image: 'img.jpg'
        };
        mockProduct.findByPk.mockResolvedValue(mockProd);

        // Mock Existing Variants (S and M exist)
        mockProductVariant.findAll.mockResolvedValue([
            { Size: { name: 'S' } },
            { Size: { name: 'M' } }
        ]);

        // Mock Size Lookup for new size 'L'
        mockSize.findAll.mockResolvedValue([
            { id: 12, name: 'L', code: 'L' }
        ]);

        mockProductVariant.create.mockResolvedValue({ id: 101 });

        await updateProduct(req, res);

        // Should look for existing variants
        expect(mockProductVariant.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { product_id: 1 } }));

        // Should look up LAST size
        expect(mockSize.findAll).toHaveBeenCalledWith({ where: { name: ['L'] } });

        // Should create ONE new variant
        expect(mockProductVariant.create).toHaveBeenCalledTimes(1);
        expect(mockProductVariant.create).toHaveBeenCalledWith(expect.objectContaining({
            size_id: 12,
            product_id: 1
        }));

        // Should create inventory for it
        expect(mockInventory.create).toHaveBeenCalledTimes(1);
    });
});
