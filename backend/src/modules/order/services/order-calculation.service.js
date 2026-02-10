/**
 * Order Calculation Service
 * Handles order pricing, shipping, discounts, and totals
 */

import CouponService from '../../marketing/services/coupon.service.js';
import settingsService from './settings.service.js';
import { ERROR_MESSAGES } from '../constants/order.constants.js';

class OrderCalculationService {
    /**
     * Calculate subtotal from order items
     * @param {Array} orderItems - Array of order items
     * @returns {number} Subtotal amount
     */
    calculateSubtotal(orderItems) {
        return orderItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    }

    /**
     * Calculate shipping amount based on subtotal
     * @param {number} subtotal - Order subtotal
     * @returns {Promise<number>} Shipping amount
     */
    async calculateShipping(subtotal) {
        return await settingsService.calculateShipping(subtotal);
    }

    /**
     * Apply coupons and calculate discount
     * @param {Array} couponCodes - Array of coupon codes
     * @param {string} customerId - Customer ID
     * @param {number} subtotal - Order subtotal
     * @param {Array} orderItems - Order items for targeting logic
     * @returns {Promise<Object>} { discountAmount, freeShipping, appliedCouponIds }
     */
    async applyCoupons(couponCodes, customerId, subtotal, orderItems) {
        if (!couponCodes || couponCodes.length === 0) {
            return {
                discountAmount: 0,
                freeShipping: false,
                appliedCouponIds: []
            };
        }

        console.log(`[OrderCalculation] Validating ${couponCodes.length} coupon(s): ${couponCodes.join(', ')}`);

        // Validate coupons (single or multiple)
        const validationResult = couponCodes.length === 1
            ? await CouponService.validateCoupon(couponCodes[0], {
                customerId,
                cartTotal: subtotal,
                items: orderItems
            })
            : await CouponService.validateMultipleCoupons(couponCodes, {
                customerId,
                cartTotal: subtotal,
                items: orderItems
            });

        if (!validationResult.isValid) {
            throw new Error(`${ERROR_MESSAGES.INVALID_COUPON}: ${validationResult.message}`);
        }

        // Extract coupon IDs
        let appliedCouponIds = [];
        if (couponCodes.length === 1 && validationResult.coupon) {
            appliedCouponIds = [validationResult.coupon.id];
        } else if (validationResult.coupons) {
            appliedCouponIds = validationResult.coupons.map(c => c.id);
        }

        return {
            discountAmount: validationResult.discountAmount || 0,
            freeShipping: validationResult.freeShipping || false,
            appliedCouponIds
        };
    }

    /**
     * Calculate complete order totals
     * @param {Array} orderItems - Order items with prices
     * @param {Array} couponCodes - Coupon codes to apply
     * @param {string} customerId - Customer ID
     * @returns {Promise<Object>} Complete order totals
     */
    async calculateOrderTotals(orderItems, couponCodes, customerId) {
        // 1. Calculate subtotal
        const subtotal = this.calculateSubtotal(orderItems);

        // 2. Calculate base shipping
        let shippingAmount = await this.calculateShipping(subtotal);

        // 3. Apply coupons
        const couponResult = await this.applyCoupons(
            couponCodes,
            customerId,
            subtotal,
            orderItems
        );

        // 4. Override shipping if coupon provides free shipping
        if (couponResult.freeShipping) {
            shippingAmount = 0;
        }

        // 5. Calculate tax (currently 0 as per requirement)
        const taxAmount = 0;

        // 6. Calculate total
        const totalAmount = Math.max(0, subtotal + shippingAmount + taxAmount - couponResult.discountAmount);

        return {
            subtotal,
            shippingAmount,
            taxAmount,
            discountAmount: couponResult.discountAmount,
            totalAmount,
            appliedCouponIds: couponResult.appliedCouponIds,
            freeShipping: couponResult.freeShipping
        };
    }

    /**
     * Recalculate order totals (useful for order updates)
     * @param {Object} order - Existing order with items
     * @param {Array} newCouponCodes - New coupon codes (optional)
     * @returns {Promise<Object>} Updated totals
     */
    async recalculateOrderTotals(order, newCouponCodes = null) {
        const orderItems = order.items || [];
        const couponCodes = newCouponCodes || order.coupon_codes || [];
        const customerId = order.customer_id;

        return await this.calculateOrderTotals(orderItems, couponCodes, customerId);
    }

    /**
     * Get shipping preview for cart
     * @param {number} subtotal - Cart subtotal
     * @returns {Promise<Object>} Shipping preview
     */
    async getShippingPreview(subtotal) {
        const { baseFee, freeThreshold } = await settingsService.getShippingConfig();
        const shippingAmount = subtotal >= freeThreshold && freeThreshold > 0 ? 0 : baseFee;

        return {
            shippingAmount,
            isFree: shippingAmount === 0,
            freeShippingThreshold: freeThreshold,
            amountToFreeShipping: shippingAmount > 0 && freeThreshold > 0
                ? Math.max(0, freeThreshold - subtotal)
                : 0
        };
    }
}

export default new OrderCalculationService();
