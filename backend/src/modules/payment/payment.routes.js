import express from 'express';
import { createRazorpayOrder, verifyPayment, getAllPayments, handleWebhook, createRefund, getPaymentStatus } from './payment.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
    createRazorpayOrderSchema,
    verifyPaymentSchema,
    createRefundSchema,
    getPaymentStatusSchema
} from './payment.validation.js';

const router = express.Router();

// Webhook for Razorpay events (No Auth middleware as it comes from Razorpay)
router.post('/webhook', handleWebhook);

router.use(authenticate);

router.post('/create-order', validate(createRazorpayOrderSchema), createRazorpayOrder);
router.post('/verify', validate(verifyPaymentSchema), verifyPayment);
router.post('/refund', validate(createRefundSchema), createRefund); // Ensure only admin/authorized users can refund in broader implementation
router.get('/status/:transaction_id', validate(getPaymentStatusSchema, 'params'), getPaymentStatus);
router.get('/', getAllPayments);

export default router;
