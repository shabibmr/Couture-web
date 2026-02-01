import Razorpay from 'razorpay';
import crypto from 'crypto';
import PaymentTransaction from './models/payment_transaction.model.js';
import Order from '../order/models/order.model.js';
import PaymentGateway from './models/payment_gateway.model.js';
import Customer from '../identity/models/customer.model.js';
import Refund from './models/refund.model.js';
import { sendPaymentSuccessEmail, sendPaymentFailedEmail, sendRefundProcessedEmail, sendAdminOrderNotification } from '../notification/services/email.service.js';
import { createNotification } from '../notification/services/notification.service.js';

let razorpayInstance;

const initRazorpay = async () => {
    // Determine which credentials to use based on RAZORPAY_MODE
    const mode = process.env.RAZORPAY_MODE || 'test'; // Default to test mode for safety

    const keyId = mode === 'live'
        ? process.env.RAZORPAY_LIVE_KEY_ID
        : process.env.RAZORPAY_TEST_KEY_ID;

    const keySecret = mode === 'live'
        ? process.env.RAZORPAY_LIVE_KEY_SECRET
        : process.env.RAZORPAY_TEST_KEY_SECRET;

    if (keyId && keySecret) {
        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
        console.log(`[Razorpay] Initialized in ${mode.toUpperCase()} mode`);
    } else {
        console.error(`[Razorpay] Missing credentials for ${mode.toUpperCase()} mode`);
    }
}

initRazorpay();

export const getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const payments = await PaymentTransaction.findAndCountAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: Order,
                    include: [{ model: Customer, attributes: ['first_name', 'last_name', 'email'] }]
                },
                { model: PaymentGateway, attributes: ['name'] }
            ],
            order: [['created_at', 'DESC']],
            distinct: true
        });

        res.json({
            total: payments.count,
            pages: Math.ceil(payments.count / limit),
            currentPage: parseInt(page),
            data: payments.rows
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createRazorpayOrder = async (req, res) => {
    console.log("[PaymentController] createRazorpayOrder started for order_id:", req.body.order_id);

    // Define mode and keyId at function scope so they're available in catch block
    const mode = process.env.RAZORPAY_MODE || 'test';
    const keyId = mode === 'live'
        ? process.env.RAZORPAY_LIVE_KEY_ID
        : process.env.RAZORPAY_TEST_KEY_ID;

    try {
        const { order_id } = req.body;
        const customer_id = req.user.id;

        const order = await Order.findOne({ where: { id: order_id, customer_id } });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order is not in pending state' });
        }

        const amountInPaise = Math.round(order.total_amount * 100);

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: order.order_number,
        };

        if (!razorpayInstance) {
            await initRazorpay();
        }

        if (!razorpayInstance) {
            console.error('[PaymentController] Razorpay instance not initialized. Check credentials.');
            return res.status(500).json({
                message: 'Payment gateway configuration error',
                error: `Razorpay credentials missing for ${mode} mode`
            });
        }

        console.log("[PaymentController] Calling Razorpay API for order receipt:", order.order_number);
        const razorpayOrder = await razorpayInstance.orders.create(options);
        console.log("[PaymentController] Razorpay order created, RZP ID:", razorpayOrder.id);

        // Find or Create Gateway Record
        const [gateway] = await PaymentGateway.findOrCreate({
            where: { code: 'razorpay' },
            defaults: { name: 'Razorpay', is_active: true }
        });

        // Create transaction record
        await PaymentTransaction.create({
            order_id: order.id,
            transaction_id: razorpayOrder.id, // Razorpay Order ID initially
            payment_gateway_id: gateway.id,
            amount: order.total_amount,
            status: 'pending',
            gateway_response: razorpayOrder,
            payment_date: new Date()
        });

        res.json({
            id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
            key_id: keyId,
            mode: mode // Add mode to response
        });

    } catch (error) {
        console.error('Error creating razorpay order:', error);
        res.status(500).json({
            message: `Payment gateway error in ${mode} mode`,
            error: error.message
        });
    }
};

export const verifyPayment = async (req, res) => {
    console.log("[PaymentController] verifyPayment started for RZP Order:", req.body.razorpay_order_id);
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const mode = process.env.RAZORPAY_MODE || 'test';
        const keySecret = mode === 'live'
            ? process.env.RAZORPAY_LIVE_KEY_SECRET
            : process.env.RAZORPAY_TEST_KEY_SECRET;

        const generated_signature = crypto
            .createHmac('sha256', keySecret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        const transaction = await PaymentTransaction.findOne({
            where: { transaction_id: razorpay_order_id }
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (generated_signature === razorpay_signature) {

            // Update Transaction
            await transaction.update({
                status: 'completed',
                gateway_response: { ...transaction.gateway_response, payment_id: razorpay_payment_id, signature: razorpay_signature },
                payment_date: new Date()
            });

            // Update Order Status
            const order = await Order.findByPk(transaction.order_id, {
                include: [{ model: Customer, attributes: ['id', 'first_name', 'last_name', 'email'] }]
            });
            await order.update({ status: 'confirmed' });

            // Send notifications
            const customer = order.Customer;
            await sendPaymentSuccessEmail(customer, order, { razorpay_payment_id });
            await sendAdminOrderNotification(order, customer);
            await createNotification(
                customer.id,
                'payment_success',
                'Payment Successful',
                `Your payment for order #${order.order_number} has been confirmed.`,
                { order_id: order.id, amount: order.total_amount }
            );

            console.log("[PaymentController] Payment verification successful for RZP Order:", razorpay_order_id);
            res.json({ status: 'success', message: 'Payment verified successfully' });
        } else {
            console.error("[PaymentController] Payment verification failed (signature mismatch) for RZP Order:", razorpay_order_id);
            await transaction.update({
                status: 'failed',
                gateway_response: { ...transaction.gateway_response, failure_reason: 'Signature mismatch' }
            });

            res.status(400).json({ status: 'failure', message: 'Payment verification failed' });
        }

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const handleWebhook = async (req, res) => {
    try {
        const mode = process.env.RAZORPAY_MODE || 'test';
        const secret = mode === 'live'
            ? process.env.RAZORPAY_LIVE_WEBHOOK_SECRET
            : process.env.RAZORPAY_TEST_WEBHOOK_SECRET;

        // Verify signature
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(req.rawBody);
        const digest = shasum.digest('hex');

        if (digest !== req.headers['x-razorpay-signature']) {
            console.error('Invalid webhook signature');
            return res.status(400).json({ status: 'error', message: 'Invalid signature' });
        }

        const event = req.body;
        const paymentDetails = event.payload.payment.entity;
        const razorpay_order_id = paymentDetails.order_id;
        const razorpay_payment_id = paymentDetails.id;

        console.log('Received Webhook Event:', event.event);

        const transaction = await PaymentTransaction.findOne({
            where: { transaction_id: razorpay_order_id }
        });

        if (!transaction) {
            console.error(`Transaction not found for order: ${razorpay_order_id}`);
            // Return 200 to acknowledge webhook even if local record missing to prevent retries
            return res.status(200).json({ status: 'ignored', message: 'Transaction not found' });
        }

        if (event.event === 'payment.captured') {
            if (transaction.status !== 'completed') {
                await transaction.update({
                    status: 'completed',
                    gateway_response: { ...transaction.gateway_response, payment_id: razorpay_payment_id, webhook_data: event },
                    payment_date: new Date()
                });

                const order = await Order.findByPk(transaction.order_id, {
                    include: [{ model: Customer, attributes: ['id', 'first_name', 'last_name', 'email'] }]
                });
                await order.update({ status: 'confirmed' });

                // Send notifications
                const customer = order.Customer;
                await sendPaymentSuccessEmail(customer, order, { razorpay_payment_id });
                await createNotification(
                    customer.id,
                    'payment_success',
                    'Payment Successful',
                    `Your payment for order #${order.order_number} has been confirmed.`,
                    { order_id: order.id, amount: order.total_amount }
                );

                console.log(`Payment captured for Order: ${transaction.order_id}`);
            }
        } else if (event.event === 'payment.failed') {
            await transaction.update({
                status: 'failed',
                gateway_response: { ...transaction.gateway_response, failure_data: event }
            });

            // Send notifications
            const order = await Order.findByPk(transaction.order_id, {
                include: [{ model: Customer, attributes: ['id', 'first_name', 'last_name', 'email'] }]
            });
            const customer = order.Customer;
            const errorMessage = event.payload?.payment?.entity?.error_description || 'Payment processing failed';
            await sendPaymentFailedEmail(customer, order, errorMessage);
            await createNotification(
                customer.id,
                'payment_failed',
                'Payment Failed',
                `Payment for order #${order.order_number} could not be processed.`,
                { order_id: order.id, error: errorMessage }
            );

            console.log(`Payment failed for Order: ${transaction.order_id}`);
        } else if (event.event === 'refund.processed') {
            await transaction.update({
                status: 'refunded',
                gateway_response: { ...transaction.gateway_response, refund_data: event }
            });

            // Send notifications
            const order = await Order.findByPk(transaction.order_id, {
                include: [{ model: Customer, attributes: ['id', 'first_name', 'last_name', 'email'] }]
            });
            await order.update({ status: 'refunded' });

            const customer = order.Customer;
            const refundAmount = event.payload?.refund?.entity?.amount / 100 || transaction.amount;
            await sendRefundProcessedEmail(customer, order, refundAmount);
            await createNotification(
                customer.id,
                'refund_processed',
                'Refund Processed',
                `Refund of ₹${refundAmount.toLocaleString('en-IN')} for order #${order.order_number} has been processed.`,
                { order_id: order.id, refund_amount: refundAmount }
            );

            console.log(`Refund processed for Order: ${transaction.order_id}`);
        }

        res.json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createRefund = async (req, res) => {
    try {
        const { transaction_id, amount, reason } = req.body;

        const transaction = await PaymentTransaction.findOne({
            where: { id: transaction_id }
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status !== 'completed') {
            return res.status(400).json({ message: 'Transaction is not in completed state' });
        }

        if (!razorpayInstance) await initRazorpay();

        // Amount in paise for RazorPay
        const refundAmount = Math.round(amount * 100);

        // Verify payment_id exists in gateway_response
        const paymentId = transaction.gateway_response?.payment_id || transaction.gateway_response?.razorpay_payment_id;

        if (!paymentId) {
            return res.status(400).json({ message: 'Payment ID not found for this transaction' });
        }

        const refund = await razorpayInstance.payments.refund(paymentId, {
            amount: refundAmount,
            notes: { reason: reason || 'Refund request' }
        });

        // Create Refund Record
        await Refund.create({
            order_id: transaction.order_id,
            transaction_id: transaction.id,
            refund_amount: amount,
            status: 'completed',
            reason: reason || 'Refund request',
            processed_date: new Date()
        });

        await transaction.update({
            status: 'refunded',
            gateway_response: { ...transaction.gateway_response, refund_id: refund.id, refund_details: refund }
        });

        // Update order status and send notifications
        const order = await Order.findByPk(transaction.order_id, {
            include: [{ model: Customer, attributes: ['id', 'first_name', 'last_name', 'email'] }]
        });
        await order.update({ status: 'refunded' });

        const customer = order.Customer;
        await sendRefundProcessedEmail(customer, order, amount);
        await createNotification(
            customer.id,
            'refund_processed',
            'Refund Initiated',
            `Refund of ₹${amount.toLocaleString('en-IN')} for order #${order.order_number} has been initiated.`,
            { order_id: order.id, refund_amount: amount }
        );

        res.json({ message: 'Refund initiated successfully', refund });

    } catch (error) {
        console.error('Error creating refund:', error);
        res.status(500).json({ message: 'Server error', error: error.error ? error.error.description : error.message });
    }
};

export const getPaymentStatus = async (req, res) => {
    try {
        const { transaction_id } = req.params;

        const transaction = await PaymentTransaction.findOne({
            where: { id: transaction_id }
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (!razorpayInstance) await initRazorpay();

        const paymentId = transaction.gateway_response?.payment_id || transaction.gateway_response?.razorpay_payment_id;

        if (paymentId) {
            const payment = await razorpayInstance.payments.fetch(paymentId);
            res.json({ transaction_status: transaction.status, gateway_status: payment.status, details: payment });
        } else {
            // If we only have order_id (payment never completed or captured)
            const orderId = transaction.transaction_id; // This stores razorpay order id initially
            const order = await razorpayInstance.orders.fetch(orderId);
            res.json({ transaction_status: transaction.status, gateway_order_status: order.status, details: order });
        }

    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
