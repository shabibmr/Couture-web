import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const setupEtherealAndTest = async () => {
    try {
        console.log('Creating Ethereal test account...');

        // Dynamically import nodemailer
        const nodemailer = await import('nodemailer');

        // Create a test account
        const testAccount = await nodemailer.default.createTestAccount();

        console.log('✅ Ethereal test account created!');
        console.log('Email:', testAccount.user);
        console.log('Password:', testAccount.pass);
        console.log('\nUpdate your .env with these credentials:');
        console.log(`SMTP_HOST=smtp.ethereal.email`);
        console.log(`SMTP_PORT=587`);
        console.log(`SMTP_USER=${testAccount.user}`);
        console.log(`SMTP_PASS=${testAccount.pass}`);
        console.log(`SMTP_FROM=${testAccount.user}`);

        // Send test email
        const transporter = createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        const info = await transporter.sendMail({
            from: testAccount.user,
            to: 'test@example.com',
            subject: 'Test Email from Ruvera Couture',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #C5A059;">🎉 Email System Working!</h2>
                    <p>Your notification system is properly configured.</p>
                    <p><strong>Sent at:</strong> ${new Date().toLocaleString('en-IN')}</p>
                </div>
            `,
        });

        console.log('\n✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('\n📧 View the email here:');
        console.log(nodemailer.default.getTestMessageUrl(info));

    } catch (error) {
        console.error('❌ Error:', error);
    }
};

setupEtherealAndTest();
