import { jest } from '@jest/globals';

// Mock Dependencies
const mockJwt = {
    sign: jest.fn(),
    verify: jest.fn(),
};

const mockCustomer = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findOrCreate: jest.fn(),
};

const mockAdmin = {
    findOne: jest.fn(),
};

const mockPasswordResetToken = {
    create: jest.fn(),
    findOne: jest.fn(),
};

const mockFirebaseAdmin = {
    auth: jest.fn().mockReturnValue({
        verifyIdToken: jest.fn(),
    }),
};

// ESM Mocking
jest.unstable_mockModule('jsonwebtoken', () => ({ default: mockJwt }));
jest.unstable_mockModule('../models/customer.model.js', () => ({ default: mockCustomer }));
jest.unstable_mockModule('../models/admin.model.js', () => ({ default: mockAdmin }));
jest.unstable_mockModule('../models/password_reset_token.model.js', () => ({ default: mockPasswordResetToken }));
jest.unstable_mockModule('../../../config/firebase.js', () => ({ default: mockFirebaseAdmin }));

// Dynamic Import
const {
    registerCustomer,
    loginCustomer,
    loginAdmin,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    updateCurrentUser
} = await import('../auth.controller.js');

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            user: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test_secret';
    });

    describe('registerCustomer', () => {
        it('should register a new customer', async () => {
            req.body = { email: 'test@example.com', password: 'password', first_name: 'Test' };
            mockCustomer.findOne.mockResolvedValue(null);

            const createdCustomer = { id: 1, ...req.body };
            mockCustomer.create.mockResolvedValue(createdCustomer);
            mockJwt.sign.mockReturnValue('test_token');

            await registerCustomer(req, res);

            expect(mockCustomer.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                token: 'test_token',
                message: 'Customer registered successfully'
            }));
        });

        it('should fail if email already exists', async () => {
            req.body = { email: 'existing@example.com' };
            mockCustomer.findOne.mockResolvedValue({ id: 1 });

            await registerCustomer(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Email already registered' });
        });
    });

    describe('loginCustomer', () => {
        it('should login successfully with valid credentials', async () => {
            req.body = { email: 'test@example.com', password: 'password' };
            const customer = {
                id: 1,
                email: 'test@example.com',
                validatePassword: jest.fn().mockResolvedValue(true)
            };
            mockCustomer.findOne.mockResolvedValue(customer);
            mockJwt.sign.mockReturnValue('test_token');

            await loginCustomer(req, res);

            expect(customer.validatePassword).toHaveBeenCalledWith('password');
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'test_token' }));
        });

        it('should fail with invalid credentials', async () => {
            req.body = { email: 'test@example.com', password: 'wrong' };
            const customer = {
                validatePassword: jest.fn().mockResolvedValue(false)
            };
            mockCustomer.findOne.mockResolvedValue(customer);

            await loginCustomer(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe('loginAdmin', () => {
        it('should login admin successfully', async () => {
            req.body = { email: 'admin@couture.com', password: 'admin' };
            const adminUser = {
                id: 1,
                role: 'superadmin',
                is_active: true,
                validatePassword: jest.fn().mockResolvedValue(true)
            };
            mockAdmin.findOne.mockResolvedValue(adminUser);
            mockJwt.sign.mockReturnValue('admin_token');

            await loginAdmin(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'admin_token' }));
        });
    });

    describe('forgotPassword', () => {
        it('should return success message even if user not found', async () => {
            req.body = { email: 'unknown@example.com' };
            mockCustomer.findOne.mockResolvedValue(null);

            await forgotPassword(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('reset link') }));
        });

        it('should create reset token if user exists', async () => {
            req.body = { email: 'test@example.com' };
            mockCustomer.findOne.mockResolvedValue({ id: 1 });
            mockPasswordResetToken.create.mockResolvedValue({});

            await forgotPassword(req, res);

            expect(mockPasswordResetToken.create).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('reset link') }));
        });
    });

    describe('getCurrentUser', () => {
        it('should return current user profile', async () => {
            req.user = { id: 1 };
            const customer = { id: 1, first_name: 'Test' };
            mockCustomer.findByPk.mockResolvedValue(customer);

            await getCurrentUser(req, res);

            expect(mockCustomer.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
            expect(res.json).toHaveBeenCalledWith(customer);
        });
    });

    describe('updateCurrentUser', () => {
        it('should update user profile', async () => {
            req.user = { id: 1 };
            req.body = { first_name: 'New Name' };
            const customer = {
                id: 1,
                first_name: 'Old Name',
                save: jest.fn().mockResolvedValue(true)
            };
            mockCustomer.findByPk.mockResolvedValue(customer);

            await updateCurrentUser(req, res);

            expect(customer.first_name).toBe('New Name');
            expect(customer.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });
    });
});
