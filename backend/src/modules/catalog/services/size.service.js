import Size from '../models/size.model.js';

/**
 * Size Service
 * Handles all size-related business logic with caching
 */
class SizeService {
    constructor() {
        this.cache = null;
        this.cacheTimestamp = null;
        this.CACHE_TTL = 3600000; // 1 hour in milliseconds
    }

    /**
     * Get all sizes (with caching)
     * @param {boolean} forceRefresh - Force cache refresh
     * @returns {Promise<Array>} Sizes
     */
    async getSizes(forceRefresh = false) {
        const now = Date.now();

        // Return cached data if valid
        if (
            !forceRefresh &&
            this.cache &&
            this.cacheTimestamp &&
            (now - this.cacheTimestamp) < this.CACHE_TTL
        ) {
            return this.cache;
        }

        // Fetch from database
        const sizes = await Size.findAll({
            order: [['sort_order', 'ASC'], ['name', 'ASC']]
        });

        // Update cache
        this.cache = sizes;
        this.cacheTimestamp = now;

        return sizes;
    }

    /**
     * Get size by ID
     * @param {string} id - Size UUID
     * @returns {Promise<Object|null>} Size or null
     */
    async getSizeById(id) {
        return await Size.findByPk(id);
    }

    /**
     * Get size by code
     * @param {string} code - Size code (e.g., 'S', 'M', 'L')
     * @returns {Promise<Object|null>} Size or null
     */
    async getSizeByCode(code) {
        return await Size.findOne({ where: { code } });
    }

    /**
     * Create a new size
     * @param {Object} sizeData - Size data
     * @returns {Promise<Object>} Created size
     */
    async createSize(sizeData) {
        const size = await Size.create(sizeData);

        // Invalidate cache
        this.clearCache();

        return size;
    }

    /**
     * Update an existing size
     * @param {string} id - Size UUID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated size
     */
    async updateSize(id, updateData) {
        const size = await Size.findByPk(id);
        if (!size) {
            throw new Error('Size not found');
        }

        await size.update(updateData);

        // Invalidate cache
        this.clearCache();

        return size;
    }

    /**
     * Delete a size
     * @param {string} id - Size UUID
     * @returns {Promise<boolean>} Success status
     */
    async deleteSize(id) {
        const size = await Size.findByPk(id);
        if (!size) {
            throw new Error('Size not found');
        }

        await size.destroy();

        // Invalidate cache
        this.clearCache();

        return true;
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache = null;
        this.cacheTimestamp = null;
    }
}

export default new SizeService();
