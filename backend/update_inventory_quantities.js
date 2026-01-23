import sequelize from './src/config/database.js';
import Inventory from './src/modules/inventory/models/inventory.model.js';

const updateInventoryQuantities = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        // Update all inventory records with quantity 0 to quantity 1
        const [updatedCount] = await Inventory.update(
            { quantity: 1 },
            { where: { quantity: 0 } }
        );

        console.log(`Updated ${updatedCount} inventory records from quantity 0 to 1`);

        // Show sample of updated records
        const updatedItems = await Inventory.findAll({
            where: { quantity: 1 },
            limit: 5
        });

        console.log('\nSample updated inventory:');
        updatedItems.forEach(item => {
            console.log(`  - Variant ID: ${item.variant_id}, Quantity: ${item.quantity}`);
        });

    } catch (error) {
        console.error('Error updating inventory:', error);
    } finally {
        await sequelize.close();
    }
};

updateInventoryQuantities();
