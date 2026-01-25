import sequelize from './src/config/database.js';

async function fetchIds() {
    try {
        const [customers] = await sequelize.query('SELECT id, email FROM customers LIMIT 1');
        const [variants] = await sequelize.query('SELECT id, sku FROM product_variants LIMIT 1');
        const [shippingMethods] = await sequelize.query('SELECT id, name FROM shipping_methods LIMIT 1');
        const [orders] = await sequelize.query('SELECT id FROM orders LIMIT 1');

        console.log('Customer:', customers[0]);
        console.log('Variant:', variants[0]);
        console.log('Shipping Method:', shippingMethods[0]);
        console.log('Order:', orders[0]);

        process.exit(0);
    } catch (error) {
        console.error('Error fetching IDs:', error);
        process.exit(1);
    }
}

fetchIds();
