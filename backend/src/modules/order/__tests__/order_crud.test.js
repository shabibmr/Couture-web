import { jest } from '@jest/globals';

const mockOrder = {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
};

const mockOrderItem = {
    bulkCreate: jest.fn(),
    destroy: jest.fn(),
};

const mockCart = {
    findOne: jest.fn(),
};

const mockCartItem = {
    destroy: jest.fn(),
};

const mockSequelize = {
    transaction: jest.fn(() => ({
        commit: jest.fn(),
        rollback: jest.fn(),
    })),
};

// Mocks
jest.unstable_mockModule('../models/order.model.js', () => ({ default: mockOrder }));
jest.unstable_mockModule('../models/order_item.model.js', () => ({ default: mockOrderItem }));
jest.unstable_mockModule('../models/cart.model.js', () => ({ default: mockCart }));
jest.unstable_mockModule('../models/cart_item.model.js', () => ({ default: mockCartItem }));
jest.unstable_mockModule('../../../config/database.js', () => ({ default: mockSequelize }));
jest.unstable_mockModule('../../catalog/models/product_variant.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../../catalog/models/product.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../../inventory/models/inventory.model.js', () => ({ default: mockInventory }));

// Mock Inventory
const mockInventory = {
    findOne: jest.fn(),
};

// Import Controller
const { createOrder, getOrders, updateOrderStatus, deleteOrder } = await import('../order.controller.js');

describe('Order CRUD Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            user: { id: 'cust-123' },
            query: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    describe('Create Order', () => {
        it('should create an order and reserve stock', async () => {
            req.body = {
                shipping_address: { city: 'Test City' },
                billing_address: { city: 'Test City' },
                shipping_method_id: 'ship-1'
            };

            const mockCartItems = [
                {
                    variant_id: 'var-1',
                    quantity: 2,
                    ProductVariant: {
                        variant_price: 100,
                        Product: { name: 'Test Product', base_price: 100 },
                        sku: 'TEST-SKU'
                    }
                }
            ];

            mockCart.findOne.mockResolvedValue({
                id: 'cart-1',
                items: mockCartItems
            });

            // Mock Inventory for Reservation
            const mockInvInstance = {
                id: 'inv-1',
                quantity: 10,
                reserved_quantity: 0,
                save: jest.fn().mockResolvedValue(true)
            };
            mockInventory.findOne.mockResolvedValue(mockInvInstance);

            mockOrder.create.mockResolvedValue({ id: 'order-1', total_amount: 250 });

            await createOrder(req, res);

            expect(mockInventory.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { variant_id: 'var-1' } }));
            expect(mockInvInstance.reserved_quantity).toBe(2); // Should be incremented
            expect(mockInvInstance.save).toHaveBeenCalled();
            expect(mockOrder.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should fail if insufficient stock', async () => {
            const mockCartItems = [
                {
                    variant_id: 'var-1',
                    quantity: 20, // Requesting 20
                    ProductVariant: {
                        variant_price: 100,
                        Product: { name: 'Test', base_price: 100 },
                        sku: 'TEST'
                    }
                }
            ];
            mockCart.findOne.mockResolvedValue({ id: 'cart-1', items: mockCartItems });

            // Mock Inventory (Only 10 available)
            mockInventory.findOne.mockResolvedValue({
                id: 'inv-1',
                quantity: 10,
                reserved_quantity: 0
            });

            await createOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Insufficient stock') }));
        });
    });

    describe('Read Orders', () => {
        it('should return list of orders', async () => {
            mockOrder.findAndCountAll.mockResolvedValue({ count: 1, rows: [{ id: 'order-1' }] });
            await getOrders(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [{ id: 'order-1' }] }));
        });
    });

    describe('Update Order Status', () => {
        it('should update status', async () => {
            req.params.id = 'order-1';
            req.body.status = 'shipped';
            const mockOrderInstance = {
                id: 'order-1',
                status: 'pending',
                items: [], // Added for stock logic
                save: jest.fn().mockResolvedValue(true)
            };
            mockOrder.findByPk.mockResolvedValue(mockOrderInstance);

            await updateOrderStatus(req, res);

            expect(mockOrderInstance.status).toBe('shipped');
            expect(mockOrderInstance.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Order status updated successfully' }));
        });
    });

    describe('Delete Order', () => {
        it('should delete order and items', async () => {
            req.params.id = 'order-1';
            const mockOrderInstance = {
                id: 'order-1',
                destroy: jest.fn().mockResolvedValue(true)
            };
            mockOrder.findByPk.mockResolvedValue(mockOrderInstance);

            await deleteOrder(req, res);

            expect(mockOrderItem.destroy).toHaveBeenCalledWith({ where: { order_id: 'order-1' } });
            expect(mockOrderInstance.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Order deleted successfully' });
        });
    });
});
