import { jest } from '@jest/globals';
import request from 'supertest';

// Mock all possible models used by Service/QueryBuilder
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

const mockProduct = createModelMock();
const mockCategory = createModelMock();
const mockBrand = createModelMock();
const mockProductImage = createModelMock();
const mockProductVariant = createModelMock();
const mockSize = createModelMock();
const mockColor = createModelMock();
const mockInventory = createModelMock();
const mockReview = createModelMock();
const mockCustomer = createModelMock();

// Mock modules
jest.unstable_mockModule('../../../src/modules/catalog/models/product.model.js', () => ({ default: mockProduct }));
jest.unstable_mockModule('../../../src/modules/catalog/models/category.model.js', () => ({ default: mockCategory }));
jest.unstable_mockModule('../../../src/modules/catalog/models/brand.model.js', () => ({ default: mockBrand }));
jest.unstable_mockModule('../../../src/modules/catalog/models/product_image.model.js', () => ({ default: mockProductImage }));
jest.unstable_mockModule('../../../src/modules/catalog/models/product_variant.model.js', () => ({ default: mockProductVariant }));
jest.unstable_mockModule('../../../src/modules/catalog/models/size.model.js', () => ({ default: mockSize }));
jest.unstable_mockModule('../../../src/modules/catalog/models/color.model.js', () => ({ default: mockColor }));
jest.unstable_mockModule('../../../src/modules/catalog/models/review.model.js', () => ({ default: mockReview }));
jest.unstable_mockModule('../../../src/modules/inventory/models/inventory.model.js', () => ({ default: mockInventory }));
jest.unstable_mockModule('../../../src/modules/identity/models/customer.model.js', () => ({ default: mockCustomer }));

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
        Op: { in: Symbol('in'), or: Symbol('or'), like: Symbol('like'), eq: Symbol('eq') },
        DataTypes: {
            UUID: 'UUID', UUIDV4: 'UUIDV4', STRING: jest.fn<any>().mockImplementation(fn),
            TEXT: jest.fn<any>().mockImplementation(fn), DECIMAL: jest.fn<any>().mockImplementation(fn),
            INTEGER: jest.fn<any>().mockImplementation(fn), BOOLEAN: 'BOOLEAN',
            ENUM: jest.fn<any>().mockImplementation(fn), DATE: 'DATE', NOW: 'NOW',
        }
    };
});

// Mock MinIO
jest.unstable_mockModule('../../../src/config/minio.js', () => ({
    BUCKETS: { PRODUCTS: 'products' },
    initializeBuckets: jest.fn(),
    ensureBucket: jest.fn(),
    minioClient: {},
    MINIO_PUBLIC_URL: 'http://minio-public-url',
    default: {},
}));
jest.unstable_mockModule('../../../src/utils/minio-url.js', () => ({
    getMinioUrl: jest.fn((url: string) => `http://minio/bucket/${url}`),
}));

// Import app
const { app } = await import('../../../src/app.js');

describe('Product Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /products', () => {
        it('should return a list of products', async () => {
            mockProduct.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [{
                    id: 1, name: 'Test Product', slug: 'test', price: 100,
                    toJSON: () => ({ id: 1, name: 'Test Product', slug: 'test' })
                }]
            });

            const res = await request(app).get('/products');
            if (res.status !== 200) console.error('GET /products fail:', res.body);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });
    });

    describe('GET /products/:slug', () => {
        it('should return a product by slug', async () => {
            mockProduct.findOne.mockResolvedValue({
                id: 1, name: 'Test Product', slug: 'test',
                toJSON: () => ({ id: 1, name: 'Test Product', slug: 'test' })
            });

            const res = await request(app).get('/products/test');
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Test Product');
        });
    });
});
