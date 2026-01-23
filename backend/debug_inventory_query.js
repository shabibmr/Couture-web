import sequelize from './src/config/database.js';
import Inventory from './src/modules/inventory/models/inventory.model.js';
import ProductVariant from './src/modules/catalog/models/product_variant.model.js';
import Product from './src/modules/catalog/models/product.model.js';
import Size from './src/modules/catalog/models/size.model.js';
import Color from './src/modules/catalog/models/color.model.js';

const checkInventoryQuery = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        console.log('Running Controller Query...');
        const inventory = await Inventory.findAll({
            include: [
                {
                    model: ProductVariant,
                    include: [
                        { model: Product, attributes: ['name', 'slug'] },
                        { model: Size, attributes: ['name', 'code'] },
                        { model: Color, attributes: ['name', 'hex_code'] }
                    ]
                }
            ],
            // EXACT order clause from controller
            order: [[ProductVariant, Product, 'name', 'ASC']]
        });

        console.log(`Query Successful. Records: ${inventory.length}`);
    } catch (error) {
        console.error('Query Failed!');
        console.error(error);
    } finally {
        await sequelize.close();
    }
};

checkInventoryQuery();
