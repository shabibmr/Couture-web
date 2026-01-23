import Coupon from './models/coupon.model.js';
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

export const validateCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        const coupon = await Coupon.findOne({
            where: {
                code,
                is_active: true,
                valid_until: { [Op.gte]: new Date() },
                valid_from: { [Op.lte]: new Date() }
            }
        });

        if (!coupon) {
            return res.status(404).json({ isValid: false, message: 'Invalid or expired coupon' });
        }

        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return res.status(400).json({ isValid: false, message: 'Coupon usage limit reached' });
        }

        if (cartTotal && coupon.min_order_value > cartTotal) {
            return res.status(400).json({
                isValid: false,
                message: `Minimum order value of ${coupon.min_order_value} required`
            });
        }

        res.json({ isValid: true, coupon });
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
