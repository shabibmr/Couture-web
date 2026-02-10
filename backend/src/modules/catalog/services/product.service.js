import { Op } from 'sequelize';
import sequelize from '../../../config/database.js';
import Product from '../models/product.model.js';
import ProductImage from '../models/product_image.model.js';
import ProductVariant from '../models/product_variant.model.js';
import Size from '../models/size.model.js';
import Inventory from '../../inventory/models/inventory.model.js';
import ProductQueryBuilder from '../utils/product-query.builder.js';
import { generateProductSlug } from '../utils/product-transformer.util.js';
import { DEFAULT_INVENTORY, PAGINATION } from '../constants/product.constants.js';

/**
 * Product Service
 * Handles all product-related business logic with optimized queries and transactions
 */
class ProductService {
    /**
     * Get paginated products with filters
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} { rows, count, pages, currentPage }
     */
    async getProducts(filters = {}) {
        const {
            page = PAGINATION.DEFAULT_PAGE,
            limit = PAGINATION.DEFAULT_LIMIT,
            category_slug,
            brand_slug,
            ...otherFilters
        } = filters;

        const offset = (page - 1) * limit;

        // Build where clause
        const where = ProductQueryBuilder.buildProductWhere(otherFilters);

        // Build includes
        const include = ProductQueryBuilder.buildProductListIncludes({
            category: category_slug,
            brand: brand_slug
        });

        // Build order
        const order = ProductQueryBuilder.buildProductOrder(filters);

        const products = await Product.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include,
            order,
            distinct: true
        });

        return {
            rows: products.rows,
            count: products.count,
            pages: Math.ceil(products.count / limit),
            currentPage: parseInt(page)
        };
    }

    /**
     * Get product by ID
     * @param {string} id - Product UUID
     * @param {Object} options - Query options
     * @returns {Promise<Object|null>} Product or null
     */
    async getProductById(id, options = {}) {
        const include = ProductQueryBuilder.buildProductDetailIncludes({
            activeVariantsOnly: options.activeVariantsOnly ?? true
        });

        return await Product.findByPk(id, { include });
    }

    /**
     * Get product by slug
     * @param {string} slug - Product slug
     * @param {Object} options - Query options
     * @returns {Promise<Object|null>} Product or null
     */
    async getProductBySlug(slug, options = {}) {
        const include = ProductQueryBuilder.buildProductDetailIncludes({
            activeVariantsOnly: options.activeVariantsOnly ?? true
        });

        const where = options.activeOnly
            ? { slug, is_active: true }
            : { slug };

        return await Product.findOne({ where, include });
    }

    /**
     * Create a new product with images and variants
     * Uses transaction to ensure data consistency
     * @param {Object} productData - Product data
     * @returns {Promise<Object>} Created product
     */
    async createProduct(productData) {
        const { mainImage, additionalImages, sizes, ...baseProductData } = productData;

        const transaction = await sequelize.transaction();

        try {
            // Generate slug if not provided
            const slug = baseProductData.slug || generateProductSlug(baseProductData.name);

            // Create the product
            const product = await Product.create(
                {
                    ...baseProductData,
                    slug,
                    featured_image: mainImage || null
                },
                { transaction }
            );

            // Parallel operations for images and variants
            const operations = [];

            // Create additional images if provided
            if (additionalImages && Array.isArray(additionalImages)) {
                const imageRecords = additionalImages
                    .filter(img => img && img.trim() !== '')
                    .map((imageUrl, index) => ({
                        product_id: product.id,
                        image_url: imageUrl,
                        sort_order: index + 1
                    }));

                if (imageRecords.length > 0) {
                    operations.push(
                        ProductImage.bulkCreate(imageRecords, { transaction })
                    );
                }
            }

            // Create variants and inventory if sizes provided
            if (sizes && Array.isArray(sizes) && sizes.length > 0) {
                operations.push(
                    this._createVariantsWithInventory(
                        product.id,
                        sizes,
                        baseProductData.code || product.slug,
                        baseProductData.base_price || 0,
                        transaction
                    )
                );
            }

            // Execute all operations in parallel
            await Promise.all(operations);

            await transaction.commit();

            // Return product with all associations
            return await this.getProductById(product.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Update an existing product
     * Uses transaction to ensure data consistency
     * @param {string} id - Product UUID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated product
     */
    async updateProduct(id, updateData) {
        const { mainImage, additionalImages, sizes, ...baseUpdateData } = updateData;

        const transaction = await sequelize.transaction();

        try {
            // Find the product
            const product = await Product.findByPk(id, { transaction });
            if (!product) {
                throw new Error('Product not found');
            }

            // Update slug if name changed
            if (baseUpdateData.name && baseUpdateData.name !== product.name) {
                baseUpdateData.slug = generateProductSlug(baseUpdateData.name);
            }

            // Update product fields
            await product.update(
                {
                    ...baseUpdateData,
                    featured_image: mainImage !== undefined ? mainImage : product.featured_image
                },
                { transaction }
            );

            // Handle additional images update
            if (additionalImages !== undefined) {
                await this._updateProductImages(id, additionalImages, transaction);
            }

            // Handle sizes/variants update
            if (sizes !== undefined) {
                await this._updateProductVariants(
                    id,
                    sizes,
                    baseUpdateData.code || product.code || product.slug,
                    baseUpdateData.base_price || product.base_price,
                    transaction
                );
            }

            await transaction.commit();

            // Return updated product with all associations
            return await this.getProductById(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Delete a product and its associations
     * @param {string} id - Product UUID
     * @returns {Promise<boolean>} Success status
     */
    async deleteProduct(id) {
        const transaction = await sequelize.transaction();

        try {
            const product = await Product.findByPk(id, { transaction });
            if (!product) {
                throw new Error('Product not found');
            }

            // Delete associated images (cascade should handle this, but explicit is safer)
            await ProductImage.destroy({ where: { product_id: id }, transaction });

            // Delete the product
            await product.destroy({ transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Add a variant to an existing product
     * @param {string} productId - Product UUID
     * @param {Object} variantData - Variant data
     * @returns {Promise<Object>} Created variant
     */
    async addProductVariant(productId, variantData) {
        const transaction = await sequelize.transaction();

        try {
            // Check if SKU exists
            const existingVariant = await ProductVariant.findOne({
                where: { sku: variantData.sku }
            });

            if (existingVariant) {
                throw new Error('SKU already exists');
            }

            // Create variant
            const variant = await ProductVariant.create(
                {
                    product_id: productId,
                    ...variantData
                },
                { transaction }
            );

            // Create inventory record
            await Inventory.create(
                {
                    variant_id: variant.id,
                    quantity: DEFAULT_INVENTORY.QUANTITY,
                    reserved_quantity: DEFAULT_INVENTORY.RESERVED_QUANTITY,
                    low_stock_threshold: DEFAULT_INVENTORY.LOW_STOCK_THRESHOLD
                },
                { transaction }
            );

            await transaction.commit();
            return variant;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Delete a product variant
     * @param {string} productId - Product UUID
     * @param {string} variantId - Variant UUID
     * @returns {Promise<boolean>} Success status
     */
    async deleteProductVariant(productId, variantId) {
        const transaction = await sequelize.transaction();

        try {
            const variant = await ProductVariant.findOne({
                where: { id: variantId, product_id: productId },
                transaction
            });

            if (!variant) {
                throw new Error('Variant not found');
            }

            // Delete inventory first
            await Inventory.destroy({ where: { variant_id: variantId }, transaction });

            // Delete variant
            await variant.destroy({ transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();

            // Fallback: soft delete if foreign key constraints prevent deletion
            try {
                await ProductVariant.update(
                    { is_active: false },
                    { where: { id: variantId } }
                );
                return true;
            } catch (fallbackError) {
                throw error; // Throw original error
            }
        }
    }

    /**
     * PRIVATE: Create variants with inventory in bulk
     * @private
     */
    async _createVariantsWithInventory(productId, sizeNames, productCode, basePrice, transaction) {
        // Fetch size records in bulk
        const sizeRecords = await Size.findAll({
            where: { name: { [Op.in]: sizeNames } },
            transaction
        });

        if (sizeRecords.length === 0) {
            return;
        }

        // Prepare variant records
        const variantRecords = sizeRecords.map(size => ({
            product_id: productId,
            sku: `${productCode}-${size.code || size.name}`,
            size_id: size.id,
            color_id: null,
            variant_price: basePrice,
            variant_image: null
        }));

        // Bulk create variants
        const variants = await ProductVariant.bulkCreate(variantRecords, {
            transaction,
            returning: true
        });

        // Prepare inventory records
        const inventoryRecords = variants.map(variant => ({
            variant_id: variant.id,
            quantity: DEFAULT_INVENTORY.QUANTITY,
            reserved_quantity: DEFAULT_INVENTORY.RESERVED_QUANTITY,
            low_stock_threshold: DEFAULT_INVENTORY.LOW_STOCK_THRESHOLD
        }));

        // Bulk create inventory
        await Inventory.bulkCreate(inventoryRecords, { transaction });
    }

    /**
     * PRIVATE: Update product images
     * @private
     */
    async _updateProductImages(productId, additionalImages, transaction) {
        // Delete existing images
        await ProductImage.destroy({ where: { product_id: productId }, transaction });

        // Create new images
        if (Array.isArray(additionalImages)) {
            const imageRecords = additionalImages
                .filter(img => img && img.trim() !== '')
                .map((imageUrl, index) => ({
                    product_id: productId,
                    image_url: imageUrl,
                    sort_order: index + 1
                }));

            if (imageRecords.length > 0) {
                await ProductImage.bulkCreate(imageRecords, { transaction });
            }
        }
    }

    /**
     * PRIVATE: Update product variants based on sizes
     * @private
     */
    async _updateProductVariants(productId, sizeNames, productCode, basePrice, transaction) {
        // Get existing variants
        const existingVariants = await ProductVariant.findAll({
            where: { product_id: productId },
            include: [{ model: Size }],
            transaction
        });

        const existingSizeNames = existingVariants
            .map(v => v.Size?.name)
            .filter(Boolean);

        // Identify new sizes to add
        const newSizes = sizeNames.filter(name => !existingSizeNames.includes(name));

        // Identify variants to remove
        const variantsToRemove = existingVariants.filter(
            v => !sizeNames.includes(v.Size?.name)
        );

        // Remove old variants
        for (const variant of variantsToRemove) {
            try {
                await Inventory.destroy({ where: { variant_id: variant.id }, transaction });
                await variant.destroy({ transaction });
            } catch (error) {
                // Fallback to soft delete
                await variant.update({ is_active: false }, { transaction });
            }
        }

        // Add new variants
        if (newSizes.length > 0) {
            await this._createVariantsWithInventory(
                productId,
                newSizes,
                productCode,
                basePrice,
                transaction
            );
        }
    }

    /**
     * Get product by ID or slug for metadata
     * @param {string} idOrSlug - Product ID or slug
     * @returns {Promise<Object|null>} Product or null
     */
    async getProductForMetadata(idOrSlug) {
        const include = [ProductQueryBuilder.buildImagesInclude()];

        // Check if it's a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

        if (isUUID) {
            return await Product.findByPk(idOrSlug, { include });
        } else {
            return await Product.findOne({ where: { slug: idOrSlug }, include });
        }
    }
}

export default new ProductService();
