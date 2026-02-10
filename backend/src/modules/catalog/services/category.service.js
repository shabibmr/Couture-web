import Category from '../models/category.model.js';
import Product from '../models/product.model.js';
import { generateProductSlug } from '../utils/product-transformer.util.js';

/**
 * Category Service
 * Handles all category-related business logic
 */
class CategoryService {
    /**
     * Get all active categories
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Categories
     */
    async getCategories(options = {}) {
        const where = options.includeInactive ? {} : { is_active: true };
        const order = options.orderBy
            ? [[options.orderBy, options.orderDirection || 'ASC']]
            : [['name', 'ASC']];

        return await Category.findAll({ where, order });
    }

    /**
     * Get category by ID
     * @param {string} id - Category UUID
     * @returns {Promise<Object|null>} Category or null
     */
    async getCategoryById(id) {
        return await Category.findByPk(id);
    }

    /**
     * Get category by slug
     * @param {string} slug - Category slug
     * @returns {Promise<Object|null>} Category or null
     */
    async getCategoryBySlug(slug) {
        return await Category.findOne({ where: { slug } });
    }

    /**
     * Create a new category
     * @param {Object} categoryData - Category data
     * @returns {Promise<Object>} Created category
     */
    async createCategory(categoryData) {
        const { name, slug, description, status, parent_id, sort_order } = categoryData;

        // Generate slug if not provided
        const finalSlug = slug || generateProductSlug(name);

        return await Category.create({
            name,
            slug: finalSlug,
            description,
            parent_id: parent_id || null,
            is_active: status === 'Active',
            sort_order: sort_order || 0
        });
    }

    /**
     * Update an existing category
     * @param {string} id - Category UUID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated category
     */
    async updateCategory(id, updateData) {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new Error('Category not found');
        }

        const { name, slug, description, status, parent_id, sort_order } = updateData;

        // Generate slug if name changed but slug not provided
        const finalSlug = slug || (name ? generateProductSlug(name) : category.slug);

        await category.update({
            name: name || category.name,
            slug: finalSlug,
            description: description !== undefined ? description : category.description,
            parent_id: parent_id !== undefined ? parent_id : category.parent_id,
            is_active: status ? status === 'Active' : category.is_active,
            sort_order: sort_order !== undefined ? sort_order : category.sort_order
        });

        return category;
    }

    /**
     * Delete a category (with validation)
     * @param {string} id - Category UUID
     * @returns {Promise<boolean>} Success status
     */
    async deleteCategory(id) {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new Error('Category not found');
        }

        // Check if category has products
        const productsCount = await Product.count({ where: { category_id: id } });
        if (productsCount > 0) {
            throw new Error(`Cannot delete category. It has ${productsCount} associated products.`);
        }

        // Check if category has children
        const childrenCount = await Category.count({ where: { parent_id: id } });
        if (childrenCount > 0) {
            throw new Error(`Cannot delete category. It has ${childrenCount} sub-categories.`);
        }

        await category.destroy();
        return true;
    }

    /**
     * Get category hierarchy (parent-child relationships)
     * @returns {Promise<Array>} Categories with children
     */
    async getCategoryHierarchy() {
        const allCategories = await Category.findAll({
            where: { is_active: true },
            order: [['sort_order', 'ASC'], ['name', 'ASC']]
        });

        // Build hierarchy
        const categoryMap = new Map();
        const rootCategories = [];

        // First pass: create map
        allCategories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat.toJSON(), children: [] });
        });

        // Second pass: build hierarchy
        allCategories.forEach(cat => {
            const categoryNode = categoryMap.get(cat.id);
            if (cat.parent_id && categoryMap.has(cat.parent_id)) {
                categoryMap.get(cat.parent_id).children.push(categoryNode);
            } else {
                rootCategories.push(categoryNode);
            }
        });

        return rootCategories;
    }
}

export default new CategoryService();
