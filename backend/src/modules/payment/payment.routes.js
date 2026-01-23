import express from 'express';
import { createRazorpayOrder, verifyPayment, getAllPayments, handleWebhook, createRefund, getPaymentStatus } from './payment.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Webhook for Razorpay events (No Auth middleware as it comes from Razorpay)
router.post('/webhook', handleWebhook);

router.use(authenticate);

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.post('/refund', createRefund); // Ensure only admin/authorized users can refund in broader implementation
router.get('/status/:transaction_id', getPaymentStatus);
router.get('/', getAllPayments);

export default router;
