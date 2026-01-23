import nodemailer from 'nodemailer';

let transporter;

const initializeTransporter = () => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn('Email service not configured. Skipping email initialization.');
        return null;
    }

    // Handle potential import issues with nodemailer v7
    const createTransport = nodemailer.createTransport || nodemailer.createTransporter;

    if (typeof createTransport !== 'function') {
        console.error('Nodemailer createTransport not found. Nodemailer object:', nodemailer);
        return null;
    }

    transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    return transporter;
};

// Initialize on module load
initializeTransporter();

export const sendPaymentSuccessEmail = async (customer, order, payment) => {
    if (!transporter) {
        console.log('Email skipped: Payment success for', customer.email);
        return;
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: customer.email,
        subject: `Payment Successful - Order #${order.order_number}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #C5A059;">Payment Confirmed!</h2>
                <p>Dear ${customer.first_name},</p>
                <p>Your payment of <strong>₹${order.total_amount.toLocaleString('en-IN')}</strong> has been successfully processed.</p>
                
                <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
                    <h3 style="margin-top: 0;">Order Details</h3>
                    <p><strong>Order ID:</strong> ${order.order_number}</p>
                    <p><strong>Amount:</strong> ₹${order.total_amount.toLocaleString('en-IN')}</p>
                    <p><strong>Payment ID:</strong> ${payment.razorpay_payment_id}</p>
                    <p><strong>Status:</strong> Confirmed</p>
                </div>

                <p>We'll send you another email once your order ships.</p>
                <p>Thank you for shopping with Ruvera Couture!</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
                <p style="color: #888; font-size: 12px;">Ruvera Couture - Luxury Fashion</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Payment success email sent to:', customer.email);
    } catch (error) {
        console.error('Error sending payment success email:', error);
    }
};

export const sendPaymentFailedEmail = async (customer, order, errorMessage) => {
    if (!transporter) {
        console.log('Email skipped: Payment failed for', customer.email);
        return;
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: customer.email,
        subject: `Payment Failed - Order #${order.order_number}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d32f2f;">Payment Failed</h2>
                <p>Dear ${customer.first_name},</p>
                <p>We were unable to process your payment for Order #${order.order_number}.</p>
                
                <div style="background: #fff3cd; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <p><strong>Order ID:</strong> ${order.order_number}</p>
                    <p><strong>Amount:</strong> ₹${order.total_amount.toLocaleString('en-IN')}</p>
                    ${errorMessage ? `<p><strong>Reason:</strong> ${errorMessage}</p>` : ''}
                </div>

                <p>Please try again or contact our support team for assistance.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
                <p style="color: #888; font-size: 12px;">Ruvera Couture - Luxury Fashion</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Payment failed email sent to:', customer.email);
    } catch (error) {
        console.error('Error sending payment failed email:', error);
    }
};

export const sendRefundProcessedEmail = async (customer, order, refundAmount) => {
    if (!transporter) {
        console.log('Email skipped: Refund processed for', customer.email);
        return;
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: customer.email,
        subject: `Refund Processed - Order #${order.order_number}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4caf50;">Refund Processed</h2>
                <p>Dear ${customer.first_name},</p>
                <p>Your refund has been processed successfully.</p>
                
                <div style="background: #e8f5e9; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4caf50;">
                    <h3 style="margin-top: 0;">Refund Details</h3>
                    <p><strong>Order ID:</strong> ${order.order_number}</p>
                    <p><strong>Refund Amount:</strong> ₹${refundAmount.toLocaleString('en-IN')}</p>
                </div>

                <p>The refund will reflect in your account within 5-7 business days.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
                <p style="color: #888; font-size: 12px;">Ruvera Couture - Luxury Fashion</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Refund processed email sent to:', customer.email);
    } catch (error) {
        console.error('Error sending refund email:', error);
    }
};

export const sendAdminOrderNotification = async (order, customer) => {
    if (!transporter || !process.env.ADMIN_EMAIL) {
        console.log('Email skipped: Admin notification for order', order.order_number);
        return;
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New Order Received - #${order.order_number}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #C5A059;">New Order Notification</h2>
                <p>A new order has been placed and payment confirmed.</p>
                
                <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
                    <h3 style="margin-top: 0;">Order Details</h3>
                    <p><strong>Order ID:</strong> ${order.order_number}</p>
                    <p><strong>Customer:</strong> ${customer.first_name} ${customer.last_name}</p>
                    <p><strong>Email:</strong> ${customer.email}</p>
                    <p><strong>Amount:</strong> ₹${order.total_amount.toLocaleString('en-IN')}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                </div>

                <p>Please process this order as soon as possible.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Admin notification sent for order:', order.order_number);
    } catch (error) {
        console.error('Error sending admin notification:', error);
    }
};
