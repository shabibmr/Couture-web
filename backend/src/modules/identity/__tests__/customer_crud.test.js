import { jest } from '@jest/globals';

const mockCustomer = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(), // If mocking instance update directly, this might be needed on the instance
};

const mockOrder = {};

// Mocks
jest.unstable_mockModule('../models/customer.model.js', () => ({ default: mockCustomer }));
jest.unstable_mockModule('../../order/models/order.model.js', () => ({ default: mockOrder }));
jest.unstable_mockModule('sequelize', () => ({ Op: { or: 'or', like: 'like' } }));

// Import Controller
const { getAllCustomers, getCustomerById, updateCustomer, deleteCustomer } = await import('../customer.controller.js');

describe('Customer CRUD Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            query: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    describe('Get All Customers', () => {
        it('should return paginated customers', async () => {
            mockCustomer.findAndCountAll.mockResolvedValue({ count: 1, rows: [{ id: 1 }] });
            await getAllCustomers(req, res);
            expect(mockCustomer.findAndCountAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [{ id: 1 }] }));
        });
    });

    describe('Get Customer By ID', () => {
        it('should return customer details', async () => {
            req.params.id = 1;
            mockCustomer.findByPk.mockResolvedValue({ id: 1 });
            await getCustomerById(req, res);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });
    });

    describe('Update Customer', () => {
        it('should update customer details', async () => {
            req.params.id = 1;
            req.body = { first_name: 'Jane', status: 'VIP' };
            const mockCustInstance = {
                id: 1,
                first_name: 'John',
                status: 'Active',
                update: jest.fn().mockResolvedValue(true)
            };
            mockCustomer.findByPk.mockResolvedValue(mockCustInstance);

            await updateCustomer(req, res);

            expect(mockCustInstance.update).toHaveBeenCalledWith(expect.objectContaining({
                first_name: 'Jane',
                status: 'VIP'
            }));
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Customer updated successfully' }));
        });
    });

    describe('Delete Customer', () => {
        it('should delete customer', async () => {
            req.params.id = 1;
            const mockCustInstance = {
                id: 1,
                destroy: jest.fn().mockResolvedValue(true)
            };
            mockCustomer.findByPk.mockResolvedValue(mockCustInstance);

            await deleteCustomer(req, res);

            expect(mockCustInstance.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Customer deleted successfully' });
        });
    });
});
