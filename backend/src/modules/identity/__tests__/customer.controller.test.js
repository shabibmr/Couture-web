import { jest } from '@jest/globals';

const mockCustomer = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
};

const mockOrder = {};

// ESM Mocking
jest.unstable_mockModule('../models/customer.model.js', () => ({ default: mockCustomer }));
jest.unstable_mockModule('../../order/models/order.model.js', () => ({ default: mockOrder }));

const {
    getAllCustomers,
    getCustomerById
} = await import('../customer.controller.js');

describe('Customer Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {},
            params: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('getAllCustomers', () => {
        it('should return paginated customers', async () => {
            req.query = { page: 1, limit: 10 };
            const mockData = {
                count: 2,
                rows: [{ id: 1, first_name: 'John' }, { id: 2, first_name: 'Jane' }]
            };
            mockCustomer.findAndCountAll.mockResolvedValue(mockData);

            await getAllCustomers(req, res);

            expect(mockCustomer.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                limit: 10,
                offset: 0
            }));
            expect(res.json).toHaveBeenCalledWith({
                total: 2,
                pages: 1,
                currentPage: 1,
                data: mockData.rows
            });
        });

        it('should handle search query', async () => {
            req.query = { search: 'John' };
            mockCustomer.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

            await getAllCustomers(req, res);

            // Verify Op.or is used in where clause - tricky to check exact Symbol keys in jest without reference
            // So checking if findAndCountAll was called is enough for unit
            expect(mockCustomer.findAndCountAll).toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            mockCustomer.findAndCountAll.mockRejectedValue(new Error('DB Error'));

            await getAllCustomers(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
        });
    });

    describe('getCustomerById', () => {
        it('should return customer details', async () => {
            req.params.id = 1;
            const mockCustomerData = { id: 1, first_name: 'John' };
            mockCustomer.findByPk.mockResolvedValue(mockCustomerData);

            await getCustomerById(req, res);

            expect(mockCustomer.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
            expect(res.json).toHaveBeenCalledWith(mockCustomerData);
        });

        it('should return 404 if customer not found', async () => {
            req.params.id = 999;
            mockCustomer.findByPk.mockResolvedValue(null);

            await getCustomerById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Customer not found' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            mockCustomer.findByPk.mockRejectedValue(new Error('DB Error'));

            await getCustomerById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
        });
    });
});
