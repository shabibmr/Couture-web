import { jest } from '@jest/globals';

// Mock Models
const mockProduct = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn(),
};

const mockCategory = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn(),
};

const mockBrand = {};
const mockProductImage = {
    create: jest.fn(),
    destroy: jest.fn(),
};
const mockProductVariant = {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
};
const mockSize = {};
const mockColor = {};
const mockReview = {
    findAll: jest.fn(),
    create: jest.fn(),
};
const mockCustomer = {};
const mockInventory = {
    create: jest.fn(),
    destroy: jest.fn(),
};

// Use unstable_mockModule for ESM mocking
// MUST be called before importing the module under test
jest.unstable_mockModule('../models/product.model.js', () => ({ default: mockProduct }));
jest.unstable_mockModule('../models/category.model.js', () => ({ default: mockCategory }));
jest.unstable_mockModule('../models/brand.model.js', () => ({ default: mockBrand }));
jest.unstable_mockModule('../models/product_image.model.js', () => ({ default: mockProductImage }));
jest.unstable_mockModule('../models/product_variant.model.js', () => ({ default: mockProductVariant }));
jest.unstable_mockModule('../models/size.model.js', () => ({ default: mockSize }));
jest.unstable_mockModule('../models/color.model.js', () => ({ default: mockColor }));
jest.unstable_mockModule('../models/review.model.js', () => ({ default: mockReview }));
jest.unstable_mockModule('../../identity/models/customer.model.js', () => ({ default: mockCustomer }));
jest.unstable_mockModule('../../inventory/models/inventory.model.js', () => ({ default: mockInventory }));

// Dynamic import for the controller
const {
    getAllProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getProductReviews,
    createProductReview,
    addProductVariant,
    deleteProductVariant
} = await import('../product.controller.js');

describe('Product Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
            body: {},
            user: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    describe('getAllProducts', () => {
        it('should return paginated products', async () => {
            const mockData = {
                count: 1,
                rows: [{ id: 1, name: 'Test Product' }]
            };
            mockProduct.findAndCountAll.mockResolvedValue(mockData);

            await getAllProducts(req, res);

            expect(mockProduct.findAndCountAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                total: 1,
                pages: 1,
                currentPage: 1,
                data: mockData.rows
            });
        });

        it('should handle errors', async () => {
            mockProduct.findAndCountAll.mockRejectedValue(new Error('Database error'));

            await getAllProducts(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
        });
    });

    describe('getProductById', () => {
        it('should return a product by ID', async () => {
            const mockProductData = { id: 1, name: 'Test Product' };
            req.params.id = 1;
            mockProduct.findByPk.mockResolvedValue(mockProductData);

            await getProductById(req, res);

            expect(mockProduct.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
            expect(res.json).toHaveBeenCalledWith(mockProductData);
        });

        it('should return 404 if product not found', async () => {
            req.params.id = 999;
            mockProduct.findByPk.mockResolvedValue(null);

            await getProductById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
        });
    });

    describe('createProduct', () => {
        it('should create a product successfully', async () => {
            const productData = { name: 'New Product', price: 100 };
            const createdProduct = { id: 1, ...productData };
            req.body = productData;

            mockProduct.create.mockResolvedValue(createdProduct);

            await createProduct(req, res);

            expect(mockProduct.create).toHaveBeenCalled();
            // Also check for image creation if needed, but basic test first
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdProduct);
        });
    });

    describe('updateProduct', () => {
        it('should update a product successfully', async () => {
            req.params.id = 1;
            const updateData = { name: 'Updated Product' };
            req.body = updateData;

            const existingProduct = {
                id: 1,
                name: 'Old Product',
                update: jest.fn().mockResolvedValue(true),
                slug: 'old-product',
                featured_image: 'img.jpg'
            };

            mockProduct.findByPk.mockResolvedValue(existingProduct);

            await updateProduct(req, res);

            expect(mockProduct.findByPk).toHaveBeenCalledWith(1);
            expect(existingProduct.update).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled(); // It fetches again, check if that works
        });

        it('should return 404 if product to update not found', async () => {
            req.params.id = 999;
            mockProduct.findByPk.mockResolvedValue(null);

            await updateProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteProduct', () => {
        it('should delete a product', async () => {
            req.params.id = 1;
            const existingProduct = {
                id: 1,
                destroy: jest.fn().mockResolvedValue(true)
            };
            mockProduct.findByPk.mockResolvedValue(existingProduct);

            await deleteProduct(req, res);

            expect(mockProductImage.destroy).toHaveBeenCalledWith({ where: { product_id: 1 } });
            expect(existingProduct.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Product deleted successfully' });
        });
    });

    describe('getCategories', () => {
        it('should return all active categories', async () => {
            const mockCategories = [{ id: 1, name: 'Electronics' }];
            mockCategory.findAll.mockResolvedValue(mockCategories);

            await getCategories(req, res);

            expect(mockCategory.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockCategories);
        });
    });

    describe('createCategory', () => {
        it('should create a category', async () => {
            const categoryData = { name: 'New Category', status: 'Active' };
            const createdCategory = { id: 1, ...categoryData };
            req.body = categoryData;
            mockCategory.create.mockResolvedValue(createdCategory);

            await createCategory(req, res);

            expect(mockCategory.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdCategory);
        });
    });

    describe('updateCategory', () => {
        it('should update a category', async () => {
            req.params.id = 1;
            const updateData = { name: 'Updated Category' };
            req.body = updateData;

            const existingCategory = {
                id: 1,
                update: jest.fn().mockResolvedValue(true)
            };
            mockCategory.findByPk.mockResolvedValue(existingCategory);

            await updateCategory(req, res);

            expect(existingCategory.update).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(existingCategory);
        });
    });

    describe('deleteCategory', () => {
        it('should delete a category if no dependencies', async () => {
            req.params.id = 1;
            const existingCategory = {
                id: 1,
                destroy: jest.fn().mockResolvedValue(true)
            };
            mockCategory.findByPk.mockResolvedValue(existingCategory);
            mockProduct.count.mockResolvedValue(0); // No products
            mockCategory.count.mockResolvedValue(0); // No children

            await deleteCategory(req, res);

            expect(existingCategory.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Category deleted successfully' });
        });

        it('should prevent delete if products exist', async () => {
            req.params.id = 1;
            mockCategory.findByPk.mockResolvedValue({ id: 1 });
            mockProduct.count.mockResolvedValue(5); // 5 products

            await deleteCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('associated products') }));
        });
    });

    describe('Product Reviews', () => {
        it('should get product reviews', async () => {
            req.params.productId = 1;
            mockReview.findAll.mockResolvedValue([]);

            await getProductReviews(req, res);

            expect(mockReview.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ product_id: 1 })
            }));
            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('should create a review', async () => {
            req.params.productId = 1;
            req.user = { id: 101 };
            req.body = { rating: 5, comment: 'Good' };

            const createdReview = { id: 1, ...req.body };
            mockReview.create.mockResolvedValue(createdReview);

            await createProductReview(req, res);

            expect(mockReview.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdReview);
        });
    });

    describe('Product Variants', () => {
        describe('addProductVariant', () => {
            it('should add a variant and initialize inventory', async () => {
                req.params.id = 1;
                req.body = { sku: 'SKU123', variant_price: 100 };

                mockProductVariant.findOne.mockResolvedValue(null); // SKU unique
                mockProductVariant.create.mockResolvedValue({ id: 10, ...req.body });
                mockInventory.create.mockResolvedValue({});

                await addProductVariant(req, res);

                expect(mockProductVariant.create).toHaveBeenCalled();
                expect(mockInventory.create).toHaveBeenCalledWith(expect.objectContaining({ variant_id: 10 }));
                expect(res.status).toHaveBeenCalledWith(201);
            });

            it('should error if SKU exists', async () => {
                req.body = { sku: 'EXISTING' };
                mockProductVariant.findOne.mockResolvedValue({ id: 9 });

                await addProductVariant(req, res);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'SKU already exists' }));
            });
        });

        describe('deleteProductVariant', () => {
            it('should delete variant and inventory', async () => {
                req.params = { id: 1, variantId: 10 };
                const variant = { id: 10, destroy: jest.fn().mockResolvedValue(true) };

                mockProductVariant.findOne.mockResolvedValue(variant);

                await deleteProductVariant(req, res);

                expect(mockInventory.destroy).toHaveBeenCalledWith({ where: { variant_id: 10 } });
                expect(variant.destroy).toHaveBeenCalled();
                expect(res.json).toHaveBeenCalled();
            });

            it('should return 404 if variant not found', async () => {
                req.params = { id: 1, variantId: 99 };
                mockProductVariant.findOne.mockResolvedValue(null);

                await deleteProductVariant(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
            });
        });
    });
});
