/**
 * Order Query Builder
 * Reusable Sequelize query builders to eliminate code duplication
 */

import { Op } from 'sequelize';
import OrderItem from '../models/order_item.model.js';
import ProductVariant from '../../catalog/models/product_variant.model.js';
import Product from '../../catalog/models/product.model.js';
import Customer from '../../identity/models/customer.model.js';
import PaymentTransaction from '../../payment/models/payment_transaction.model.js';
import PaymentGateway from '../../payment/models/payment_gateway.model.js';

/**
 * Query builder for order-related queries
 */
export class OrderQueryBuilder {
    /**
     * Build include for order items with product details
     * @returns {Object} Sequelize include object
     */
    static buildOrderItemsInclude() {
        return {
            model: OrderItem,
            as: 'items',
            include: [{
                model: ProductVariant,
                include: [Product]
            }]
        };
    }

    /**
     * Build include for customer details
     * @param {Object} options - Optional configuration
     * @returns {Object} Sequelize include object
     */
    static buildCustomerInclude(options = {}) {
        return {
            model: Customer,
            attributes: options.attributes || ['id', 'first_name', 'last_name', 'email', 'phone']
        };
    }

    /**
     * Build include for payment transactions
     * @returns {Object} Sequelize include object
     */
    static buildPaymentInclude() {
        return {
            model: PaymentTransaction,
            include: [{
                model: PaymentGateway,
                attributes: ['name', 'code']
            }]
        };
    }

    /**
     * Build complete order details includes
     * Used for fetching full order information
     * @returns {Array} Array of include objects
     */
    static buildOrderDetailsIncludes() {
        return [
            this.buildOrderItemsInclude(),
            this.buildCustomerInclude(),
            this.buildPaymentInclude()
        ];
    }

    /**
     * Build where clause for order filtering
     * @param {Object} filters - Filter parameters
     * @param {string} filters.customerId - Filter by customer
     * @param {string} filters.status - Filter by status
     * @param {Date} filters.dateFrom - Filter orders from date
     * @param {Date} filters.dateTo - Filter orders to date
     * @param {string} filters.orderNumber - Filter by order number
     * @returns {Object} Sequelize where clause
     */
    static buildOrderWhere(filters = {}) {
        const where = {};

        if (filters.customerId) {
            where.customer_id = filters.customerId;
        }

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.orderNumber) {
            where.order_number = {
                [Op.like]: `%${filters.orderNumber}%`
            };
        }

        if (filters.dateFrom || filters.dateTo) {
            where.order_date = {};
            if (filters.dateFrom) {
                where.order_date[Op.gte] = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.order_date[Op.lte] = filters.dateTo;
            }
        }

        return where;
    }

    /**
     * Build pagination options
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Object} Pagination options with limit and offset
     */
    static buildPagination(page = 1, limit = 10) {
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        return {
            limit: parsedLimit,
            offset: (parsedPage - 1) * parsedLimit
        };
    }

    /**
     * Build order clause for sorting
     * @param {string} sortBy - Field to sort by (default: order_date)
     * @param {string} sortOrder - Sort order (ASC or DESC)
     * @returns {Array} Sequelize order clause
     */
    static buildOrderClause(sortBy = 'order_date', sortOrder = 'DESC') {
        return [[sortBy, sortOrder.toUpperCase()]];
    }
}

export default OrderQueryBuilder;
