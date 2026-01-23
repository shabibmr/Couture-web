import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendTestEmail = async () => {
    try {
        console.log('Initializing SMTP transporter...');

        if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
            console.error('❌ SMTP configuration not found in .env');
            console.log('Please ensure SMTP_HOST, SMTP_USER, and SMTP_PASS are set.');
            process.exit(1);
        }

        const transporter = createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: 'ruveracouture@gmail.com',
            subject: 'Test Email from Ruvera Couture - SMTP Configuration',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #C5A059; border-bottom: 2px solid #C5A059; padding-bottom: 10px;">
                        🎉 SMTP Configuration Test
                    </h2>
                    
                    <p>Hello from Ruvera Couture!</p>
                    
                    <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #C5A059;">
                        <h3 style="margin-top: 0; color: #333;">Test Email Details</h3>
                        <p><strong>Sent at:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                        <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
                        <p><strong>From:</strong> ${process.env.SMTP_FROM || process.env.SMTP_USER}</p>
                        <p><strong>Status:</strong> ✅ Configuration is working correctly!</p>
                    </div>

                    <p>This confirms that your email notification system is properly configured and ready to send:</p>
                    <ul>
                        <li>Payment confirmation emails</li>
                        <li>Payment failure notifications</li>
                        <li>Refund confirmations</li>
                        <li>Admin order notifications</li>
                    </ul>

                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
                    <p style="color: #888; font-size: 12px; text-align: center;">
                        Ruvera Couture - Luxury Fashion<br>
                        This is an automated test email.
                    </p>
                </div>
            `,
        });

        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('📧 Check ruveracouture@gmail.com inbox');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error sending test email:');
        console.error(error);
        process.exit(1);
    }
};

sendTestEmail();
