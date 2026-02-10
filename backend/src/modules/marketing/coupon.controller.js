import Coupon from './models/coupon.model.js';
import CouponUsage from './models/coupon_usage.model.js';
import Order from '../order/models/order.model.js';
import { Op } from 'sequelize';

export const getCoupons = async (req, res) => {
    try {
        const { active } = req.query;
        const whereClause = {};

        if (active === 'true') {
            whereClause.is_active = true;
            whereClause.valid_until = { [Op.gte]: new Date() };
        }

        const coupons = await Coupon.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']]
        });
        res.json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByPk(id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.json(coupon);
    } catch (error) {
        console.error('Error fetching coupon:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createCoupon = async (req, res) => {
    try {
        const couponData = req.body;

        // Basic validation
        const existingCode = await Coupon.findOne({ where: { code: couponData.code } });
        if (existingCode) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create(couponData);
        res.status(201).json(coupon);
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByPk(id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        await coupon.update(req.body);
        res.json(coupon);
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByPk(id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        await coupon.destroy();
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Validate coupon with comprehensive checks
 * Supports: single-use, per-customer limit, first-order, targeting, private coupons
 */
import CouponService from './services/coupon.service.js';

/**
 * Validate coupon with comprehensive checks
 * Uses CouponValidationService
 */
export const validateCoupon = async (req, res) => {
    try {
        const { code, cartTotal, cart_total, customerId, customer_id, cartItems, cart_items, items: bodyItems } = req.body;
        const total = parseFloat(cartTotal || cart_total || 0);
        const customerIdVal = customerId || customer_id;
        const items = cartItems || cart_items || bodyItems || [];

        // Use Service for Validation
        const result = await CouponService.validateCoupon(code, {
            customerId: customerIdVal,
            cartTotal: total,
            items
        });

        if (!result.isValid) {
            return res.status(result.status || 400).json({
                isValid: false,
                message: result.message
            });
        }

        // Calculate final discount using service helper
        const discountAmount = CouponService.calculateDiscountAmount(result.coupon, total, items);

        res.json({
            isValid: true,
            coupon: result.coupon,
            discountAmount,
            freeShipping: result.coupon.discount_type === 'free_shipping',
            isStackable: result.coupon.is_stackable,
            message: 'Coupon applied successfully'
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Validate multiple coupons for stacking
 * POST /api/coupons/validate-multiple
 */
export const validateMultipleCoupons = async (req, res) => {
    try {
        const { codes, cartTotal, cart_total, customerId, customer_id, cartItems, cart_items, items: bodyItems } = req.body;
        const total = parseFloat(cartTotal || cart_total || 0);
        const customerIdVal = customerId || customer_id;
        const items = cartItems || cart_items || bodyItems || [];

        if (!codes || !Array.isArray(codes) || codes.length === 0) {
            return res.status(400).json({
                isValid: false,
                message: 'No coupon codes provided'
            });
        }

        const result = await CouponService.validateMultipleCoupons(codes, {
            customerId: customerIdVal,
            cartTotal: total,
            items
        });

        if (!result.isValid) {
            return res.status(400).json({
                isValid: false,
                message: result.message,
                messages: result.messages || []
            });
        }

        res.json({
            isValid: true,
            coupons: result.coupons.map(c => ({
                id: c.id,
                code: c.code,
                discount_type: c.discount_type,
                discount_value: c.discount_value
            })),
            discountAmount: result.discountAmount,
            freeShipping: result.freeShipping,
            messages: result.messages || [],
            message: result.message
        });
    } catch (error) {
        console.error('Error validating multiple coupons:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Record coupon usage after order completion
 */
export const recordCouponUsage = async (couponId, customerId, orderId) => {
    try {
        // Create usage record
        await CouponUsage.create({
            coupon_id: couponId,
            customer_id: customerId,
            order_id: orderId
        });

        // Increment used_count on coupon
        await Coupon.increment('used_count', { where: { id: couponId } });

        return true;
    } catch (error) {
        console.error('Error recording coupon usage:', error);
        return false;
    }
};
