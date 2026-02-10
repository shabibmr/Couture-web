import express from 'express';
import * as couponController from './coupon.controller.js';

const router = express.Router();

router.get('/', couponController.getCoupons);
router.get('/:id', couponController.getCouponById);
router.post('/', couponController.createCoupon);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);
router.post('/validate', couponController.validateCoupon);
router.post('/validate-multiple', couponController.validateMultipleCoupons);

export default router;
