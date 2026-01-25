
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const baseUrl = 'http://localhost:5000/api';
const SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

// Test Data
const TEST_USER = {
    id: '36246113-e441-49c7-92b6-2d04c71143dd',
    role: 'customer'
};

const VARIANT_ID = 'b4c237c6-3b13-49de-8bcb-c8a4994cf2ae'; // Existing Variant
const SHIPPING_METHOD_ID = 'f4ee63ad-e740-4d81-b3e1-64a7eec8c74a'; // Existing Method

// Generate Token
const token = jwt.sign(TEST_USER, SECRET, { expiresIn: '1d' });
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

const results = [];

async function runStep(name, method, endpoint, body = null, expectedStatus = 200) {
    try {
        console.log(`\n--- Verification: ${name} ---`);
        const options = {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        };
        const res = await fetch(`${baseUrl}${endpoint}`, options);
        let data = {};
        try {
            data = await res.json();
        } catch (e) { }

        const passed = res.status === expectedStatus || (expectedStatus === 201 && res.status === 200) || (expectedStatus === 200 && res.status === 201);

        console.log(`Endpoint: ${method} ${endpoint}`);
        console.log(`Status: ${res.status} (Expected: ${expectedStatus})`);

        if (!passed) {
            console.error('FAILED - Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('PASSED');
        }

        results.push({
            name,
            endpoint: `${method} ${endpoint}`,
            status: res.status,
            passed,
            details: passed ? 'Success' : `Failed: ${data.message || 'Unknown error'}`
        });

        return data;
    } catch (error) {
        console.error(`ERROR executing ${name}:`, error.message);
        results.push({
            name,
            endpoint: `${method} ${endpoint}`,
            status: 'ERR',
            passed: false,
            details: error.message
        });
        return null;
    }
}

async function verifyAll() {
    console.log('Starting Comprehensive API Verification...');

    // 1. AUTH & PROFILE
    const me = await runStep('Get Profile', 'GET', '/auth/me');

    // 2. PRODUCTS
    const products = await runStep('List Products', 'GET', '/products?limit=1');
    const productId = products?.data?.[0]?.id;
    if (productId) {
        await runStep('Get Product Details', 'GET', `/products/id/${productId}`);
    }

    // 3. WISHLIST
    if (productId) {
        // Add
        const wishItem = await runStep('Add to Wishlist', 'POST', '/wishlist/items', { product_id: productId }, 201);
        // List
        await runStep('Get Wishlist', 'GET', '/wishlist');
        // Remove
        if (wishItem && wishItem.item) {
            // Note: API returns item id, need to use that.
            // If item.id is the wishlist_item id:
            await runStep('Remove from Wishlist', 'DELETE', `/wishlist/items/${wishItem.item.id}`);
        }
    }

    // 4. CART
    await runStep('Add to Cart', 'POST', '/cart/items', { variant_id: VARIANT_ID, quantity: 1 });
    const cart = await runStep('Get Cart', 'GET', '/cart');

    // 5. ORDER
    // Create Order
    const orderRes = await runStep('Create Order', 'POST', '/orders', {
        shipping_address: { street: '123 Main', city: 'Test City', state: 'TS', zip: '12345' },
        billing_address: { street: '123 Main', city: 'Test City', state: 'TS', zip: '12345' },
        shipping_method_id: SHIPPING_METHOD_ID
    }, 201);

    if (orderRes && orderRes.order) {
        const orderId = orderRes.order.id;

        // Get Order
        await runStep('Get Order Details', 'GET', `/orders/${orderId}`);

        // 6. PAYMENT (Create Order ID)
        await runStep('Create Razorpay Order', 'POST', '/payment/create-order', { order_id: orderId });

        // Update Order Status (Newly added endpoint)
        await runStep('Update Order Status', 'PUT', `/orders/${orderId}/status`, { status: 'processing' });
    }

    // Report
    console.log('\n\n=== VERIFICATION SUMMARY ===');
    console.table(results);
}

verifyAll();
