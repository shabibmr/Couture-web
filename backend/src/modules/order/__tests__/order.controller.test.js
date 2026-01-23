import { jest } from '@jest/globals';

const mockOrder = {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
};

const mockOrderItem = {
    bulkCreate: jest.fn(),
};

const mockCart = {
    findOne: jest.fn(),
};

const mockCartItem = {
    destroy: jest.fn(),
};

const mockProductVariant = {};
const mockProduct = {};

const mockSequelize = {
    transaction: jest.fn(),
};

jest.unstable_mockModule('../models/order.model.js', () => ({ default: mockOrder }));
jest.unstable_mockModule('../models/order_item.model.js', () => ({ default: mockOrderItem }));
jest.unstable_mockModule('../models/cart.model.js', () => ({ default: mockCart }));
jest.unstable_mockModule('../models/cart_item.model.js', () => ({ default: mockCartItem }));
jest.unstable_mockModule('../../catalog/models/product_variant.model.js', () => ({ default: mockProductVariant }));
jest.unstable_mockModule('../../catalog/models/product.model.js', () => ({ default: mockProduct }));
jest.unstable_mockModule('../../../config/database.js', () => ({ default: mockSequelize }));

const {
    createOrder,
    getOrders,
    getOrderById
} = await import('../order.controller.js');

describe('Order Controller', () => {
    let req, res, mockTransaction;

    beforeEach(() => {
        req = {
            user: { id: 1, type: 'customer' },
            body: {},
            params: {},
            query: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        mockTransaction = {
            commit: jest.fn(),
            rollback: jest.fn(),
        };
        mockSequelize.transaction.mockResolvedValue(mockTransaction);

        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        // ... (Tests will be added in next chunk if needed, but I'll write full content)
        it('should create order from cart successfully', async () => {
            req.body = {
                shipping_address: 'Addr',
                billing_address: 'Addr',
                shipping_method_id: 'sm1'
            };

            const cartItems = [
                {
                    variant_id: 'v1',
                    quantity: 2,
                    ProductVariant: {
                        variant_price: 100,
                        sku: 'SKU1',
                        Product: { name: 'P1', base_price: 100 }
                    }
                }
            ];
            const cart = { id: 1, customer_id: 1, items: cartItems };
            mockCart.findOne.mockResolvedValue(cart);

            const createdOrder = { id: 100, ...req.body };
            mockOrder.create.mockResolvedValue(createdOrder);

            await createOrder(req, res);

            expect(mockSequelize.transaction).toHaveBeenCalled();
            expect(mockCart.findOne).toHaveBeenCalled();
            expect(mockOrder.create).toHaveBeenCalled(); // Check args if robust verification needed
            expect(mockOrderItem.bulkCreate).toHaveBeenCalled();
            expect(mockCartItem.destroy).toHaveBeenCalled();
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should fail if cart is empty', async () => {
            mockCart.findOne.mockResolvedValue(null);

            await createOrder(req, res);

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Cart is empty' });
        });

        it('should rollback on error', async () => {
            mockCart.findOne.mockRejectedValue(new Error('DB Error'));

            await createOrder(req, res);

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getOrders', () => {
        it('should return paginated orders for customer', async () => {
            const ordersData = { count: 1, rows: [{ id: 1 }] };
            mockOrder.findAndCountAll.mockResolvedValue(ordersData);

            await getOrders(req, res);

            expect(mockOrder.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                where: { customer_id: 1 }
            }));
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 1 }));
        });

        it('should return all orders for admin', async () => {
            req.user = { id: 1, role: 'admin' }; // Override user
            const ordersData = { count: 1, rows: [{ id: 1 }] };
            mockOrder.findAndCountAll.mockResolvedValue(ordersData);

            await getOrders(req, res);

            // Where clause should be empty (or at least not limited to customer_id)
            expect(mockOrder.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                where: {}
            }));
        });
    });

    describe('getOrderById', () => {
        it('should return order details', async () => {
            req.params.id = 1;
            const order = { id: 1 };
            mockOrder.findOne.mockResolvedValue(order);

            await getOrderById(req, res);

            expect(mockOrder.findOne).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 1, customer_id: 1 }
            }));
            expect(res.json).toHaveBeenCalledWith(order);
        });
    });
});
