import { jest } from '@jest/globals';
import request from 'supertest';

// Mock models
const createModelMock = () => {
    const mock: any = function () { };
    mock.belongsTo = jest.fn();
    mock.hasMany = jest.fn();
    mock.hasOne = jest.fn();
    mock.findOne = jest.fn();
    mock.findAll = jest.fn();
    mock.findAndCountAll = jest.fn();
    mock.findByPk = jest.fn();
    mock.create = jest.fn();
    mock.update = jest.fn();
    mock.destroy = jest.fn();
    mock.bulkCreate = jest.fn();
    mock.prototype = {};
    return mock;
};

const mocks = {
    Order: createModelMock(),
    OrderItem: createModelMock(),
    Cart: createModelMock(),
    CartItem: createModelMock(),
    Product: createModelMock(),
    ProductVariant: createModelMock(),
    Size: createModelMock(),
    Inventory: createModelMock(),
    Setting: createModelMock(),
    CouponUsage: createModelMock(),
    Shipment: createModelMock(),
    PaymentTransaction: createModelMock(),
};

// Mock modules
jest.unstable_mockModule('../../../src/modules/order/models/order.model.js', () => ({ default: mocks.Order }));
jest.unstable_mockModule('../../../src/modules/order/models/order_item.model.js', () => ({ default: mocks.OrderItem }));
jest.unstable_mockModule('../../../src/modules/order/models/cart.model.js', () => ({ default: mocks.Cart }));
jest.unstable_mockModule('../../../src/modules/order/models/cart_item.model.js', () => ({ default: mocks.CartItem }));
jest.unstable_mockModule('../../../src/modules/catalog/models/product.model.js', () => ({ default: mocks.Product }));
jest.unstable_mockModule('../../../src/modules/catalog/models/product_variant.model.js', () => ({ default: mocks.ProductVariant }));
jest.unstable_mockModule('../../../src/modules/catalog/models/size.model.js', () => ({ default: mocks.Size }));
jest.unstable_mockModule('../../../src/modules/inventory/models/inventory.model.js', () => ({ default: mocks.Inventory }));
jest.unstable_mockModule('../../../src/modules/system/settings.model.js', () => ({ default: mocks.Setting }));
jest.unstable_mockModule('../../../src/modules/marketing/models/coupon_usage.model.js', () => ({ default: mocks.CouponUsage }));

// Mock database
jest.unstable_mockModule('../../../src/config/database.js', () => ({
    default: {
        authenticate: jest.fn<any>().mockResolvedValue(undefined),
        sync: jest.fn<any>().mockResolvedValue(undefined),
        close: jest.fn<any>().mockResolvedValue(undefined),
        transaction: jest.fn<any>().mockResolvedValue({
            commit: jest.fn(),
            rollback: jest.fn(),
        }),
        define: jest.fn<any>().mockImplementation(createModelMock),
    },
}));

// Mock sequelize package
jest.unstable_mockModule('sequelize', () => {
    const fn = (...args: any[]) => args.join(',');
    return {
        Op: { in: Symbol('in'), or: Symbol('or'), eq: Symbol('eq') },
        DataTypes: {
            UUID: 'UUID', UUIDV4: 'UUIDV4', STRING: jest.fn<any>().mockImplementation(fn),
            TEXT: jest.fn<any>().mockImplementation(fn), DECIMAL: jest.fn<any>().mockImplementation(fn),
            INTEGER: jest.fn<any>().mockImplementation(fn), BOOLEAN: 'BOOLEAN',
            ENUM: jest.fn<any>().mockImplementation(fn), DATE: 'DATE', NOW: 'NOW',
        }
    };
});

// Mock dependent services
jest.unstable_mockModule('../../../src/modules/marketing/services/coupon.service.js', () => ({
    default: {
        validateCoupon: jest.fn<any>(),
        recordMultipleUsage: jest.fn<any>(),
    }
}));

// Import app
const { app } = await import('../../../src/app.js');

describe('Order Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /orders', () => {
        it('should create an order successfully from payload items', async () => {
            const orderPayload = {
                items: [{ product_id: '123', quantity: 1, size: 'M' }],
                shipping_address: { street: '123' },
                billing_address: { street: '123' },
                payment_method: 'cod'
            };

            mocks.Size.findAll.mockResolvedValue([{ id: 1, name: 'M' }]);
            mocks.ProductVariant.findAll.mockResolvedValue([{
                id: 1, variant_price: 100, Product: { name: 'P', category_id: 1 }
            }]);
            mocks.Inventory.findAll.mockResolvedValue([{ variant_id: 1, quantity: 10, save: jest.fn() }]);
            mocks.Setting.findAll.mockResolvedValue([]);
            mocks.Order.create.mockResolvedValue({ id: 1, order_number: 'ORD-123' });
            mocks.Order.findOne.mockResolvedValue({
                id: 1, order_number: 'ORD-123', toJSON: () => ({ id: 1, order_number: 'ORD-123' })
            });

            const res = await request(app).post('/orders').send(orderPayload);
            if (res.status !== 201) console.error('POST /orders fail:', res.body);
            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Order created successfully');
        });
    });
});
