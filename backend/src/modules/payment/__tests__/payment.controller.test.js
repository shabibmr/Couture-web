import { jest } from '@jest/globals';

const mockPaymentTransaction = {
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
};

const mockOrder = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
};

const mockPaymentGateway = {
    findOrCreate: jest.fn(),
};

const mockRefund = {
    create: jest.fn(),
};

const mockCustomer = {};

const mockRazorpayInstance = {
    orders: {
        create: jest.fn(),
        fetch: jest.fn(),
    },
    payments: {
        fetch: jest.fn(),
        refund: jest.fn(),
    }
};

const mockRazorpayConstructor = jest.fn(() => mockRazorpayInstance);

const mockCrypto = {
    createHmac: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(),
};

const mockEmailService = {
    sendPaymentSuccessEmail: jest.fn(),
    sendPaymentFailedEmail: jest.fn(),
    sendRefundProcessedEmail: jest.fn(),
    sendAdminOrderNotification: jest.fn(),
};

const mockNotificationService = {
    createNotification: jest.fn(),
};

jest.unstable_mockModule('razorpay', () => ({ default: mockRazorpayConstructor }));
jest.unstable_mockModule('crypto', () => ({ default: mockCrypto }));
jest.unstable_mockModule('../models/payment_transaction.model.js', () => ({ default: mockPaymentTransaction }));
jest.unstable_mockModule('../models/payment_gateway.model.js', () => ({ default: mockPaymentGateway }));
jest.unstable_mockModule('../models/refund.model.js', () => ({ default: mockRefund }));
jest.unstable_mockModule('../../order/models/order.model.js', () => ({ default: mockOrder }));
jest.unstable_mockModule('../../identity/models/customer.model.js', () => ({ default: mockCustomer }));
jest.unstable_mockModule('../../notification/services/email.service.js', () => mockEmailService);
jest.unstable_mockModule('../../notification/services/notification.service.js', () => mockNotificationService);

const {
    getAllPayments,
    createRazorpayOrder,
    verifyPayment,
    handleWebhook
} = await import('../payment.controller.js');

describe('Payment Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {},
            body: {},
            params: {},
            user: { id: 1 },
            headers: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();

        // Setup env vars
        process.env.RAZORPAY_KEY_ID = 'test_key';
        process.env.RAZORPAY_KEY_SECRET = 'test_secret';
        process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret';
    });

    describe('createRazorpayOrder', () => {
        it('should create razorpay order', async () => {
            req.body = { order_id: 100 };
            const order = { id: 100, total_amount: 500, status: 'pending', order_number: 'ORD-123' };
            mockOrder.findOne.mockResolvedValue(order);

            mockRazorpayInstance.orders.create.mockResolvedValue({ id: 'rzp_123', currency: 'INR', amount: 50000 });
            mockPaymentGateway.findOrCreate.mockResolvedValue([{ id: 1 }]);

            await createRazorpayOrder(req, res);

            expect(mockOrder.findOne).toHaveBeenCalled();
            expect(mockRazorpayInstance.orders.create).toHaveBeenCalled();
            expect(mockPaymentTransaction.create).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'rzp_123' }));
        });
    });

    describe('verifyPayment', () => {
        it('should verify valid payment signature', async () => {
            req.body = {
                razorpay_order_id: 'rzp_123',
                razorpay_payment_id: 'pay_123',
                razorpay_signature: 'valid_sig'
            };

            mockCrypto.digest.mockReturnValue('valid_sig');

            const transaction = {
                id: 1,
                order_id: 100,
                status: 'pending',
                gateway_response: {},
                update: jest.fn().mockResolvedValue(true)
            };
            mockPaymentTransaction.findOne.mockResolvedValue(transaction);

            const order = {
                id: 100,
                update: jest.fn().mockResolvedValue(true),
                Customer: { id: 1, email: 'test' }
            };
            mockOrder.findByPk.mockResolvedValue(order);

            await verifyPayment(req, res);

            expect(transaction.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
            expect(order.update).toHaveBeenCalledWith({ status: 'confirmed' });
            expect(mockEmailService.sendPaymentSuccessEmail).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
        });

        it('should fail with invalid signature', async () => {
            req.body = {
                razorpay_order_id: 'rzp_123',
                razorpay_payment_id: 'pay_123',
                razorpay_signature: 'invalid'
            };

            mockCrypto.digest.mockReturnValue('valid_sig'); // Mismatches 'invalid'

            const transaction = {
                id: 1,
                gateway_response: {},
                update: jest.fn().mockResolvedValue(true)
            };
            mockPaymentTransaction.findOne.mockResolvedValue(transaction);

            await verifyPayment(req, res);

            expect(transaction.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'failed' }));
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
