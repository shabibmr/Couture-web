
import Product from './modules/catalog/models/product.model.js';
import sequelize from './config/database.js';

async function checkHomeProducts() {
    try {
        await sequelize.authenticate();
        const products = await Product.findAll({
            where: { is_active: true },
            limit: 8,
            order: [['created_at', 'DESC']],
            attributes: ['id', 'name', 'base_price', 'sale_price']
        });

        console.log(`Found ${products.length} products on Home Page:`);
        products.forEach((p: any, index) => {
            console.log(`${index + 1}. ${p.name} (Price: ${p.sale_price || p.base_price})`);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    } finally {
        await sequelize.close();
    }
}

checkHomeProducts();
