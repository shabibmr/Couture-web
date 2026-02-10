import { Op } from 'sequelize';
import ProductImage from '../models/product_image.model.js';
import ProductVariant from '../models/product_variant.model.js';
import Category from '../models/category.model.js';
import Brand from '../models/brand.model.js';
import Size from '../models/size.model.js';
import Color from '../models/color.model.js';
import Inventory from '../../inventory/models/inventory.model.js';
import Customer from '../../identity/models/customer.model.js';
import Review from '../models/review.model.js';

/**
 * Reusable query builder for product includes
 * Eliminates duplicate include definitions across the codebase
 */
export class ProductQueryBuilder {
    /**
     * Build product images include
     * @param {Object} options - Configuration options
     * @returns {Object} Sequelize include object
     */
    static buildImagesInclude(options = {}) {
        return {
            model: ProductImage,
            as: 'images',
            attributes: options.attributes || ['image_url', 'sort_order'],
            separate: true,
            order: [['sort_order', 'ASC']]
        };
    }

    /**
     * Build product variants include with inventory
     * @param {Object} options - Configuration options
     * @returns {Object} Sequelize include object
     */
    static buildVariantsInclude(options = {}) {
        const include = {
            model: ProductVariant,
            as: 'variants',
            required: false
        };

        // Add nested includes
        include.include = [
            { model: Size, attributes: ['name', 'code'] },
            { model: Color, attributes: ['name', 'hex_code'] },
            { model: Inventory, attributes: ['quantity', 'reserved_quantity'] }
        ];

        // Filter by active variants if specified
        if (options.activeOnly) {
            include.where = { is_active: true };
        }

        // Add variant attributes if specified
        if (options.attributes) {
            include.attributes = options.attributes;
        }

        return include;
    }

    /**
     * Build category include
     * @param {Object} options - Configuration options
     * @returns {Object} Sequelize include object
     */
    static buildCategoryInclude(options = {}) {
        const include = {
            model: Category,
            as: 'Category',
            attributes: options.attributes || ['name', 'slug']
        };

        // Add where clause if filtering by slug
        if (options.slug) {
            include.where = { slug: options.slug };
        }

        return include;
    }

    /**
     * Build brand include
     * @param {Object} options - Configuration options
     * @returns {Object} Sequelize include object
     */
    static buildBrandInclude(options = {}) {
        const include = {
            model: Brand,
            as: 'Brand',
            attributes: options.attributes || ['name', 'slug']
        };

        // Add where clause if filtering by slug
        if (options.slug) {
            include.where = { slug: options.slug };
        }

        return include;
    }

    /**
     * Build reviews include
     * @param {Object} options - Configuration options
     * @returns {Object} Sequelize include object
     */
    static buildReviewsInclude(options = {}) {
        const include = {
            model: Review,
            as: 'reviews',
            where: { status: 'approved' },
            required: false,
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['first_name', 'last_name']
                }
            ],
            order: [['created_at', 'DESC']]
        };

        if (options.limit) {
            include.limit = options.limit;
        }

        return include;
    }

    /**
     * Build complete product include for list views
     * @param {Object} options - Configuration options
     * @returns {Array} Array of Sequelize include objects
     */
    static buildProductListIncludes(options = {}) {
        const includes = [
            this.buildImagesInclude(),
            this.buildCategoryInclude(options.category ? { slug: options.category } : {}),
            this.buildVariantsInclude()
        ];

        // Add brand filter if specified
        if (options.brand) {
            includes.push(this.buildBrandInclude({ slug: options.brand }));
        }

        return includes;
    }

    /**
     * Build complete product include for detail views
     * @param {Object} options - Configuration options
     * @returns {Array} Array of Sequelize include objects
     */
    static buildProductDetailIncludes(options = {}) {
        return [
            this.buildImagesInclude(),
            this.buildVariantsInclude({ activeOnly: options.activeVariantsOnly ?? true }),
            this.buildCategoryInclude(),
            this.buildBrandInclude()
        ];
    }

    /**
     * Build where clause for product filters
     * @param {Object} filters - Filter parameters
     * @returns {Object} Sequelize where clause
     */
    static buildProductWhere(filters = {}) {
        const where = {};
        const { status, is_featured, is_new_arrival, search, q } = filters;

        // Status filter logic
        if (status === 'all') {
            // No filter on is_active
        } else if (status === 'inactive') {
            where.is_active = false;
        } else {
            // Default to active only
            where.is_active = true;
        }

        // Featured filter
        if (is_featured !== undefined) {
            where.is_featured = is_featured === 'true' || is_featured === true;
        }

        // New arrival filter
        if (is_new_arrival !== undefined) {
            where.is_new_arrival = is_new_arrival === 'true' || is_new_arrival === true;
        }

        // Search filter
        const searchQuery = search || q;
        if (searchQuery) {
            where[Op.or] = [
                { name: { [Op.like]: `%${searchQuery}%` } },
                { description: { [Op.like]: `%${searchQuery}%` } },
                { slug: { [Op.like]: `%${searchQuery}%` } }
            ];
        }

        return where;
    }

    /**
     * Build order clause for products
     * @param {Object} options - Sort options
     * @returns {Array} Sequelize order clause
     */
    static buildProductOrder(options = {}) {
        if (options.orderBy && options.orderDirection) {
            return [[options.orderBy, options.orderDirection]];
        }

        // Default ordering
        return [['sort_order', 'DESC'], ['created_at', 'DESC']];
    }
}

export default ProductQueryBuilder;
