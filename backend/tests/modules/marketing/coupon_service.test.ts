import { jest } from '@jest/globals';

// Mock models
const mockCoupon = {
    findAll: jest.fn<any>(),
    findOne: jest.fn<any>(),
    increment: jest.fn<any>(),
};
const mockCouponUsage = {
    count: jest.fn<any>(),
    findOne: jest.fn<any>(),
    create: jest.fn<any>(),
};
const mockOrder = {
    count: jest.fn<any>(),
};

// Mock dependencies
jest.unstable_mockModule('../../../src/modules/marketing/models/coupon.model.js', () => ({ default: mockCoupon }));
jest.unstable_mockModule('../../../src/modules/marketing/models/coupon_usage.model.js', () => ({ default: mockCouponUsage }));
jest.unstable_mockModule('../../../src/modules/order/models/order.model.js', () => ({ default: mockOrder }));

// Mock Sequelize Op
jest.unstable_mockModule('sequelize', () => ({
    Op: {
        in: Symbol('in'),
        gte: Symbol('gte'),
        lte: Symbol('lte'),
    }
}));


// Import Service AFTER mocking
const { default: CouponService } = await import('../../../src/modules/marketing/services/coupon.service.js') as any;

describe('CouponService Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateCoupon', () => {
        const validContext = {
            customerId: 1,
            cartTotal: 100,
            items: [{ product_id: 10, unit_price: 50, quantity: 2 }]
        };

        const activeCoupon = {
            id: 1,
            code: 'TEST10',
            is_active: true,
            min_order_value: 0,
            usage_limit: 0,
            used_count: 0,
            discount_type: 'percentage',
            discount_value: 10
        };

        it('should validate a correct coupon', async () => {
            mockCoupon.findOne.mockResolvedValue(activeCoupon);

            const result = await CouponService.validateCoupon('TEST10', validContext);

            expect(result.isValid).toBe(true);
            expect(result.discountAmount).toBe(10); // 10% of 100
        });

        it('should fail if coupon not found or active', async () => {
            mockCoupon.findOne.mockResolvedValue(null);

            const result = await CouponService.validateCoupon('INVALID', validContext);

            expect(result.isValid).toBe(false);
            expect(result.status).toBe(404);
        });

        it('should fail if minimum order value not met', async () => {
            mockCoupon.findOne.mockResolvedValue({
                ...activeCoupon,
                min_order_value: 200
            });

            const result = await CouponService.validateCoupon('TEST10', validContext);

            expect(result.isValid).toBe(false);
            expect(result.message).toContain('Minimum order value');
        });

        it('should fail if product targeting mismatch', async () => {
            mockCoupon.findOne.mockResolvedValue({
                ...activeCoupon,
                applies_to: 'products',
                applicable_product_ids: [999] // Not in items
            });

            const result = await CouponService.validateCoupon('TEST10', validContext);

            expect(result.isValid).toBe(false);
            expect(result.message).toContain('not valid for items');
        });

        it('should pass if product targeting matches', async () => {
            mockCoupon.findOne.mockResolvedValue({
                ...activeCoupon,
                applies_to: 'products',
                applicable_product_ids: [10] // Matches item
            });

            const result = await CouponService.validateCoupon('TEST10', validContext);

            expect(result.isValid).toBe(true);
        });
    });

    describe('validateCustomerConstraints', () => {
        const coupon = {
            per_customer_limit: 1,
            is_first_order_only: false
        };

        it('should fail if per user limit reached', async () => {
            // Service calls validateCustomerConstraints internally in validateCoupon
            // We'll test validateCoupon with this constraint
            mockCoupon.findOne.mockResolvedValue({
                id: 1,
                ...coupon,
                code: 'LIMIT1'
            });

            // Mock usage count
            mockCouponUsage.count.mockResolvedValue(1);

            const result = await CouponService.validateCoupon('LIMIT1', { customerId: 1, cartTotal: 100 });

            expect(result.isValid).toBe(false);
            expect(result.message).toContain('Limit of 1 uses reached');
        });

        it('should pass if limit not reached', async () => {
            mockCoupon.findOne.mockResolvedValue({
                id: 1,
                ...coupon,
                code: 'LIMIT1'
            });

            mockCouponUsage.count.mockResolvedValue(0);

            const result = await CouponService.validateCoupon('LIMIT1', { customerId: 1, cartTotal: 100 });

            expect(result.isValid).toBe(true);
        });
    });

    describe('calculateDiscountAmount', () => {
        it('should calculate fixed discount', () => {
            const coupon = { discount_type: 'fixed', discount_value: 50, applies_to: 'all' };
            const discount = CouponService.calculateDiscountAmount(coupon, 100, []);
            expect(discount).toBe(50);
        });

        it('should cap fixed discount at total', () => {
            const coupon = { discount_type: 'fixed', discount_value: 150, applies_to: 'all' };
            const discount = CouponService.calculateDiscountAmount(coupon, 100, []);
            expect(discount).toBe(100);
        });

        it('should calculate specific product discount', () => {
            const coupon = {
                discount_type: 'percentage',
                discount_value: 50, // 50%
                applies_to: 'products',
                applicable_product_ids: [1]
            };
            const items = [
                { product_id: 1, unit_price: 100, quantity: 1 }, // Eligible: 100
                { product_id: 2, unit_price: 100, quantity: 1 }  // Not eligible
            ];

            const discount = CouponService.calculateDiscountAmount(coupon, 200, items);
            expect(discount).toBe(50); // 50% of 100
        });
    });
});
