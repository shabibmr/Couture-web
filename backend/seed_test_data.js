import sequelize from './src/config/database.ts';
import { randomUUID } from 'crypto';

async function seedData() {
    try {
        console.log('Seeding test data...');

        // 1. Create a Category if not exists
        const categorySlug = 'test-category';
        await sequelize.query(`
            INSERT IGNORE INTO categories (id, name, slug) 
            VALUES ('${randomUUID()}', 'Test Category', '${categorySlug}')
        `);
        const [[category]] = await sequelize.query(`SELECT id FROM categories WHERE slug = '${categorySlug}'`);
        const categoryId = category.id;

        // 2. Create a Product
        const productSlug = 'test-product';
        await sequelize.query(`
            INSERT IGNORE INTO products (id, name, slug, description, base_price, category_id, is_active)
            VALUES ('${randomUUID()}', 'Test Product', '${productSlug}', 'Description', 1000.00, '${categoryId}', 1)
        `);
        const [[product]] = await sequelize.query(`SELECT id FROM products WHERE slug = '${productSlug}'`);
        const productId = product.id;

        // 3. Create a Variant
        const sku = 'TEST-SKU-001';
        await sequelize.query(`
            INSERT IGNORE INTO product_variants (id, product_id, sku, variant_price)
            VALUES ('${randomUUID()}', '${productId}', '${sku}', 1200.00)
        `);
        const [[variant]] = await sequelize.query(`SELECT id FROM product_variants WHERE sku = '${sku}'`);
        const variantId = variant.id;

        // 4. Create Inventory record
        await sequelize.query(`
            INSERT IGNORE INTO inventory (id, variant_id, quantity, reserved_quantity)
            VALUES ('${randomUUID()}', '${variantId}', 100, 0)
        `);

        // 5. Create Shipping Method
        const shipCode = 'std_del';
        await sequelize.query(`
            INSERT IGNORE INTO shipping_methods (id, name, code, base_rate, rate_type, is_active)
            VALUES ('${randomUUID()}', 'Standard Delivery', '${shipCode}', 50.00, 'flat', 1)
        `);
        const [[shipMethod]] = await sequelize.query(`SELECT id FROM shipping_methods WHERE code = '${shipCode}'`);
        const shippingMethodId = shipMethod.id;

        console.log('Seed successful or records already exist!');
        console.log({
            categoryId,
            productId,
            variantId,
            shippingMethodId
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
