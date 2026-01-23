import sequelize from './src/config/database.js';
import Inventory from './src/modules/inventory/models/inventory.model.js';
import ProductVariant from './src/modules/catalog/models/product_variant.model.js';
import Product from './src/modules/catalog/models/product.model.js';
import Size from './src/modules/catalog/models/size.model.js';

// Initialize models/associations (simplified for debug, might need proper init if models rely on it)
// Assuming models function correctly when imported if they define associations internally or via a central init.
// Based on file names, associations might be defined in the model files or a central file.
// Let's rely on standard sequelize import side-effects or explicit definitions if needed.

const checkInventory = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const inventoryCount = await Inventory.count();
        console.log(`Total Inventory Records: ${inventoryCount}`);

        if (inventoryCount > 0) {
            const items = await Inventory.findAll({
                limit: 5,
                include: [{
                    model: ProductVariant,
                    include: [
                        { model: Product, attributes: ['name'] },
                        { model: Size, attributes: ['name'] }
                    ]
                }]
            });
            console.log('Sample Inventory Items:', JSON.stringify(items, null, 2));
        } else {
            console.log('No inventory records found. Checking Product Variants...');
            const variantCount = await ProductVariant.count();
            console.log(`Total Product Variants: ${variantCount}`);

            if (variantCount > 0) {
                const variants = await ProductVariant.findAll({ limit: 5 });
                console.log('Sample Variants:', JSON.stringify(variants, null, 2));
            } else {
                console.log('No Product Variants found via Sequelize. Checking Products...');
                const productCount = await Product.count();
                console.log(`Total Products: ${productCount}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

checkInventory();
