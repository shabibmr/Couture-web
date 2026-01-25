import Product from './src/modules/catalog/models/product.model.js';

async function checkProducts() {
    try {
        const products = await Product.findAll({
            attributes: ['id', 'name', 'slug', 'is_active'],
            limit: 10
        });
        console.log('--- DB Products ---');
        console.log(JSON.stringify(products, null, 2));
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

checkProducts();
