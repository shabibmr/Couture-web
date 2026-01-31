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
};

const mockFirebaseAdmin = {
    auth: jest.fn().mockReturnValue({
        verifyIdToken: jest.fn(),
    }),
};

// ESM Mocking
jest.unstable_mockModule('jsonwebtoken', () => ({ default: mockJwt }));
jest.unstable_mockModule('../models/customer.model.js', () => ({ default: mockCustomer }));
// Mock other dependencies to avoid load errors
jest.unstable_mockModule('../models/admin.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/password_reset_token.model.js', () => ({ default: {} }));
jest.unstable_mockModule('../../../config/firebase.js', () => ({ default: mockFirebaseAdmin }));

// Dynamic Import
const { syncFirebaseUser } = await import('../auth.controller.js');

describe('Firebase Email/Password Auth Integration', () => {
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

    it('should create a new user using names provided in request body when token lacks name', async () => {
        // payload from client
        req.body = {
            idToken: 'token_with_email_only',
            first_name: 'Jane',
            last_name: 'Doe'
        };

        // Firebase returns email/uid but no name (common in email/pw signup)
        mockFirebaseAdmin.auth().verifyIdToken.mockResolvedValue({
            uid: 'firebase-uid-jane',
            email: 'jane@example.com',
            email_verified: false
        });

        // Mock Find (not found)
        mockCustomer.findOne.mockResolvedValue(null);

        // Mock Create
        mockCustomer.create.mockResolvedValue({
            id: 101,
            email: 'jane@example.com',
            first_name: 'Jane',
            last_name: 'Doe',
            save: jest.fn()
        });

        mockJwt.sign.mockReturnValue('new_jwt_token');

        await syncFirebaseUser(req, res);

        // Verify Customer.create was called with correct names from BODY, not defaults
        expect(mockCustomer.create).toHaveBeenCalledWith(expect.objectContaining({
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane@example.com',
            oauth_provider: 'firebase'
        }));

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('registered and synced'),
            user: expect.objectContaining({
                first_name: 'Jane',
                last_name: 'Doe'
            })
        }));
    });

    it('should fall back to defaults if no name in body OR token', async () => {
        req.body = {
            idToken: 'token_no_name'
        };

        mockFirebaseAdmin.auth().verifyIdToken.mockResolvedValue({
            uid: 'firebase-uid-anon',
            email: 'anon@example.com'
        });

        mockCustomer.findOne.mockResolvedValue(null);
        mockCustomer.create.mockResolvedValue({
            id: 102,
            first_name: 'User',
            last_name: '',
            email: 'anon@example.com'
        });

        await syncFirebaseUser(req, res);

        expect(mockCustomer.create).toHaveBeenCalledWith(expect.objectContaining({
            first_name: 'User',
            last_name: ''
        }));
    });
});
