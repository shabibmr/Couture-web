
import { jest } from '@jest/globals';

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

jest.unstable_mockModule('../models/product.model.js', () => ({ default: mockProduct }));
// ... other mocks

const { createProduct, updateProduct, getAllProducts } = await import('../product.controller.js');

describe('Product Active Status Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                name: 'Inactive Product',
                price: 100,
                is_active: false // Explicitly setting to false
            },
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should create product with is_active: false', async () => {
        mockProduct.create.mockResolvedValue({
            id: 1,
            name: 'Inactive Product',
            is_active: false
        });

        await createProduct(req, res);

        expect(mockProduct.create).toHaveBeenCalledWith(expect.objectContaining({
            is_active: false
        }));
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should update product to is_active: false', async () => {
        req.params.id = 1;
        req.body.is_active = false;

        const mockProd = {
            id: 1,
            is_active: true,
            update: jest.fn().mockResolvedValue(true),
            slug: 'prod-slug'
        };
        mockProduct.findByPk.mockResolvedValue(mockProd);

        await updateProduct(req, res);

        expect(mockProd.update).toHaveBeenCalledWith(expect.objectContaining({
            is_active: false
        }));
        expect(res.json).toHaveBeenCalled();
    });

    describe('getAllProducts status filter', () => {
        beforeEach(() => {
            mockProduct.findAndCountAll = jest.fn().mockResolvedValue({ count: 0, rows: [] });
        });

        it('should filter active products by default', async () => {
            req.query = {};
            await getAllProducts(req, res);
            expect(mockProduct.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ is_active: true })
            }));
        });

        it('should fetch all products when status=all', async () => {
            req.query = { status: 'all' };
            await getAllProducts(req, res);

            // Should NOT have is_active in where clause
            const callArgs = mockProduct.findAndCountAll.mock.calls[0][0];
            expect(callArgs.where).not.toHaveProperty('is_active');
        });

        it('should fetch inactive products when status=inactive', async () => {
            req.query = { status: 'inactive' };
            await getAllProducts(req, res);
            expect(mockProduct.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ is_active: false })
            }));
        });
    });
});
