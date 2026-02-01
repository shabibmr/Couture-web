/**
 * Razorpay Credentials Test Script
 *
 * This script tests both test and live Razorpay credentials
 * Run: node test-razorpay.js
 */

import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const testCredentials = async (mode) => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Testing ${mode.toUpperCase()} Mode Credentials`);
    console.log('='.repeat(50));

    const keyId = mode === 'live'
        ? process.env.RAZORPAY_LIVE_KEY_ID
        : process.env.RAZORPAY_TEST_KEY_ID;

    const keySecret = mode === 'live'
        ? process.env.RAZORPAY_LIVE_KEY_SECRET
        : process.env.RAZORPAY_TEST_KEY_SECRET;

    console.log(`Key ID: ${keyId || 'NOT SET'}`);
    console.log(`Key Secret: ${keySecret ? '***' + keySecret.slice(-4) : 'NOT SET'}`);

    if (!keyId || !keySecret) {
        console.log(`❌ ${mode.toUpperCase()} credentials not configured in .env`);
        return false;
    }

    try {
        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        // Try to create a test order
        const options = {
            amount: 10000, // ₹100 in paise
            currency: 'INR',
            receipt: `test_receipt_${Date.now()}`,
        };

        console.log('\nAttempting to create a test order...');
        const order = await razorpay.orders.create(options);

        console.log(`✅ SUCCESS! Order created: ${order.id}`);
        console.log(`   Amount: ₹${order.amount / 100}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Receipt: ${order.receipt}`);

        return true;

    } catch (error) {
        console.log(`❌ FAILED!`);
        console.log(`   Status Code: ${error.statusCode || 'N/A'}`);
        console.log(`   Error: ${error.error?.description || error.message}`);

        if (error.statusCode === 401) {
            console.log('\n⚠️  401 Authentication Failed - Possible reasons:');
            if (mode === 'live') {
                console.log('   1. Live mode not activated on your Razorpay account');
                console.log('   2. KYC verification pending');
                console.log('   3. Wrong credentials (check Razorpay Dashboard)');
                console.log('   4. Credentials were regenerated');
            } else {
                console.log('   1. Wrong test credentials');
                console.log('   2. Check Razorpay Dashboard → API Keys → Test Mode');
            }
        }

        return false;
    }
};

const main = async () => {
    console.log('\n🔐 Razorpay Credentials Verification Tool');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Current Mode Setting: ${process.env.RAZORPAY_MODE || 'test'}`);

    // Test TEST credentials
    const testSuccess = await testCredentials('test');

    // Test LIVE credentials
    const liveSuccess = await testCredentials('live');

    // Summary
    console.log(`\n${'='.repeat(50)}`);
    console.log('SUMMARY');
    console.log('='.repeat(50));
    console.log(`Test Mode: ${testSuccess ? '✅ Working' : '❌ Failed'}`);
    console.log(`Live Mode: ${liveSuccess ? '✅ Working' : '❌ Failed'}`);

    if (!liveSuccess) {
        console.log('\n💡 RECOMMENDATION:');
        console.log('   Use test mode for development: RAZORPAY_MODE=test');
        console.log('   Only use live mode in production after account activation');
    }

    console.log('\n');
};

main().catch(console.error);
