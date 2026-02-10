/**
 * Order Service
 * Main business logic for order management
 */

import { Op } from 'sequelize';
import sequelize from '../../../config/database.js';
import Order from '../models/order.model.js';
import OrderItem from '../models/order_item.model.js';
import Cart from '../models/cart.model.js';
import CartItem from '../models/cart_item.model.js';
import ProductVariant from '../../catalog/models/product_variant.model.js';
import Product from '../../catalog/models/product.model.js';
import Size from '../../catalog/models/size.model.js';
import PaymentTransaction from '../../payment/models/payment_transaction.model.js';
import CouponUsage from '../../marketing/models/coupon_usage.model.js';
import Shipment from '../models/shipment.model.js';
import Refund from '../../payment/models/refund.model.js';
import CouponService from '../../marketing/services/coupon.service.js';
import inventoryService from './inventory.service.js';
import orderCalculationService from './order-calculation.service.js';
import OrderQueryBuilder from '../utils/order-query.builder.js';
import {
    generateOrderNumber,
    formatAddressForStorage,
    parseCouponCodes
} from '../utils/order-transformer.util.js';
import { validateStatusTransition, getInventoryOperation } from '../utils/order-status.validator.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ORDER_STATUS, PAGINATION } from '../constants/order.constants.js';

class OrderService {
    /**
     * Resolve order items from payload or cart
     * @param {Array} items - Items from request payload
     * @param {string} customerId - Customer ID
     * @param {Object} transaction - Sequelize transaction
     * @returns {Promise<Array>} Resolved order items data
     */
    async _resolveOrderItems(items, customerId, transaction) {
        if (items && Array.isArray(items) && items.length > 0) {
            // Use provided items from payload
            return await this._resolveItemsFromPayload(items, transaction);
        } else {
            // Fallback to cart
            return await this._resolveItemsFromCart(customerId, transaction);
        }
    }

    /**
     * Resolve items from payload (optimize to avoid N+1 queries)
     * @param {Array} items - Items array
     * @param {Object} transaction - Sequelize transaction
     * @returns {Promise<Array>} Order items data
     */
    async _resolveItemsFromPayload(items, transaction) {
        // Collect all unique size names and variant IDs
        const sizeNames = [...new Set(items.filter(item => item.size).map(item => item.size))];
        const directVariantIds = items.filter(item => item.variant_id).map(item => item.variant_id);

        // Bulk fetch all sizes
        const sizes = await Size.findAll({
            where: { name: { [Op.in]: sizeNames } },
            transaction
        });
        const sizeMap = new Map(sizes.map(s => [s.name, s]));

        // Build variant lookup conditions
        const variantLookups = items
            .filter(item => !item.variant_id && item.product_id && item.size)
            .map(item => {
                const size = sizeMap.get(item.size);
                return size ? { product_id: item.product_id, size_id: size.id } : null;
            })
            .filter(Boolean);

        // Bulk fetch all variants
        const allVariantIds = [...directVariantIds];

        if (variantLookups.length > 0) {
            const resolvedVariants = await ProductVariant.findAll({
                where: { [Op.or]: variantLookups },
                transaction
            });
            allVariantIds.push(...resolvedVariants.map(v => v.id));

            var resolvedVariantMap = new Map(
                resolvedVariants.map(v => [`${v.product_id}_${v.size_id}`, v.id])
            );
        }

        // Bulk fetch all variant details with products
        const variants = await ProductVariant.findAll({
            where: { id: { [Op.in]: allVariantIds } },
            include: [Product],
            transaction
        });
        const variantMap = new Map(variants.map(v => [v.id, v]));

        // Process items and build orderItemsData
        const orderItemsData = [];
        for (const item of items) {
            let variantId = item.variant_id;

            // Resolve variant ID if not provided
            if (!variantId && item.product_id && item.size) {
                const size = sizeMap.get(item.size);
                if (size) {
                    const lookupKey = `${item.product_id}_${size.id}`;
                    variantId = resolvedVariantMap?.get(lookupKey);
                }
            }

            if (!variantId) {
                throw new Error(`Could not identify product variant for item: ${item.product_id} / ${item.size}`);
            }

            const variantData = variantMap.get(variantId);
            if (!variantData) {
                throw new Error(`${ERROR_MESSAGES.VARIANT_NOT_FOUND}: ${variantId}`);
            }

            const price = parseFloat(variantData.variant_price) ||
                         parseFloat(variantData.Product.sale_price) ||
                         parseFloat(variantData.Product.base_price);

            orderItemsData.push({
                variant_id: variantId,
                product_id: variantData.product_id,
                product_name: variantData.Product.name,
                variant_sku: variantData.sku,
                quantity: item.quantity,
                unit_price: price,
                total_price: price * item.quantity,
                size: item.size,
                category_id: variantData.Product.category_id
            });
        }

        return orderItemsData;
    }

    /**
     * Resolve items from cart
     * @param {string} customerId - Customer ID
     * @param {Object} transaction - Sequelize transaction
     * @returns {Promise<Array>} Order items data
     */
    async _resolveItemsFromCart(customerId, transaction) {
        const cart = await Cart.findOne({
            where: { customer_id: customerId },
            include: [{
                model: CartItem,
                as: 'items',
                include: [{
                    model: ProductVariant,
                    include: [Product, Size]
                }]
            }],
            transaction
        });

        if (!cart || !cart.items || cart.items.length === 0) {
            throw new Error(ERROR_MESSAGES.NO_ITEMS);
        }

        const orderItemsData = [];
        for (const item of cart.items) {
            const price = parseFloat(item.ProductVariant.variant_price) ||
                         parseFloat(item.ProductVariant.Product.sale_price) ||
                         parseFloat(item.ProductVariant.Product.base_price);

            orderItemsData.push({
                variant_id: item.variant_id,
                product_id: item.ProductVariant.product_id,
                product_name: item.ProductVariant.Product.name,
                variant_sku: item.ProductVariant.sku,
                quantity: item.quantity,
                unit_price: price,
                total_price: price * item.quantity,
                size: item.ProductVariant.Size?.name,
                category_id: item.ProductVariant.Product.category_id
            });
        }

        return orderItemsData;
    }

    /**
     * Create a new order
     * @param {Object} orderData - Order creation data
     * @param {string} customerId - Customer ID
     * @returns {Promise<Object>} Created order
     */
    async createOrder(orderData, customerId) {
        const t = await sequelize.transaction();

        try {
            console.log("[OrderService] Creating order for customer:", customerId);

            // 1. Resolve items (from payload or cart)
            const orderItemsData = await this._resolveOrderItems(
                orderData.items,
                customerId,
                t
            );

            // 2. Reserve inventory
            await inventoryService.reserveStock(orderItemsData, t);

            // 3. Calculate totals with coupons
            const couponCodes = parseCouponCodes(orderData.coupon_codes || orderData.coupon_code);
            const totals = await orderCalculationService.calculateOrderTotals(
                orderItemsData,
                couponCodes,
                customerId
            );

            // 4. Create order
            const order = await Order.create({
                order_number: generateOrderNumber(),
                customer_id: customerId,
                subtotal: totals.subtotal,
                shipping_amount: totals.shippingAmount,
                tax_amount: totals.taxAmount,
                discount_amount: totals.discountAmount,
                total_amount: totals.totalAmount,
                shipping_address: formatAddressForStorage(orderData.shipping_address),
                billing_address: formatAddressForStorage(orderData.billing_address),
                shipping_method_id: orderData.shipping_method_id,
                coupon_code: couponCodes.length > 0 ? JSON.stringify(couponCodes) : null,
                status: ORDER_STATUS.PENDING
            }, { transaction: t });

            // 5. Create order items
            await OrderItem.bulkCreate(
                orderItemsData.map(item => ({
                    order_id: order.id,
                    variant_id: item.variant_id,
                    product_name: item.product_name,
                    variant_sku: item.variant_sku,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total_price: item.total_price
                })),
                { transaction: t }
            );

            // 6. Record coupon usage
            if (totals.appliedCouponIds.length > 0) {
                await CouponService.recordMultipleUsage(totals.appliedCouponIds, customerId, order.id, t);
                console.log(`[OrderService] Recorded usage for ${totals.appliedCouponIds.length} coupon(s)`);
            }

            // 7. Clear cart
            const customerCart = await Cart.findOne({ where: { customer_id: customerId }, transaction: t });
            if (customerCart) {
                await CartItem.destroy({ where: { cart_id: customerCart.id }, transaction: t });
            }

            await t.commit();
            console.log("[OrderService] Order created successfully:", order.order_number);

            // Return full order with items
            return await this.getOrderById(order.id);
        } catch (error) {
            await t.rollback();
            console.error('[OrderService] Error creating order:', error);
            throw error;
        }
    }

    /**
     * Get orders with filters and pagination
     * @param {Object} filters - Filter parameters
     * @param {boolean} isAdmin - Whether requester is admin
     * @returns {Promise<Object>} Orders with pagination
     */
    async getOrders(filters = {}, isAdmin = false) {
        const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = filters;

        // Build where clause
        const where = OrderQueryBuilder.buildOrderWhere(filters);

        // Get pagination
        const pagination = OrderQueryBuilder.buildPagination(page, limit);

        // Build includes
        const include = OrderQueryBuilder.buildOrderDetailsIncludes();

        // Fetch orders
        const result = await Order.findAndCountAll({
            where,
            ...pagination,
            order: OrderQueryBuilder.buildOrderClause(),
            include,
            distinct: true
        });

        return {
            total: result.count,
            pages: Math.ceil(result.count / parseInt(limit)),
            currentPage: parseInt(page),
            data: result.rows
        };
    }

    /**
     * Get order by ID
     * @param {string} orderId - Order ID
     * @param {string} customerId - Customer ID (optional, for access control)
     * @returns {Promise<Object>} Order details
     */
    async getOrderById(orderId, customerId = null) {
        const where = { id: orderId };
        if (customerId) {
            where.customer_id = customerId;
        }

        const order = await Order.findOne({
            where,
            include: OrderQueryBuilder.buildOrderDetailsIncludes()
        });

        if (!order) {
            throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
        }

        return order;
    }

    /**
     * Update order status
     * @param {string} orderId - Order ID
     * @param {string} newStatus - New status
     * @returns {Promise<Object>} Updated order
     */
    async updateOrderStatus(orderId, newStatus) {
        const t = await sequelize.transaction();

        try {
            const order = await Order.findByPk(orderId, {
                include: [{ model: OrderItem, as: 'items' }],
                transaction: t
            });

            if (!order) {
                throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
            }

            const oldStatus = order.status;

            // Validate status transition
            validateStatusTransition(oldStatus, newStatus);

            // Handle inventory operations based on status change
            const inventoryOp = getInventoryOperation(oldStatus, newStatus);

            if (inventoryOp === 'release') {
                await inventoryService.releaseStock(order.items, t);
            } else if (inventoryOp === 'finalize') {
                await inventoryService.finalizeStock(order.items, t);
            }

            // Update status
            order.status = newStatus;
            await order.save({ transaction: t });

            await t.commit();

            return await this.getOrderById(orderId);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * Delete order (admin only)
     * @param {string} orderId - Order ID
     */
    async deleteOrder(orderId) {
        const t = await sequelize.transaction();

        try {
            const order = await Order.findByPk(orderId, {
                include: [{ model: OrderItem, as: 'items' }],
                transaction: t
            });

            if (!order) {
                throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
            }

            console.log(`[OrderService] Deleting order ${order.order_number || orderId}`);

            // 1. Restore inventory if pending
            if (order.status === ORDER_STATUS.PENDING && order.items?.length > 0) {
                await inventoryService.releaseStock(order.items, t);
            }

            // 2. Delete related records (cascade)
            await Promise.all([
                PaymentTransaction.destroy({ where: { order_id: orderId }, transaction: t }),
                CouponUsage.destroy({ where: { order_id: orderId }, transaction: t }),
                Shipment.destroy({ where: { order_id: orderId }, transaction: t }),
                Refund.destroy({ where: { order_id: orderId }, transaction: t }),
                OrderItem.destroy({ where: { order_id: orderId }, transaction: t })
            ]);

            // 3. Delete order
            await order.destroy({ transaction: t });

            await t.commit();
            console.log(`[OrderService] Order ${order.order_number || orderId} deleted successfully`);
        } catch (error) {
            await t.rollback();
            console.error('[OrderService] Error deleting order:', error);
            throw error;
        }
    }
}

export default new OrderService();
