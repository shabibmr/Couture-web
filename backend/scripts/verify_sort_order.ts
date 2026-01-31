import sequelize from '../src/config/database.js';
import Product from '../src/modules/catalog/models/product.model.js';
import Category from '../src/modules/catalog/models/category.model.js';

const verifySortOrder = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Create a dummy category if needed
        let category = await Category.findOne();
        if (!category) {
            category = await Category.create({ name: 'Test Cat', slug: 'test-cat', is_active: true });
        }

        // 2. Clean up old test data (optional, or just ignore)
        // await Product.destroy({ where: { name: ['Test A', 'Test B', 'Test C'] } });

        // 3. Create 3 products with specific sort_order
        // Using distinct names to avoid slug collision if possible, or random slugs
        const timestamp = Date.now();
        const p1 = await Product.create({
            name: `Test P1 ${timestamp}`,
            slug: `test-p1-${timestamp}`,
            category_id: category.id,
            base_price: 100,
            sort_order: 10,
            is_active: true
        });
        const p2 = await Product.create({
            name: `Test P2 ${timestamp}`,
            slug: `test-p2-${timestamp}`,
            category_id: category.id,
            base_price: 100,
            sort_order: 20, // Should be first
            is_active: true
        });
        const p3 = await Product.create({
            name: `Test P3 ${timestamp}`,
            slug: `test-p3-${timestamp}`,
            category_id: category.id,
            base_price: 100,
            sort_order: 5, // Should be last
            is_active: true
        });

        console.log(`Created products: P1(10), P2(20), P3(5)`);

        // 4. Query using the same logic as controller
        const products = await Product.findAll({
            where: {
                id: [p1.id, p2.id, p3.id]
            },
            order: [['sort_order', 'DESC'], ['created_at', 'DESC']]
        });

        const ids = products.map(p => p.id);
        console.log('Retrieved order:', products.map(p => `${p.name} (${p.sort_order})`));

        // Expected: P2, P1, P3
        if (ids[0] === p2.id && ids[1] === p1.id && ids[2] === p3.id) {
            console.log('✅ Verification SUCCEEDED: Products sorted by sort_order DESC.');
        } else {
            console.error('❌ Verification FAILED: Incorrect order.');
            process.exit(1);
        }

        // Cleanup
        await p1.destroy();
        await p2.destroy();
        await p3.destroy();

        process.exit(0);

    } catch (error) {
        console.error('Verification Error:', error);
        process.exit(1);
    }
};

verifySortOrder();
