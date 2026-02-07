import sequelize from '../config/database.js';
import Product from '../modules/catalog/models/product.model.js';
import ProductImage from '../modules/catalog/models/product_image.model.js';
import { extractObjectKey } from '../utils/minio-url.js';
import { BUCKETS } from '../config/minio.js';

/**
 * Migration Script: Convert MinIO URLs to Object Keys
 * 
 * This script converts full MinIO URLs to object keys in the database:
 * - FROM: "http://localhost:9000/products/main/uuid.webp"
 * - TO:   "main/uuid.webp"
 */

interface MigrationStats {
    totalProducts: number;
    productsProcessed: number;
    featuredImagesConverted: number;
    additionalImagesConverted: number;
    skipped: number;
}

/**
 * Convert a product's image URLs to object keys
 */
async function convertProduct(product: any, stats: MigrationStats): Promise<void> {
    console.log(`\n--- Processing Product: ${product.name} (${product.id}) ---`);

    let updated = false;

    // Convert featured_image
    if (product.featured_image) {
        const objectKey = extractObjectKey(product.featured_image, BUCKETS.PRODUCTS);

        if (objectKey !== product.featured_image) {
            console.log(`Converting featured_image:`);
            console.log(`  FROM: ${product.featured_image.substring(0, 60)}...`);
            console.log(`  TO:   ${objectKey}`);

            await product.update({ featured_image: objectKey });
            stats.featuredImagesConverted++;
            updated = true;
        } else {
            console.log(`Featured image already an object key: ${objectKey}`);
        }
    }

    // Convert additional images
    const additionalImages = await ProductImage.findAll({
        where: { product_id: product.id }
    });

    for (const image of additionalImages) {
        const objectKey = extractObjectKey(image.image_url, BUCKETS.PRODUCTS);

        if (objectKey !== image.image_url) {
            console.log(`Converting additional image ${image.id}:`);
            console.log(`  FROM: ${image.image_url.substring(0, 60)}...`);
            console.log(`  TO:   ${objectKey}`);

            await image.update({ image_url: objectKey });
            stats.additionalImagesConverted++;
            updated = true;
        }
    }

    if (updated) {
        stats.productsProcessed++;
    } else {
        stats.skipped++;
    }
}

/**
 * Main migration function
 */
async function convertUrlsToKeys(): Promise<void> {
    console.log('=== MinIO URL to Object Key Migration ===\n');

    const stats: MigrationStats = {
        totalProducts: 0,
        productsProcessed: 0,
        featuredImagesConverted: 0,
        additionalImagesConverted: 0,
        skipped: 0
    };

    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('✓ Database connected\n');

        // Get all products
        const products = await Product.findAll({
            order: [['created_at', 'DESC']]
        });

        stats.totalProducts = products.length;
        console.log(`Found ${stats.totalProducts} products\n`);

        // Process each product
        for (const product of products) {
            try {
                await convertProduct(product, stats);
            } catch (error) {
                console.error(`Error processing product ${product.id}:`, error);
            }
        }

        // Print summary
        console.log('\n=== Migration Summary ===');
        console.log(`Total Products: ${stats.totalProducts}`);
        console.log(`Products Updated: ${stats.productsProcessed}`);
        console.log(`Products Skipped (already object keys): ${stats.skipped}`);
        console.log(`Featured Images Converted: ${stats.featuredImagesConverted}`);
        console.log(`Additional Images Converted: ${stats.additionalImagesConverted}`);
        console.log(`Total Images Converted: ${stats.featuredImagesConverted + stats.additionalImagesConverted}`);

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('Fatal error during migration:', error);
        throw error;
    } finally {
        await sequelize.close();
        console.log('\n✓ Database connection closed');
    }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    convertUrlsToKeys()
        .then(() => {
            console.log('\n✓ Migration script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n✗ Migration failed:', error);
            process.exit(1);
        });
}

export default convertUrlsToKeys;
