import Inventory from './models/inventory.model.js';
import ProductVariant from '../catalog/models/product_variant.model.js';
import Product from '../catalog/models/product.model.js';
import Size from '../catalog/models/size.model.js';
import Color from '../catalog/models/color.model.js';

export const getInventory = async (req, res) => {
    try {
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
            order: [[ProductVariant, Product, 'name', 'ASC']]
        });
        res.json(inventory);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateStock = async (req, res) => {
    try {
        const { variant_id, quantity, low_stock_threshold } = req.body;

        const inventory = await Inventory.findOne({ where: { variant_id } });

        if (!inventory) {
            return res.status(404).json({ message: 'Inventory record not found' });
        }

        if (quantity !== undefined) {
            if (quantity < 0) {
                return res.status(400).json({ message: 'Quantity cannot be negative' });
            }
            inventory.quantity = quantity;
        }
        if (low_stock_threshold !== undefined) inventory.low_stock_threshold = low_stock_threshold;
        inventory.last_updated = new Date();

        await inventory.save();

        res.json({ message: 'Stock updated successfully', inventory });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getLowStock = async (req, res) => {
    try {
        // Find items where quantity <= low_stock_threshold
        // Note: Sequelize where clause needed might vary based on DB, using simple filter for MVP or raw query if needed
        const lowStockItems = await Inventory.findAll({
            include: [
                {
                    model: ProductVariant,
                    include: [
                        { model: Product, attributes: ['name'] }
                    ]
                }
            ]
        });

        // Filtering in JS for simplicity as Sequelize literal comparison can be complex across DBs
        const filtered = lowStockItems.filter(item => item.quantity <= item.low_stock_threshold);

        res.json(filtered);
    } catch (error) {
        console.error('Error fetching low stock:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
