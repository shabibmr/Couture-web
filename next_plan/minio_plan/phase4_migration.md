# Phase 4: Data Migration & Cleanup

## Overview
Migrate existing images to MinIO and implement cleanup logic to prevent orphaned files. This phase handles legacy data and ensures proper lifecycle management of uploaded images.

## Prerequisites
- ✅ Phase 1, 2, 3 complete (Full stack MinIO integration working)
- ✅ Database contains products/banners (some may have base64 images or invalid URLs)
- ✅ MinIO service is running and accessible

## Current State Analysis

### Potential Legacy Data Issues
1. **Base64 Images**: Some products may still have base64-encoded images in database
2. **Invalid URLs**: Broken or malformed image URLs from previous implementations
3. **Orphaned Files**: Images uploaded to MinIO but no longer referenced in database
4. **Missing Cleanup**: Deleted products don't remove MinIO files

---

## Implementation Steps

### Step 4.1: Create Migration Script

**File**: `backend/scripts/migrate_images_to_minio.ts` (NEW)

```typescript
import { sequelize } from '../src/config/database';
import Product from '../src/modules/catalog/models/product.model.js';
import ProductImage from '../src/modules/catalog/models/product_image.model.js';
import Banner from '../src/modules/cms/models/banner.model.js';
import { minioService } from '../src/services/minio.service';

interface MigrationStats {
    productsProcessed: number;
    productImagesMigrated: number;
    bannersProcessed: number;
    bannerImagesMigrated: number;
    errors: string[];
}

const stats: MigrationStats = {
    productsProcessed: 0,
    productImagesMigrated: 0,
    bannersProcessed: 0,
    bannerImagesMigrated: 0,
    errors: [],
};

/**
 * Check if a string is base64 data
 */
function isBase64Image(str: string): boolean {
    if (!str) return false;
    return str.startsWith('data:image/');
}

/**
 * Convert base64 to Buffer
 */
function base64ToBuffer(base64String: string): { buffer: Buffer; mimeType: string } {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 string');
    }
    const mimeType = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    return { buffer, mimeType };
}

/**
 * Migrate product featured images
 */
async function migrateProductFeaturedImages() {
    console.log('\n--- Migrating Product Featured Images ---');
    
    const products = await Product.findAll({
        where: {
            featured_image: { [Op.not]: null },
        },
    });

    console.log(`Found ${products.length} products with featured images`);

    for (const product of products) {
        try {
            stats.productsProcessed++;
            const featuredImage = product.featured_image;

            // Skip if already a MinIO URL
            if (featuredImage.startsWith('http://') || featuredImage.startsWith('https://')) {
                const minioEndpoint = process.env.MINIO_ENDPOINT || 'localhost';
                if (featuredImage.includes(minioEndpoint)) {
                    console.log(`  ✓ Product ${product.id} already has MinIO URL, skipping`);
                    continue;
                }
            }

            // Check if base64
            if (isBase64Image(featuredImage)) {
                console.log(`  → Migrating product ${product.id} - ${product.name}`);
                
                const { buffer, mimeType } = base64ToBuffer(featuredImage);
                const extension = mimeType.split('/')[1];
                const fileName = `uploads/product-${product.id}-${Date.now()}.${extension}`;
                
                const minioUrl = await minioService.uploadFile(buffer, fileName, mimeType);
                
                await product.update({ featured_image: minioUrl });
                stats.productImagesMigrated++;
                console.log(`  ✓ Migrated to: ${minioUrl}`);
            } else {
                console.log(`  ! Product ${product.id} has unknown image format: ${featuredImage.substring(0, 50)}...`);
                stats.errors.push(`Product ${product.id}: Unknown image format`);
            }

        } catch (error: any) {
            console.error(`  ✗ Error migrating product ${product.id}:`, error.message);
            stats.errors.push(`Product ${product.id}: ${error.message}`);
        }
    }
}

/**
 * Migrate product additional images
 */
async function migrateProductAdditionalImages() {
    console.log('\n--- Migrating Product Additional Images ---');
    
    const productImages = await ProductImage.findAll();
    console.log(`Found ${productImages.length} additional product images`);

    for (const image of productImages) {
        try {
            const imageUrl = image.image_url;

            // Skip if already MinIO URL
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                const minioEndpoint = process.env.MINIO_ENDPOINT || 'localhost';
                if (imageUrl.includes(minioEndpoint)) {
                    continue;
                }
            }

            // Check if base64
            if (isBase64Image(imageUrl)) {
                console.log(`  → Migrating product image ${image.id}`);
                
                const { buffer, mimeType } = base64ToBuffer(imageUrl);
                const extension = mimeType.split('/')[1];
                const fileName = `uploads/product-img-${image.id}-${Date.now()}.${extension}`;
                
                const minioUrl = await minioService.uploadFile(buffer, fileName, mimeType);
                
                await image.update({ image_url: minioUrl });
                stats.productImagesMigrated++;
                console.log(`  ✓ Migrated to: ${minioUrl}`);
            }

        } catch (error: any) {
            console.error(`  ✗ Error migrating product image ${image.id}:`, error.message);
            stats.errors.push(`ProductImage ${image.id}: ${error.message}`);
        }
    }
}

/**
 * Migrate banner images
 */
async function migrateBannerImages() {
    console.log('\n--- Migrating Banner Images ---');
    
    const banners = await Banner.findAll({
        where: {
            image_url: { [Op.not]: null },
        },
    });

    console.log(`Found ${banners.length} banners with images`);

    for (const banner of banners) {
        try {
            stats.bannersProcessed++;
            const imageUrl = banner.image_url;

            // Skip if already MinIO URL
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                const minioEndpoint = process.env.MINIO_ENDPOINT || 'localhost';
                if (imageUrl.includes(minioEndpoint)) {
                    continue;
                }
            }

            // Check if base64
            if (isBase64Image(imageUrl)) {
                console.log(`  → Migrating banner ${banner.id}`);
                
                const { buffer, mimeType } = base64ToBuffer(imageUrl);
                const extension = mimeType.split('/')[1];
                const fileName = `uploads/banner-${banner.id}-${Date.now()}.${extension}`;
                
                const minioUrl = await minioService.uploadFile(buffer, fileName, mimeType);
                
                await banner.update({ image_url: minioUrl });
                stats.bannerImagesMigrated++;
                console.log(`  ✓ Migrated to: ${minioUrl}`);
            }

        } catch (error: any) {
            console.error(`  ✗ Error migrating banner ${banner.id}:`, error.message);
            stats.errors.push(`Banner ${banner.id}: ${error.message}`);
        }
    }
}

/**
 * Main migration function
 */
async function runMigration() {
    console.log('=== Starting Image Migration to MinIO ===\n');

    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        await migrateProductFeaturedImages();
        await migrateProductAdditionalImages();
        await migrateBannerImages();

        console.log('\n=== Migration Complete ===');
        console.log(`Products processed: ${stats.productsProcessed}`);
        console.log(`Product images migrated: ${stats.productImagesMigrated}`);
        console.log(`Banners processed: ${stats.bannersProcessed}`);
        console.log(`Banner images migrated: ${stats.bannerImagesMigrated}`);
        console.log(`Errors: ${stats.errors.length}`);

        if (stats.errors.length > 0) {
            console.log('\nErrors:');
            stats.errors.forEach(err => console.log(`  - ${err}`));
        }

        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
runMigration();
```

---

### Step 4.2: Add Cleanup Logic to Product Controller

**File**: `backend/src/modules/catalog/product.controller.js` (MODIFY)

**Import MinIO service** (at top):
```javascript
import { minioService } from '../../services/minio.service.js';
```

**Helper function** (add after imports):
```javascript
/**
 * Extract filename from MinIO URL
 * Example: http://localhost:9000/ruvera-assets/uploads/123-image.jpg -> uploads/123-image.jpg
 */
function extractMinioFileName(url) {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        const bucketName = process.env.MINIO_BUCKET_NAME || 'ruvera-assets';
        const pathParts = urlObj.pathname.split(`/${bucketName}/`);
        return pathParts[1] || null; // Returns "uploads/123-image.jpg"
    } catch (error) {
        return null;
    }
}
```

**Update `deleteProduct`** (add cleanup before destroying):
```javascript
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id, {
            include: [{ model: ProductImage, as: 'images' }]
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // --- ADD THIS: Delete MinIO files ---
        try {
            // Delete featured image
            if (product.featured_image) {
                const fileName = extractMinioFileName(product.featured_image);
                if (fileName) {
                    await minioService.deleteFile(fileName);
                    console.log(`Deleted MinIO file: ${fileName}`);
                }
            }

            // Delete additional images
            if (product.images && product.images.length > 0) {
                for (const image of product.images) {
                    const fileName = extractMinioFileName(image.image_url);
                    if (fileName) {
                        await minioService.deleteFile(fileName);
                        console.log(`Deleted MinIO file: ${fileName}`);
                    }
                }
            }
        } catch (minioError) {
            console.error('MinIO cleanup error:', minioError);
            // Don't fail the delete operation if MinIO cleanup fails
        }
        // --- END ADD ---

        // Delete associated images from database
        await ProductImage.destroy({ where: { product_id: id } });

        // Delete the product
        await product.destroy();

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
```

**Update `updateProduct`** (cleanup old images when replaced):
```javascript
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { mainImage, additionalImages, sizes, ...productData } = req.body;

        const product = await Product.findByPk(id, {
            include: [{ model: ProductImage, as: 'images' }]
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // --- ADD THIS: Cleanup old featured image if replaced ---
        if (mainImage !== undefined && mainImage !== product.featured_image) {
            try {
                const oldFileName = extractMinioFileName(product.featured_image);
                if (oldFileName) {
                    await minioService.deleteFile(oldFileName);
                    console.log(`Deleted old featured image: ${oldFileName}`);
                }
            } catch (minioError) {
                console.error('Failed to delete old featured image:', minioError);
            }
        }
        // --- END ADD ---

        // Update product fields
        await product.update({
            ...productData,
            featured_image: mainImage !== undefined ? mainImage : product.featured_image,
            slug: productData.name ? productData.name.toLowerCase().replace(/\s+/g, '-') : product.slug
        });

        // Handle additional images update
        if (additionalImages && Array.isArray(additionalImages)) {
            // --- ADD THIS: Cleanup old additional images ---
            try {
                const oldImages = product.images || [];
                for (const oldImage of oldImages) {
                    const oldFileName = extractMinioFileName(oldImage.image_url);
                    if (oldFileName) {
                        await minioService.deleteFile(oldFileName);
                        console.log(`Deleted old additional image: ${oldFileName}`);
                    }
                }
            } catch (minioError) {
                console.error('Failed to delete old additional images:', minioError);
            }
            // --- END ADD ---

            // Delete existing additional images from database
            await ProductImage.destroy({ where: { product_id: id } });

            // Create new additional images
            const imagePromises = additionalImages
                .filter(img => img && img.trim() !== '')
                .map((imageUrl, index) =>
                    ProductImage.create({
                        product_id: id,
                        image_url: imageUrl,
                        sort_order: index + 1
                    })
                );

            await Promise.all(imagePromises);
        }

        // ... rest of update logic (sizes, etc.)

        const updatedProduct = await Product.findByPk(id, {
            include: [{ model: ProductImage, as: 'images' }]
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
```

---

### Step 4.3: Add Orphaned File Cleanup Script (Optional)

**File**: `backend/scripts/cleanup_orphaned_minio_files.ts` (NEW)

```typescript
import { minioService } from '../src/services/minio.service';
import Product from '../src/modules/catalog/models/product.model.js';
import ProductImage from '../src/modules/catalog/models/product_image.model.js';
import Banner from '../src/modules/cms/models/banner.model.js';

/**
 * Find all MinIO files that are not referenced in database
 * WARNING: This is a destructive operation. Use with caution.
 */
async function findOrphanedFiles() {
    console.log('=== Scanning for Orphaned MinIO Files ===\n');

    // Get all files from MinIO
    const bucketName = process.env.MINIO_BUCKET_NAME || 'ruvera-assets';
    const stream = minioService.getClient().listObjects(bucketName, 'uploads/', true);
    
    const minioFiles: string[] = [];
    
    return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
            minioFiles.push(obj.name);
        });

        stream.on('end', async () => {
            console.log(`Found ${minioFiles.length} files in MinIO\n`);

            // Get all image URLs from database
            const products = await Product.findAll({ attributes: ['featured_image'] });
            const productImages = await ProductImage.findAll({ attributes: ['image_url'] });
            const banners = await Banner.findAll({ attributes: ['image_url'] });

            const dbUrls = new Set<string>();
            
            products.forEach(p => {
                if (p.featured_image) {
                    const fileName = p.featured_image.split('/ruvera-assets/')[1];
                    if (fileName) dbUrls.add(fileName);
                }
            });

            productImages.forEach(img => {
                if (img.image_url) {
                    const fileName = img.image_url.split('/ruvera-assets/')[1];
                    if (fileName) dbUrls.add(fileName);
                }
            });

            banners.forEach(b => {
                if (b.image_url) {
                    const fileName = b.image_url.split('/ruvera-assets/')[1];
                    if (fileName) dbUrls.add(fileName);
                }
            });

            console.log(`Found ${dbUrls.size} image references in database\n`);

            // Find orphans
            const orphans = minioFiles.filter(file => !dbUrls.has(file));

            if (orphans.length === 0) {
                console.log('✓ No orphaned files found!');
            } else {
                console.log(`⚠️  Found ${orphans.length} orphaned files:\n`);
                orphans.forEach(file => console.log(`  - ${file}`));
                console.log('\nRun with --delete flag to remove these files.');
            }

            resolve(orphans);
        });

        stream.on('error', reject);
    });
}

// Run cleanup
findOrphanedFiles().catch(console.error);
```

---

## Testing

### Step 4.4: Run Migration Script

```bash
cd backend

# Compile TypeScript
npx tsc scripts/migrate_images_to_minio.ts --outDir dist/scripts --module commonjs --esModuleInterop

# Run migration
node dist/scripts/migrate_images_to_minio.js
```

**Expected Output**:
```
=== Starting Image Migration to MinIO ===

✓ Database connected

--- Migrating Product Featured Images ---
Found 15 products with featured images
  → Migrating product 1 - Classic T-Shirt
  ✓ Migrated to: http://localhost:9000/ruvera-assets/uploads/product-1-1738542123456.jpg
  ✓ Product 2 already has MinIO URL, skipping
  ...

--- Migrating Product Additional Images ---
Found 42 additional product images
  → Migrating product image 5
  ✓ Migrated to: http://localhost:9000/ruvera-assets/uploads/product-img-5-1738542987654.jpg
  ...

--- Migrating Banner Images ---
Found 3 banners with images
  → Migrating banner 1
  ✓ Migrated to: http://localhost:9000/ruvera-assets/uploads/banner-1-1738543001234.jpg

=== Migration Complete ===
Products processed: 15
Product images migrated: 12
Banners processed: 3
Banner images migrated: 2
Errors: 0
```

---

### Step 4.5: Verify Migration in Database

```bash
# Connect to MySQL
mysql -u root -p

USE couture_db;

# Check products have MinIO URLs
SELECT id, name, featured_image FROM products LIMIT 5;

# Check banners have MinIO URLs
SELECT id, title, image_url FROM banners;
```

**Expected**:
- All `featured_image` and `image_url` fields should contain MinIO URLs
- No base64 strings should remain

---

### Step 4.6: Test Cleanup on Product Delete

1. **Create Test Product** (via Admin Panel):
   - Upload image via admin panel
   - Note the MinIO URL (e.g., `http://localhost:9000/ruvera-assets/uploads/12345-test.jpg`)
   - Copy the filename: `uploads/12345-test.jpg`

2. **Verify File in MinIO**:
   - Open MinIO Console: http://localhost:9001
   - Navigate to `ruvera-assets` → `uploads/`
   - Confirm file exists

3. **Delete Product**:
   - In admin panel, delete the test product
   - Check backend logs for: `Deleted MinIO file: uploads/12345-test.jpg`

4. **Verify File Removed**:
   - Refresh MinIO Console
   - Confirm file no longer exists in bucket

---

## Verification Checklist

- [ ] Migration script created and compiles without errors
- [ ] Migration script successfully migrates base64 images
- [ ] All products have MinIO URLs after migration
- [ ] All banners have MinIO URLs after migration
- [ ] Product deletion removes MinIO files
- [ ] Product update removes old MinIO files when replaced
- [ ] MinIO console shows files are actually deleted
- [ ] No errors in backend logs during cleanup operations

---

## Rollback Strategy

If migration fails or you need to revert:

1. **Database Backup**:
   ```bash
   mysqldump -u root -p couture_db > backup_before_migration.sql
   ```

2. **Restore Backup**:
   ```bash
   mysql -u root -p couture_db < backup_before_migration.sql
   ```

3. **Clear MinIO Bucket** (if needed):
   ```bash
   docker exec ruvera-minio mc rm --recursive --force myminio/ruvera-assets/uploads/
   ```

---

## Production Considerations

### Before Running Migration in Production

1. **Create Full Database Backup**
2. **Test Migration on Staging Environment First**
3. **Run Migration During Low-Traffic Window**
4. **Monitor Disk Space on MinIO Server**
5. **Have Rollback Plan Ready**

### Monitoring After Migration

- Check application error logs for 404 image errors
- Monitor MinIO storage usage
- Verify all pages load images correctly
- Run orphaned file cleanup periodically (e.g., monthly cron job)

---

## Next Steps

After completing Phase 4:
- **✅ Full MinIO Integration Complete!**
- Consider implementing:
  - Image CDN for faster global delivery
  - Automated backups of MinIO data volume
  - Image optimization pipeline (compress, resize)
  - Variant image support (thumbnails, full-size)
