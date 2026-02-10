import { jest } from '@jest/globals';
import request from 'supertest';

// Mock Coupon model
const mockCoupon = {
    findAll: jest.fn<any>(),
    findByPk: jest.fn<any>(),
    findOne: jest.fn<any>(),
    create: jest.fn<any>(),
    update: jest.fn<any>(),
    destroy: jest.fn<any>(),
    increment: jest.fn<any>(),
};

// Mock CouponUsage model
const mockCouponUsage = {
    create: jest.fn<any>(),
};

// Mock Service
const mockCouponService = {
    validateCoupon: jest.fn<any>(),
    validateMultipleCoupons: jest.fn<any>(),
    calculateDiscountAmount: jest.fn<any>(),
};

// Mock modules
jest.unstable_mockModule('../../../src/modules/marketing/models/coupon.model.js', () => ({ default: mockCoupon }));
jest.unstable_mockModule('../../../src/modules/marketing/models/coupon_usage.model.js', () => ({ default: mockCouponUsage }));
jest.unstable_mockModule('../../../src/modules/marketing/services/coupon.service.js', () => ({ default: mockCouponService }));

// Mock generic DB
jest.unstable_mockModule('../../../src/config/database.js', () => ({
    default: {
        authenticate: jest.fn<any>().mockResolvedValue(undefined),
        sync: jest.fn<any>().mockResolvedValue(undefined),
        close: jest.fn<any>().mockResolvedValue(undefined),
        transaction: jest.fn<any>().mockResolvedValue({
            commit: jest.fn(),
            rollback: jest.fn(),
        }),
        define: jest.fn<any>().mockImplementation(() => {
            const MockModel: any = function () { };
            MockModel.belongsTo = jest.fn();
            MockModel.hasMany = jest.fn();
            MockModel.hasOne = jest.fn();
            MockModel.findOne = jest.fn();
            MockModel.findAll = jest.fn();
            MockModel.create = jest.fn();
            MockModel.findByPk = jest.fn();
            MockModel.prototype = {};
            return MockModel;
        }),
    },
}));

// Mock sequelize package
jest.unstable_mockModule('sequelize', () => {
    const fn = (...args: any[]) => args.join(',');
    return {
        Op: {
            in: Symbol('in'),
            or: Symbol('or'),
            eq: Symbol('eq'),
            gte: Symbol('gte'),
            lte: Symbol('lte'),
        },
        DataTypes: {
            UUID: 'UUID',
            UUIDV4: 'UUIDV4',
            STRING: jest.fn<any>().mockImplementation(fn),
            TEXT: jest.fn<any>().mockImplementation(fn),
            DECIMAL: jest.fn<any>().mockImplementation(fn),
            INTEGER: jest.fn<any>().mockImplementation(fn),
            BOOLEAN: 'BOOLEAN',
            ENUM: jest.fn<any>().mockImplementation(fn),
            DATE: 'DATE',
            NOW: 'NOW',
        }
    };
});

// Mock Auth Middleware
jest.unstable_mockModule('../../../src/middleware/auth.middleware.js', () => ({
    authenticate: (req: any, _res: any, next: any) => {
        req.user = { id: 1, role: 'admin', type: 'admin' };
        next();
    },
    authorize: () => (_req: any, _res: any, next: any) => next(),
    isAdmin: (_req: any, _res: any, next: any) => next(),
}));

// Import app
const { app } = await import('../../../src/app.js');

describe('Coupon Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /coupons', () => {
        it('should return list of coupons', async () => {
            const mockData = [
                { id: 1, code: 'SAVE10', discount_value: 10 }
            ];
            mockCoupon.findAll.mockResolvedValue(mockData);

            const res = await request(app).get('/coupons');

            if (res.status !== 200) {
                console.error('GET /coupons failed:', res.body);
            }

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
        });
    });

    describe('POST /coupons', () => {
        it('should create a new coupon', async () => {
            const newCoupon = { code: 'NEW20', discount_type: 'percent', discount_value: 20 };

            mockCoupon.findOne.mockResolvedValue(null);
            mockCoupon.create.mockResolvedValue({ id: 1, ...newCoupon });

            const res = await request(app).post('/coupons').send(newCoupon);

            if (res.status !== 201) {
                console.error('POST /coupons failed:', res.body);
            }

            expect(res.status).toBe(201);
            expect(res.body.code).toBe('NEW20');
        });
    });
});
