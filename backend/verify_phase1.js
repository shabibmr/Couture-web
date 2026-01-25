import fetch from 'node-fetch';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM2MjQ2MTEzLWU0NDEtNDljNy05MmI2LTJkMDRjNzExNDNkZCIsInJvbGUiOiJjdXN0b21lciIsInR5cGUiOiJjdXN0b21lciIsImlhdCI6MTc2OTM1OTg3MiwiZXhwIjoxNzY5OTY0NjcyfQ.vxUcRdTNY4tUDhRy5TBQs1QWxk5o2oGEZ5yCZJ82P8c';
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log('--- STARTING PHASE 1 VERIFICATION (Robust v2) ---');

    try {
        const timestamp = Date.now();

        // -1. Get Valid Size
        const sizesRes = await fetch(`${BASE_URL}/products/sizes`);
        const sizesData = await sizesRes.json();
        const validSize = sizesData[0]?.name || 'M';
        console.log(`Using Size: ${validSize}`);

        // 0. Get a Category (or Create)
        let catRes = await fetch(`${BASE_URL}/products/categories`);
        let catData = await catRes.json();

        let categoryId = null;
        if (Array.isArray(catData) && catData.length > 0) {
            categoryId = catData[0].id;
            console.log(`Using Existing Category: ${catData[0].name}`);
        }

        if (!categoryId) {
            console.log('No categories found. Creating one...');
            const createCatRes = await fetch(`${BASE_URL}/products/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TOKEN}`
                },
                body: JSON.stringify({
                    name: `Test Category ${timestamp}`,
                    slug: `test-category-${timestamp}`,
                    description: "Test",
                    status: "Active"
                })
            });
            if (createCatRes.ok) {
                const newCat = await createCatRes.json();
                categoryId = newCat.id;
                console.log(`Created Category: ${categoryId}`);
            } else {
                console.error('Failed to create category:', await createCatRes.text());
                return;
            }
        }

        // 1. Create a Test Product with Size
        console.log('\n--- 1. Creating Test Product ---');
        const createRes = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                name: `Test Shirt ${timestamp}`,
                description: "A test shirt for verification",
                category_id: categoryId,
                base_price: 500,
                code: `TEST-${timestamp}`,
                sizes: [validSize]
            })
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            console.error(`Failed to create product: ${createRes.status} ${err}`);
            return;
        }

        const product = await createRes.json();
        console.log(`Product Created: ${product.name} (${product.id})`);

        // Verify variants were created
        const productDetailRes = await fetch(`${BASE_URL}/products/id/${product.id}`);
        const productDetail = await productDetailRes.json();

        let targetSize = validSize;
        const variant = productDetail.variants?.find(v => v.Size?.name === validSize);
        if (!variant) {
            console.error(`CRITICAL: Created product but no variant with size ${validSize} found.`);
            console.log('Variants found:', JSON.stringify(productDetail.variants, null, 2));
            return;
        } else {
            console.log(`Confirmed variant with Size ${validSize} exists.`);
        }

        // 2. Test Add to Cart with product_id + size
        console.log('\n--- 2. Testing Add to Cart (product_id + size) ---');
        const addToCartRes = await fetch(`${BASE_URL}/cart/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                product_id: product.id,
                size: targetSize,
                quantity: 1
            })
        });

        const addToCartData = await addToCartRes.json();
        console.log(`Add to Cart Status: ${addToCartRes.status}`);
        if (addToCartRes.ok) {
            console.log('SUCCESS: Added to cart using Product ID + Size');
        } else {
            console.error(`FAIL: ${addToCartData.message}`);
            return;
        }

        // 3. Test Coupon Validation with cartTotal
        console.log('\n--- 3. Testing Coupon Validation (cartTotal param) ---');
        const couponRes = await fetch(`${BASE_URL}/coupons/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: 'INVALIDCODE',
                cartTotal: 1000
            })
        });
        const couponData = await couponRes.json();
        console.log(`Coupon Validation Status: ${couponRes.status}`);
        if (couponData.message === 'Code and cart total required') {
            console.error('FAIL: Still demanding cart_total parameter');
        } else {
            console.log('SUCCESS: Parameter cartTotal accepted (Result: ' + couponData.message + ')');
        }

        // 4. Test Create Order with Explicit Items
        console.log('\n--- 4. Testing Create Order (Explicit Items) ---');
        const orderRes = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                shipping_address: "123 Test St, Mumbai",
                billing_address: "123 Test St, Mumbai",
                items: [
                    {
                        product_id: product.id,
                        size: targetSize,
                        quantity: 1,
                        price: 1, // Attempt price manipulation
                        unit_price: 1
                    }
                ],
                total_amount: 1
            })
        });

        const orderData = await orderRes.json();
        console.log(`Create Order Status: ${orderRes.status}`);
        if (orderRes.ok) {
            console.log(`Order Created: ${orderData.order?.order_number}`);
            const item = orderData.order?.items?.[0];
            if (item) {
                console.log(`Logged Price: ${item.unit_price} (Should be 500.00)`);
                if (Math.floor(parseFloat(item.unit_price)) === 500) {
                    console.log('SUCCESS: Order created and price manipulation prevented (recalculated from DB)');
                } else {
                    console.warn(`WARNING: Price matches input? ${item.unit_price}`);
                }
            }
        } else {
            console.error('Order Creation Failed:', orderData.message);
        }

    } catch (error) {
        console.error('Test execution error:', error);
    }
}

runTests();
