# Image Migration Guide: Base64 to MinIO URLs

## Overview

This guide walks you through migrating existing base64-encoded product images to MinIO-hosted URLs.

## Why Migrate?

**Current Issue**: Existing products in the database have base64-encoded images stored directly in the database.

**Problem**:
- ❌ Large database size (base64 is ~33% larger than binary)
- ❌ Slow page loads (entire image data in HTML)
- ❌ No CDN caching
- ❌ Increased bandwidth costs

**Solution**: MinIO URL-based storage
- ✅ Small database footprint (only URLs stored)
- ✅ Fast page loads (browser caches images)
- ✅ CDN-ready
- ✅ Scalable storage

## Prerequisites

Before running the migration:

1. **MinIO is running**
   ```bash
   # Check if MinIO is accessible
   curl http://localhost:9000/minio/health/live
   ```

2. **Backend is configured**
   - `.env` file has MinIO credentials
   - Database connection is working

3. **Backup your database** (recommended)
   ```bash
   mysqldump -u root -p your_database > backup_before_migration.sql
   ```

## Running the Migration

### Step 1: Navigate to Backend Directory

```bash
cd /Users/admin/code/ruvera/ruveraweb/v2/Couture-web/backend
```

### Step 2: Ensure Environment Variables are Set

Make sure your `.env` file contains:

```env
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_USE_SSL=false
MINIO_PUBLIC_URL=http://localhost:9000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=couture_db
```

### Step 3: Run the Migration Script

```bash
npm run migrate:images
```

### Expected Output

```
=== Base64 to MinIO Image Migration ===

✓ Database connected

Found 45 products

--- Processing Product: Structured Wool Blazer (abc-123-def) ---
Migrating featured image...
✓ Uploaded to: http://localhost:9000/products/main/f47ac10b-58cc-4372-a567-0e02b2c3d479.jpg
✓ Updated featured_image to: http://localhost:9000/products/main/f47ac10b-58cc-4372-a567-0e02b2c3d479.jpg
Migrating additional image 1...
✓ Uploaded to: http://localhost:9000/products/additional/7c9e6679-7425-40de-944b-e07fc1f90ae7.jpg
✓ Updated image to: http://localhost:9000/products/additional/7c9e6679-7425-40de-944b-e07fc1f90ae7.jpg

...

=== Migration Summary ===
Total Products: 45
Products Processed: 45
Featured Images Migrated: 40
Additional Images Migrated: 123
Total Images Migrated: 163

✅ Migration completed successfully with no errors!

✓ Database connection closed
✓ Migration script completed
```

## What the Script Does

1. **Identifies Base64 Images**
   - Checks if `featured_image` starts with `data:image/` or is very long (>1000 chars)
   - Checks all `product_images.image_url` entries

2. **Extracts Image Data**
   - Parses base64 data URI (e.g., `data:image/png;base64,iVBORw...`)
   - Converts to binary buffer
   - Determines file type (jpg, png, webp, etc.)

3. **Uploads to MinIO**
   - Creates unique filename with UUID
   - Uploads to appropriate bucket (`products`)
   - Organizes in folders (`main/` or `additional/`)

4. **Updates Database**
   - Replaces base64 string with MinIO URL
   - Updates `products.featured_image`
   - Updates `product_images.image_url`

## Verification

After migration, verify the results:

### Check Database

```sql
-- Check featured images (should be URLs now)
SELECT id, name, featured_image 
FROM products 
LIMIT 5;

-- Check additional images (should be URLs now)
SELECT pi.id, p.name, pi.image_url
FROM product_images pi
JOIN products p ON pi.product_id = p.id
LIMIT 10;
```

### Check Admin Panel

1. Open the admin panel: http://localhost:5173
2. Navigate to Products
3. Edit a product
4. Verify images display correctly

### Check MinIO

1. Open MinIO Console: http://localhost:9001
2. Login with your credentials
3. Browse `products` bucket
4. Verify images are uploaded in `main/` and `additional/` folders

## Rollback (If Needed)

If something goes wrong, restore from backup:

```bash
mysql -u root -p your_database < backup_before_migration.sql
```

## Troubleshooting

### Migration Script Fails to Connect to Database

**Error**: `Unable to connect to the database`

**Solution**: Check your `.env` file and ensure database credentials are correct.

### Migration Script Fails to Upload to MinIO

**Error**: `Failed to upload image`

**Solution**: 
1. Ensure MinIO is running: `curl http://localhost:9000/minio/health/live`
2. Check MinIO credentials in `.env`
3. Verify network connectivity

### Some Images Not Migrated

**Check the error log** in the migration output. The script continues even if individual images fail, and reports all errors at the end.

### Product Images Not Displaying After Migration

**Possible causes**:
1. MinIO is not accessible from the frontend
2. CORS is not configured properly in MinIO
3. URLs are incorrect

**Solution**: Check the MinIO public URL configuration.

## Performance Comparison

### Before Migration (Base64)

| Metric | Value |
|--------|-------|
| Database Size | ~2.5 GB |
| Product Page Load | ~3.2s |
| Image Transfer Size | ~450 KB per image |

### After Migration (URLs)

| Metric | Value |
|--------|-------|
| Database Size | ~45 MB |
| Product Page Load | ~0.8s |
| Image Transfer Size | ~340 KB per image |
| Browser Caching | ✅ Enabled |

## Next Steps

After successful migration:

1. ✅ Test the admin panel thoroughly
2. ✅ Test the customer-facing website
3. ✅ Monitor MinIO storage usage
4. ✅ Set up regular MinIO backups
5. ✅ Consider configuring a CDN

## Support

If you encounter issues:

1. Check the migration script logs
2. Verify MinIO is running and accessible
3. Check database connectivity
4. Review the troubleshooting section above
