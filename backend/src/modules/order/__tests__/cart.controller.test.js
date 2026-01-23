import { jest } from '@jest/globals';

const mockCart = {
    findOne: jest.fn(),
    create: jest.fn(),
    toJSON: jest.fn(),
};

const mockCartItem = {
    findOrCreate: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
};

const mockProductVariant = {};
const mockProduct = {};
const mockProductImage = {};

const mockInventory = {
    findOne: jest.fn(),
};

jest.unstable_mockModule('../models/cart.model.js', () => ({ default: mockCart }));
jest.unstable_mockModule('../models/cart_item.model.js', () => ({ default: mockCartItem }));
jest.unstable_mockModule('../../catalog/models/product_variant.model.js', () => ({ default: mockProductVariant }));
jest.unstable_mockModule('../../catalog/models/product.model.js', () => ({ default: mockProduct }));
jest.unstable_mockModule('../../catalog/models/product_image.model.js', () => ({ default: mockProductImage }));
jest.unstable_mockModule('../../inventory/models/inventory.model.js', () => ({ default: mockInventory }));

const {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem
} = await import('../cart.controller.js');

describe('Cart Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { id: 1 },
            body: {},
            params: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    describe('getCart', () => {
        it('should return existing cart', async () => {
            const cart = { id: 1, customer_id: 1, items: [] };
            mockCart.findOne.mockResolvedValue(cart);

            await getCart(req, res);

            expect(mockCart.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { customer_id: 1 } }));
            expect(res.json).toHaveBeenCalledWith(cart);
        });

        it('should create new cart if not found', async () => {
            mockCart.findOne.mockResolvedValue(null);
            const newCart = {
                id: 2,
                customer_id: 1,
                toJSON: jest.fn().mockReturnValue({ id: 2, customer_id: 1 })
            };
            mockCart.create.mockResolvedValue(newCart);

            await getCart(req, res);

            expect(mockCart.create).toHaveBeenCalledWith({ customer_id: 1 });
            expect(res.json).toHaveBeenCalledWith({ id: 2, customer_id: 1, items: [] });
        });
    });

    describe('addToCart', () => {
        it('should add new item to cart', async () => {
            req.body = { variant_id: 'v1', quantity: 2 };
            const cart = { id: 1 };
            mockCart.findOne.mockResolvedValue(cart);

            const item = { id: 10, quantity: 2 };
            // findOrCreate returns [instance, created]
            mockCartItem.findOrCreate.mockResolvedValue([item, true]);

            await addToCart(req, res);

            expect(mockCartItem.findOrCreate).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Item added to cart' }));
        });

        it('should update quantity if item exists', async () => {
            req.body = { variant_id: 'v1', quantity: 2 };
            const cart = { id: 1 };
            mockCart.findOne.mockResolvedValue(cart);

            // Mock inventory with sufficient stock
            const inventory = { quantity: 10, reserved_quantity: 0 };
            mockInventory.findOne.mockResolvedValue(inventory);

            // Mock existing cart item
            const existingItem = { quantity: 1 };
            mockCartItem.findOne.mockResolvedValueOnce(existingItem);

            const item = {
                id: 10,
                quantity: 1,
                save: jest.fn().mockResolvedValue(true)
            };
            mockCartItem.findOrCreate.mockResolvedValue([item, false]);

            await addToCart(req, res);

            expect(item.quantity).toBe(3); // 1 + 2
            expect(item.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Item added to cart' }));
        });

        it('should fail if inventory not found', async () => {
            req.body = { variant_id: 'v1', quantity: 2 };
            mockInventory.findOne.mockResolvedValue(null);

            await addToCart(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Product variant not found' });
        });

        it('should fail if insufficient stock', async () => {
            req.body = { variant_id: 'v1', quantity: 5 };
            const cart = { id: 1 };
            mockCart.findOne.mockResolvedValue(cart);

            // Mock inventory with limited stock
            const inventory = { quantity: 3, reserved_quantity: 0 };
            mockInventory.findOne.mockResolvedValue(inventory);

            // No existing cart item
            mockCartItem.findOne.mockResolvedValue(null);

            await addToCart(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Insufficient stock')
            }));
        });

        it('should fail if adding to cart exceeds available stock', async () => {
            req.body = { variant_id: 'v1', quantity: 2 };
            const cart = { id: 1 };
            mockCart.findOne.mockResolvedValue(cart);

            // Mock inventory
            const inventory = { quantity: 5, reserved_quantity: 0 };
            mockInventory.findOne.mockResolvedValue(inventory);

            // Mock existing cart item with 4 already in cart
            const existingItem = { quantity: 4 };
            mockCartItem.findOne.mockResolvedValue(existingItem);

            await addToCart(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Insufficient stock')
            }));
        });

        it('should validate quantity is positive', async () => {
            req.body = { variant_id: 'v1', quantity: -1 };

            await addToCart(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid quantity' });
        });
    });

    describe('updateCartItem', () => {
        it('should update cart item quantity', async () => {
            req.params.id = 10;
            req.body = { quantity: 5 };
            const cart = { id: 1 };
            mockCart.findOne.mockResolvedValue(cart);

            const item = {
                id: 10,
                quantity: 1,
                save: jest.fn().mockResolvedValue(true)
            };
            mockCartItem.findOne.mockResolvedValue(item);

            await updateCartItem(req, res);

            expect(item.quantity).toBe(5);
            expect(item.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cart item updated' }));
        });

        it('should remove item if quantity <= 0', async () => {
            req.params.id = 10;
            req.body = { quantity: 0 };
            const cart = { id: 1 };
            mockCart.findOne.mockResolvedValue(cart);

            const item = {
                id: 10,
                destroy: jest.fn().mockResolvedValue(true)
            };
            mockCartItem.findOne.mockResolvedValue(item);

            await updateCartItem(req, res);

            expect(item.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Item removed from cart' }));
        });
    });

    describe('removeCartItem', () => {
        it('should remove item', async () => {
            req.params.id = 10;
            const cart = { id: 1 };
            mockCart.findOne.mockResolvedValue(cart);
            mockCartItem.destroy.mockResolvedValue(1); // 1 row deleted

            await removeCartItem(req, res);

            expect(mockCartItem.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Item removed from cart' });
        });
    });
});
