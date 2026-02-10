const http = require('http');
const { exec } = require('child_process');

// Backend is running on port 5000
const API_BASE = 'http://localhost:5000';

const post = (path, data, token) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };
        const req = http.request(`${API_BASE}${path}`, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body || '{}');
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

const get = (path, token) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };
        const req = http.request(`${API_BASE}${path}`, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body || '{}');
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body: body });
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
};

function runMysql(query) {
    return new Promise((resolve, reject) => {
        const command = `mysql -u user2grey -puser2grey couture_db -N -e "${query}"`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return reject(error);
            }
            resolve(stdout.trim());
        });
    });
}

async function runTest() {
    try {
        console.log('--- Starting Verification ---');

        // 1. Register User
        const email = `testuser_${Date.now()}@example.com`;
        console.log(`1. Registering user: ${email}`);
        const reg = await post('/auth/register', {
            first_name: 'Test', last_name: 'User', email, password: 'password123', phone: '9999999999'
        });

        if (!reg.body.token) throw new Error(`Registration failed: ${JSON.stringify(reg.body)}`);
        const token = reg.body.token;
        const userId = reg.body.user.id;
        console.log('   User registered. Token acquired.');

        // 2. Fetch Valid Product & Variant from DB
        console.log('2. Fetching valid Product Variant from DB...');
        const query = `
            SELECT pv.product_id, pv.id, s.name 
            FROM product_variants pv 
            LEFT JOIN sizes s ON pv.size_id = s.id 
            LIMIT 1
        `;

        const dbResult = await runMysql(query);
        if (!dbResult) throw new Error("No variants found in DB.");

        const parts = dbResult.split(/\t/);
        const productId = parts[0];
        const variantId = parts[1];
        const sizeName = parts[2] || 'M';

        console.log(`   Product: ${productId}, Variant: ${variantId}, Size: ${sizeName}`);

        // 3. Create Coupon in DB
        const couponCode = `NODE${Date.now()}`;
        console.log(`3. Creating coupon: ${couponCode}`);

        await runMysql(`INSERT INTO coupons (id, code, discount_type, discount_value, min_order_value, is_active, valid_from, valid_until, created_at, updated_at) VALUES (UUID(), '${couponCode}', 'percentage', 20.00, 500, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), NOW(), NOW());`);
        console.log('   Coupon inserted into DB.');

        // 4. Validate Coupon
        console.log('4. Validating coupon via API...');
        const valRes = await post('/coupons/validate', {
            code: couponCode,
            cartTotal: 1000,
            customerId: userId,
            items: [{ product_id: productId, quantity: 1 }] // Quantity 1
        }, token);

        if (valRes.body.isValid) {
            console.log('   PASS: Coupon is valid.');
            // Also print discountAmount to verify calculation
            console.log('   Discount Amount (Preview):', valRes.body.discountAmount);
        } else {
            console.error('   FAIL: Coupon validation failed.', valRes.body);
        }

        // 5. Create Order
        console.log('5. Creating Order with Coupon...');
        const orderRes = await post('/orders', {
            items: [{
                product_id: productId,
                variant_id: variantId,
                quantity: 1, // Quantity 1
                size: sizeName,
                price: 1000 // Dummy price for validation if needed, though backend looks up real price
            }],
            shipping_address: { name: 'Test', address: '123 St', city: 'City', zip: '12345', phone: '1234567890' },
            billing_address: { name: 'Test', address: '123 St', city: 'City', zip: '12345', phone: '1234567890' },
            payment_method: 'cod',
            coupon_code: couponCode
        }, token);

        if (orderRes.status === 201 || orderRes.status === 200) {
            const order = orderRes.body.order || orderRes.body;
            console.log('   Order ID:', order.id || order.order_id);
            console.log('   Order Total:', order.total_amount);
            console.log('   Discount Amount:', order.discount_amount);

            if (parseFloat(order.discount_amount) > 0) {
                console.log(`   PASS: Order created with discount: ${order.discount_amount}`);
            } else {
                console.error('   FAIL: Order created but discount is 0.');
            }
        } else {
            console.error('   FAIL: Order creation failed.', JSON.stringify(orderRes.body, null, 2));
        }

    } catch (err) {
        console.error('Error:', err.message);
        if (err.stack) console.error(err.stack);
    }
}

runTest();
