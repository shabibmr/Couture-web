import axios from 'axios';

const testInventoryAPI = async () => {
    try {
        console.log('1. Logging in...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'user',
            password: '123456'
        });

        const token = loginResponse.data.token;
        console.log('✓ Login successful, token received');

        console.log('\n2. Fetching inventory...');
        const inventoryResponse = await axios.get('http://localhost:5000/api/inventory', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`✓ Inventory API responded with ${inventoryResponse.data.length} items\n`);

        console.log('Inventory Data:');
        inventoryResponse.data.forEach((item, index) => {
            console.log(`\n[${index + 1}] ID: ${item.id}`);
            console.log(`    Product: ${item.ProductVariant?.Product?.name}`);
            console.log(`    Size: ${item.ProductVariant?.Size?.name}`);
            console.log(`    SKU: ${item.ProductVariant?.sku}`);
            console.log(`    Quantity: ${item.quantity}`);
            console.log(`    Low Stock Threshold: ${item.low_stock_threshold}`);
        });

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
    }
};

testInventoryAPI();
