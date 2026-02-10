import Review from '../models/review.model.js';
import Customer from '../../identity/models/customer.model.js';

/**
 * Review Service
 * Handles all product review-related business logic
 */
class ReviewService {
    /**
     * Get reviews for a product
     * @param {string} productId - Product UUID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Reviews
     */
    async getProductReviews(productId, options = {}) {
        const where = { product_id: productId };

        // Filter by status (default: approved only)
        if (options.status !== 'all') {
            where.status = options.status || 'approved';
        }

        const queryOptions = {
            where,
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['first_name', 'last_name']
                }
            ],
            order: [['created_at', 'DESC']]
        };

        // Add pagination if specified
        if (options.limit) {
            queryOptions.limit = parseInt(options.limit);
        }

        if (options.offset) {
            queryOptions.offset = parseInt(options.offset);
        }

        return await Review.findAll(queryOptions);
    }

    /**
     * Get review statistics for a product
     * @param {string} productId - Product UUID
     * @returns {Promise<Object>} Review statistics
     */
    async getReviewStats(productId) {
        const reviews = await Review.findAll({
            where: { product_id: productId, status: 'approved' },
            attributes: ['rating']
        });

        if (reviews.length === 0) {
            return {
                totalReviews: 0,
                averageRating: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
        }

        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = (totalRating / totalReviews).toFixed(2);

        // Calculate rating distribution
        const ratingDistribution = reviews.reduce((dist, r) => {
            dist[r.rating] = (dist[r.rating] || 0) + 1;
            return dist;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

        return {
            totalReviews,
            averageRating: parseFloat(averageRating),
            ratingDistribution
        };
    }

    /**
     * Create a new review
     * @param {string} productId - Product UUID
     * @param {string} customerId - Customer UUID
     * @param {Object} reviewData - Review data
     * @returns {Promise<Object>} Created review
     */
    async createReview(productId, customerId, reviewData) {
        const { rating, title, comment } = reviewData;

        // Check if customer already reviewed this product
        const existingReview = await Review.findOne({
            where: { product_id: productId, customer_id: customerId }
        });

        if (existingReview) {
            throw new Error('You have already reviewed this product');
        }

        return await Review.create({
            product_id: productId,
            customer_id: customerId,
            rating,
            title: title || null,
            comment,
            status: 'approved' // Auto-approve for now
        });
    }

    /**
     * Update review status (approve/reject/pending)
     * @param {string} reviewId - Review UUID
     * @param {string} status - New status
     * @returns {Promise<Object>} Updated review
     */
    async updateReviewStatus(reviewId, status) {
        const review = await Review.findByPk(reviewId);
        if (!review) {
            throw new Error('Review not found');
        }

        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        await review.update({ status });
        return review;
    }

    /**
     * Delete a review
     * @param {string} reviewId - Review UUID
     * @param {string} customerId - Customer UUID (for authorization)
     * @returns {Promise<boolean>} Success status
     */
    async deleteReview(reviewId, customerId) {
        const review = await Review.findByPk(reviewId);
        if (!review) {
            throw new Error('Review not found');
        }

        // Check if customer owns this review
        if (review.customer_id !== customerId) {
            throw new Error('Unauthorized to delete this review');
        }

        await review.destroy();
        return true;
    }

    /**
     * Get all reviews by a customer
     * @param {string} customerId - Customer UUID
     * @returns {Promise<Array>} Reviews
     */
    async getCustomerReviews(customerId) {
        return await Review.findAll({
            where: { customer_id: customerId },
            order: [['created_at', 'DESC']]
        });
    }
}

export default new ReviewService();
