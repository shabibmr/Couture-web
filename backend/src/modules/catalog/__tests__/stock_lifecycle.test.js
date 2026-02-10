import { jest } from '@jest/globals';

// Mock Models
const mockProductVariant = {
    create: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
};

const mockInventory = {
    create: jest.fn(),
    destroy: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
};

// Use unstable_mockModule for ESM mocking
jest.unstable_mockModule('../models/product_variant.model.js', () => ({ default: mockProductVariant }));
jest.unstable_mockModule('../../inventory/models/inventory.model.js', () => ({ default: mockInventory }));
jest.unstable_mockModule('../models/product.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/size.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/color.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/product_image.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/review.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../../identity/models/customer.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/category.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/brand.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../../../config/database.js', () => ({
    default: {
        transaction: jest.fn().mockResolvedValue({
            commit: jest.fn(),
            rollback: jest.fn(),
        }),
    }
}));
jest.unstable_mockModule('sequelize', () => ({
    Op: { in: Symbol('in') }
}));

// Dynamic import
const { addProductVariant, deleteProductVariant } = await import('../product.controller.js');
const { updateStock, getInventory } = await import('../../inventory/inventory.controller.js');

describe('Stock Lifecycle Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            user: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    describe('Create Stock (via Variant)', () => {
        it('should create ProductVariant and Inventory record', async () => {
            req.params.id = 'prod-123';
            req.body = {
                sku: 'TEST-SKU-001',
                size_id: 'size-123',
                color_id: 'color-123',
                variant_price: 150
            };

            mockProductVariant.findOne.mockResolvedValue(null); // No duplicate SKU
            mockProductVariant.create.mockResolvedValue({ id: 'var-123', ...req.body });
            mockInventory.create.mockResolvedValue({ id: 'inv-123', variant_id: 'var-123', quantity: 0 });

            await addProductVariant(req, res);

            expect(mockProductVariant.create).toHaveBeenCalledWith({
                product_id: 'prod-123',
                sku: 'TEST-SKU-001',
                size_id: 'size-123',
                color_id: 'color-123',
                variant_price: 150,
                variant_image: undefined
            });

            expect(mockInventory.create).toHaveBeenCalledWith({
                variant_id: 'var-123',
                quantity: 0,
                reserved_quantity: 0,
                low_stock_threshold: 10
            });

            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should fail if SKU exists', async () => {
            req.params.id = 'prod-123';
            req.body = { sku: 'TEST-SKU-001' };
            mockProductVariant.findOne.mockResolvedValue({ id: 'existing' });

            await addProductVariant(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'SKU already exists' });
        });
    });

    describe('Read Stock', () => {
        it('should fetch inventory list', async () => {
            const mockData = [{ id: 'inv-1', quantity: 10 }];
            mockInventory.findAll.mockResolvedValue(mockData);

            await getInventory(req, res);

            expect(mockInventory.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockData);
        });
    });

    describe('Update Stock', () => {
        it('should update stock quantity', async () => {
            req.body = { variant_id: 'var-123', quantity: 50 };
            const mockInvRecord = {
                id: 'inv-123',
                variant_id: 'var-123',
                quantity: 10,
                save: jest.fn().mockResolvedValue(true)
            };
            mockInventory.findOne.mockResolvedValue(mockInvRecord);

            await updateStock(req, res);

            expect(mockInventory.findOne).toHaveBeenCalledWith({ where: { variant_id: 'var-123' } });
            expect(mockInvRecord.quantity).toBe(50);
            expect(mockInvRecord.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Stock updated successfully' }));
        });

        it('should reject negative quantity', async () => {
            req.body = { variant_id: 'var-123', quantity: -5 };
            const mockInvRecord = { id: 'inv-123' };
            mockInventory.findOne.mockResolvedValue(mockInvRecord);

            await updateStock(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Quantity cannot be negative' });
        });
    });

    describe('Delete Stock (via Variant)', () => {
        it('should delete Inventory and ProductVariant', async () => {
            req.params.id = 'prod-123';
            req.params.variantId = 'var-123';

            const mockVariant = {
                id: 'var-123',
                destroy: jest.fn().mockResolvedValue(true)
            };
            mockProductVariant.findOne.mockResolvedValue(mockVariant);
            mockInventory.destroy.mockResolvedValue(true);

            await deleteProductVariant(req, res);

            expect(mockInventory.destroy).toHaveBeenCalledWith({ where: { variant_id: 'var-123' } });
            expect(mockVariant.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Variant and stock deleted successfully' });
        });
    });
});
