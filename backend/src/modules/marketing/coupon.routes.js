import express from 'express';
import * as couponController from './coupon.controller.js';

const router = express.Router();

router.get('/', couponController.getCoupons);
router.post('/', couponController.createCoupon);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);
router.post('/validate', couponController.validateCoupon);

export default router;
