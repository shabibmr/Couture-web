import { jest } from '@jest/globals';

const mockInventory = {
    findAll: jest.fn(),
    findOne: jest.fn(),
};

const mockProductVariant = {};
const mockProduct = {};
const mockSize = {};
const mockColor = {};

jest.unstable_mockModule('../models/inventory.model.js', () => ({ default: mockInventory }));
jest.unstable_mockModule('../../catalog/models/product_variant.model.js', () => ({ default: mockProductVariant }));
jest.unstable_mockModule('../../catalog/models/product.model.js', () => ({ default: mockProduct }));
jest.unstable_mockModule('../../catalog/models/size.model.js', () => ({ default: mockSize }));
jest.unstable_mockModule('../../catalog/models/color.model.js', () => ({ default: mockColor }));

const {
    getInventory,
    updateStock,
    getLowStock
} = await import('../inventory.controller.js');

describe('Inventory Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    describe('getInventory', () => {
        it('should return inventory with products', async () => {
            const inventory = [{ id: 1, quantity: 10 }];
            mockInventory.findAll.mockResolvedValue(inventory);

            await getInventory(req, res);

            expect(mockInventory.findAll).toHaveBeenCalledWith(expect.objectContaining({
                include: expect.anything()
            }));
            expect(res.json).toHaveBeenCalledWith(inventory);
        });
    });

    describe('updateStock', () => {
        it('should update stock for variant', async () => {
            req.body = { variant_id: 'v1', quantity: 50 };
            const invRecord = {
                id: 1,
                quantity: 10,
                save: jest.fn().mockResolvedValue(true)
            };
            mockInventory.findOne.mockResolvedValue(invRecord);

            await updateStock(req, res);

            expect(mockInventory.findOne).toHaveBeenCalledWith({ where: { variant_id: 'v1' } });
            expect(invRecord.quantity).toBe(50);
            expect(invRecord.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 404 if inventory not found', async () => {
            req.body = { variant_id: 'v1' };
            mockInventory.findOne.mockResolvedValue(null);

            await updateStock(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('getLowStock', () => {
        it('should return low stock items', async () => {
            const items = [
                { id: 1, quantity: 5, low_stock_threshold: 10 },
                { id: 2, quantity: 20, low_stock_threshold: 10 }
            ];
            mockInventory.findAll.mockResolvedValue(items);

            await getLowStock(req, res);

            expect(res.json).toHaveBeenCalledWith([items[0]]);
        });
    });
});
