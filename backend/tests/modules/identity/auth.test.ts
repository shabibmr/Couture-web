import { jest } from '@jest/globals';
import request from 'supertest';

// Mock dependencies
const mockCustomer = {
    findOne: jest.fn<any>(),
    create: jest.fn<any>(),
    findByPk: jest.fn<any>(),
    validatePassword: jest.fn<any>(),
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    hasOne: jest.fn(),
};

// Mock the model module
jest.unstable_mockModule('../../../src/modules/identity/models/customer.model.js', () => ({
    default: mockCustomer,
}));

// Mock sequelize to avoid connection errors during app import
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

// Import app AFTER mocking
const { app } = await import('../../../src/app.js');

describe('Auth Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /auth/register', () => {
        it('should register a new customer', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                first_name: 'John',
                last_name: 'Doe',
            };

            mockCustomer.findOne.mockResolvedValue(null);
            mockCustomer.create.mockResolvedValue({
                id: 1,
                ...userData,
            });

            const res = await request(app)
                .post('/auth/register')
                .send(userData);

            if (res.status !== 201) {
                console.error('Registration failed:', res.body);
            }

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
        });

        it('should return 400 if email already exists', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                first_name: 'John',
                last_name: 'Doe',
            };

            mockCustomer.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });

            const res = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(res.status).toBe(400);
        });
    });

    describe('POST /auth/login', () => {
        it('should login with valid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'password123',
            };

            mockCustomer.findOne.mockResolvedValue({
                id: 1,
                email: 'test@example.com',
                validatePassword: jest.fn<any>().mockResolvedValue(true),
            });

            const res = await request(app)
                .post('/auth/login')
                .send(loginData);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });
    });
});
