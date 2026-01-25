const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM2MjQ2MTEzLWU0NDEtNDljNy05MmI2LTJkMDRjNzExNDNkZCIsInJvbGUiOiJjdXN0b21lciIsInR5cGUiOiJjdXN0b21lciIsImlhdCI6MTc2OTM1NzU3MSwiZXhwIjoxNzY5OTYyMzcxfQ._F3jIoZuKvqjMaYN4tPlU5pX8WKdIh8c6obRv7_yWI8';
const variantId = 'b4c237c6-3b13-49de-8bcb-c8a4994cf2ae';
const shippingMethodId = 'f4ee63ad-e740-4d81-b3e1-64a7eec8c74a';
const baseUrl = 'http://localhost:5000/api';

async function verify() {
    try {
        console.log('--- 1. Add to Cart ---');
        const addResponse = await fetch(`${baseUrl}/cart/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ variant_id: variantId, quantity: 2 })
        });
        const addResult = await addResponse.json();
        console.log('Status:', addResponse.status);
        console.log('Response:', JSON.stringify(addResult, null, 2));

        console.log('\n--- 2. Get Cart ---');
        const getCartResponse = await fetch(`${baseUrl}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const cartResult = await getCartResponse.json();
        console.log('Status:', getCartResponse.status);
        const cartItemId = cartResult.items?.[0]?.id;
        console.log('Cart Item ID:', cartItemId);

        console.log('\n--- 3. Create Order ---');
        const createOrderResponse = await fetch(`${baseUrl}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                shipping_address: { street: '123 Test St', city: 'Mumbai', state: 'Maharashtra', zip: '400001' },
                billing_address: { street: '123 Test St', city: 'Mumbai', state: 'Maharashtra', zip: '400001' },
                shipping_method_id: shippingMethodId
            })
        });
        const orderResult = await createOrderResponse.json();
        console.log('Status:', createOrderResponse.status);
        console.log('Response:', JSON.stringify(orderResult, null, 2));

        const orderId = orderResult.order?.id;

        if (orderId) {
            console.log('\n--- 4. Get Order ---');
            const getOrderResponse = await fetch(`${baseUrl}/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const getOrderResult = await getOrderResponse.json();
            console.log('Status:', getOrderResponse.status);
            console.log('Order Number:', getOrderResult.order_number);
        }

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verify();
