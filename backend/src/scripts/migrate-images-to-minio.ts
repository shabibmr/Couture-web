import sequelize from '../config/database.js';
import Product from '../modules/catalog/models/product.model.js';
import ProductImage from '../modules/catalog/models/product_image.model.js';
import minioClient, { BUCKETS, MINIO_PUBLIC_URL, ensureBucket } from '../config/minio.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Migration Script: Convert Base64 Images to MinIO URLs
 * 
 * This script:
 * 1. Finds all products with base64-encoded images
 * 2. Decodes the base64 images
 * 3. Uploads them to MinIO
 * 4. Updates the database with MinIO URLs
 */

interface MigrationStats {
    totalProducts: number;
    productsProcessed: number;
    featuredImagesMigrated: number;
    additionalImagesMigrated: number;
    errors: string[];
}

/**
 * Check if a string is base64 encoded
 */
function isBase64(str: string): boolean {
    if (!str || typeof str !== 'string') return false;

    // Base64 images usually start with data:image/
    if (str.startsWith('data:image/')) return true;

    // Check if it looks like a URL
    if (str.startsWith('http://') || str.startsWith('https://')) return false;

    // Check if it's a very long string (base64 images are typically very long)
    if (str.length > 1000) return true;

    return false;
}

/**
 * Extract image data from base64 string
 */
function extractBase64Data(base64String: string): { buffer: Buffer; mimeType: string; extension: string } | null {
    try {
        let data = base64String;
        let mimeType = 'image/jpeg';

        // Handle data URI format (data:image/png;base64,...)
        if (base64String.startsWith('data:')) {
            const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
                mimeType = matches[1];
                data = matches[2];
            } else {
                console.warn('Invalid data URI format');
                return null;
            }
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(data, 'base64');

        // Determine file extension from MIME type
        const extension = mimeType.split('/')[1] || 'jpg';

        return { buffer, mimeType, extension };
    } catch (error) {
        console.error('Error extracting base64 data:', error);
        return null;
    }
}

/**
 * Upload base64 image to MinIO
 */
async function uploadBase64ToMinio(
    base64String: string,
    bucket: string,
    folder: string
): Promise<string | null> {
    try {
        // Ensure bucket exists
        await ensureBucket(bucket);

        // Extract image data
        const imageData = extractBase64Data(base64String);
        if (!imageData) {
            console.error('Failed to extract image data');
            return null;
        }

        // Generate unique filename
        const objectName = `${folder}/${uuidv4()}.${imageData.extension}`;

        // Upload to MinIO
        await minioClient.putObject(
            bucket,
            objectName,
            imageData.buffer,
            imageData.buffer.length,
            {
                'Content-Type': imageData.mimeType,
            }
        );

        // Generate public URL
        const url = `${MINIO_PUBLIC_URL}/${bucket}/${objectName}`;
        console.log(`✓ Uploaded to: ${url}`);

        return url;
    } catch (error) {
        console.error('Error uploading to MinIO:', error);
        return null;
    }
}

/**
 * Migrate a single product's images
 */
async function migrateProduct(product: any, stats: MigrationStats): Promise<void> {
    console.log(`\n--- Processing Product: ${product.name} (${product.id}) ---`);

    // Migrate featured image
    if (product.featured_image && isBase64(product.featured_image)) {
        console.log('Migrating featured image...');
        const url = await uploadBase64ToMinio(
            product.featured_image,
            BUCKETS.PRODUCTS,
            'main'
        );

        if (url) {
            await product.update({ featured_image: url });
            stats.featuredImagesMigrated++;
            console.log(`✓ Updated featured_image to: ${url}`);
        } else {
            stats.errors.push(`Failed to migrate featured image for product ${product.id}`);
        }
    } else if (product.featured_image) {
        console.log(`Featured image already a URL: ${product.featured_image.substring(0, 50)}...`);
    }

    // Migrate additional images
    const additionalImages = await ProductImage.findAll({
        where: { product_id: product.id }
    });

    for (const image of additionalImages) {
        if (isBase64(image.image_url)) {
            console.log(`Migrating additional image ${image.id}...`);
            const url = await uploadBase64ToMinio(
                image.image_url,
                BUCKETS.PRODUCTS,
                'additional'
            );

            if (url) {
                await image.update({ image_url: url });
                stats.additionalImagesMigrated++;
                console.log(`✓ Updated image to: ${url}`);
            } else {
                stats.errors.push(`Failed to migrate additional image ${image.id} for product ${product.id}`);
            }
        } else {
            console.log(`Additional image ${image.id} already a URL: ${image.image_url.substring(0, 50)}...`);
        }
    }

    stats.productsProcessed++;
}

/**
 * Main migration function
 */
async function migrateImagesToMinio(): Promise<void> {
    console.log('=== Base64 to MinIO Image Migration ===\n');

    const stats: MigrationStats = {
        totalProducts: 0,
        productsProcessed: 0,
        featuredImagesMigrated: 0,
        additionalImagesMigrated: 0,
        errors: []
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
                await migrateProduct(product, stats);
            } catch (error) {
                console.error(`Error processing product ${product.id}:`, error);
                stats.errors.push(`Error processing product ${product.id}: ${error}`);
            }
        }

        // Print summary
        console.log('\n=== Migration Summary ===');
        console.log(`Total Products: ${stats.totalProducts}`);
        console.log(`Products Processed: ${stats.productsProcessed}`);
        console.log(`Featured Images Migrated: ${stats.featuredImagesMigrated}`);
        console.log(`Additional Images Migrated: ${stats.additionalImagesMigrated}`);
        console.log(`Total Images Migrated: ${stats.featuredImagesMigrated + stats.additionalImagesMigrated}`);

        if (stats.errors.length > 0) {
            console.log(`\n⚠️  Errors (${stats.errors.length}):`);
            stats.errors.forEach((error, i) => {
                console.log(`${i + 1}. ${error}`);
            });
        } else {
            console.log('\n✅ Migration completed successfully with no errors!');
        }

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
    migrateImagesToMinio()
        .then(() => {
            console.log('\n✓ Migration script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n✗ Migration failed:', error);
            process.exit(1);
        });
}

export default migrateImagesToMinio;
