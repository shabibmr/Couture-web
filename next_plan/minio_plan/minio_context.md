# MinIO Storage Implementation Context

## Overview
MinIO has been implemented as the primary file storage solution to replace base64-in-database storage. This infrastructure supports scalable file management for products, banners, and other assets across the backend API, admin panel, and Next.js store-front.

## Infrastructure Setup

### MinIO Service (Docker Compose)
- **Service Name**: `ruvera-minio`
- **Image**: `minio/minio:latest`
- **Ports**: 
  - `9000` - S3-compatible API endpoint
  - `9001` - Web console for bucket management
- **Credentials**: 
  - Root User: `minioadmin`
  - Root Password: `minioadmin`
- **Default Bucket**: `ruvera-assets`
- **Auto-Setup**: Helper container `createbuckets` automatically creates bucket and sets public read policy
- **Data Persistence**: `minio_data` volume for persistent storage
- **Health Check**: Configured with 30s interval curl check

### Environment Variables
```bash
MINIO_ENDPOINT=localhost        # Docker internal: 'minio', External: 'localhost'
MINIO_PORT=9000                 # API port
MINIO_USE_SSL=false             # true for production with HTTPS
MINIO_ACCESS_KEY=minioadmin     # Change in production
MINIO_SECRET_KEY=minioadmin     # Change in production
MINIO_BUCKET_NAME=ruvera-assets # Default bucket name
```

## Backend Integration

### Service Layer
**File**: `src/services/minio.service.ts`

**Features**:
- Singleton service pattern for reusable MinIO client
- Automatic bucket initialization on startup
- Public read policy configuration
- File upload with automatic URL generation
- File deletion by filename
- Exposed client for advanced operations

**Methods**:
- `uploadFile(buffer, fileName, mimeType)` → Returns MinIO public URL
- `deleteFile(fileName)` → Removes object from bucket
- `getClient()` → Access underlying MinIO client

### Configuration
**File**: `src/config/storage.config.ts`

Centralizes all MinIO connection settings using environment variables with fallback defaults.

### API Endpoints
**Routes**: `src/routes/upload.routes.ts` (To be implemented - See Phase 1)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/upload` | Upload single file, returns `{ url, fileName }` | Admin only |
| DELETE | `/api/upload` | Delete file by filename from MinIO | Admin only |

**Request Format (POST)**:
- Content-Type: `multipart/form-data`
- Field name: `file`
- Returns: `{ url: "http://localhost:9000/ruvera-assets/uploads/...", fileName: "..." }`

**Request Format (DELETE)**:
- Content-Type: `application/json`
- Body: `{ fileName: "uploads/timestamp-filename.ext" }`

### Database Schema

**Image Fields Across Models**:
- `Product.featured_image` - Main product display image (TEXT/VARCHAR)
- `ProductImage.image_url` - Gallery/additional images (TEXT/VARCHAR)
- `ProductVariant.variant_image` - Size/color specific images (TEXT/VARCHAR)
- `Banner.image_url` - Hero/promotional banner images (TEXT/VARCHAR)

**Storage Pattern**: Only the public URL string is stored, not the file data.

## URL Convention

### Format
```
http://[MINIO_ENDPOINT]:[MINIO_PORT]/[BUCKET_NAME]/uploads/[timestamp]-[filename]
```

### Examples
```
http://localhost:9000/ruvera-assets/uploads/1738542123456-product-hero.jpg
http://localhost:9000/ruvera-assets/uploads/1738542987654-banner-summer.png
```

### Path Structure
- **Bucket**: `ruvera-assets` (public read)
- **Folder**: `uploads/` (convention for organization)
- **Filename**: `{timestamp}-{original-filename}` (prevents collisions)

## Integration Workflow

### Current (Backend Only)
1. MinIO service initialized on app startup
2. Bucket created automatically if not exists
3. Manual upload via service layer possible
4. APIs return MinIO URLs in product/banner responses

### Target (Full Stack - After Implementation)
1. **Admin Panel Selection**: User selects image file in form
2. **Immediate Upload**: Frontend calls `POST /api/upload` immediately
3. **Progress Feedback**: Show upload progress and preview
4. **URL Storage**: MinIO URL displayed in form field
5. **Form Submission**: Only URL string saved to database
6. **Store-Front Display**: Next.js Image component fetches from MinIO URL

## Admin Panel Integration (To Be Implemented - See Phase 2)

### Component Architecture
- `ImageUpload.tsx` - Reusable upload component with preview
- Integrated into `ProductForm.tsx` for product images
- Integrated into `BannerManagement.tsx` for banners

### User Experience
- Click upload button → File picker opens
- Select image → Upload starts immediately
- Progress bar shows upload status
- Success: Image preview + MinIO URL copied to form
- Error: Clear error message with retry option

## Next.js Store-Front Configuration (To Be Implemented - See Phase 3)

### Image Component Setup
All pages already use `next/image` for optimization:
- `Home` page (Hero, LiquidGallery)
- `Shop` page (Product grid)
- `Product Detail` page (Main image, gallery, related products)
- `Cart Drawer` (Cart item thumbnails)
- `Checkout` page (Order summary images)

### Required Configuration
**File**: `store-front/next.config.ts`

Must whitelist MinIO domain for Next.js Image optimization:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '9000',
      pathname: '/ruvera-assets/**',
    },
  ],
}
```

### Production Considerations
- Change protocol to `https` for production
- Use production MinIO hostname (e.g., `cdn.yourdomain.com`)
- Consider CDN in front of MinIO for global distribution

## Security Considerations

### Current Setup (Development)
- Public read access on `ruvera-assets` bucket
- Upload/Delete endpoints require admin authentication
- No file type restrictions currently enforced

### Production Recommendations
1. **File Validation**: Restrict to image MIME types (jpg, png, webp, gif)
2. **File Size Limits**: Max 5MB per upload (configurable)
3. **Access Control**: Keep upload/delete admin-only
4. **HTTPS**: Enable SSL/TLS for MinIO in production
5. **Credential Rotation**: Change default minioadmin credentials
6. **Bucket Policies**: Fine-tune policies per use case
7. **Virus Scanning**: Consider integrating virus scanning for uploads

## Verification & Testing

### Manual Testing
**Test Connection**:
```bash
cd backend
node scripts/test-minio-connection.ts
```

**MinIO Console Access**:
- URL: http://localhost:9001
- Login: minioadmin / minioadmin
- Browse uploaded files in `ruvera-assets` bucket

### Automated Tests
- Unit tests for `minio.service.ts` upload/delete methods
- Integration tests for `/api/upload` endpoints
- E2E tests for admin panel upload flow

## Migration Strategy (To Be Implemented - See Phase 4)

### Base64 to MinIO Migration
**Script**: `backend/scripts/migrate_images_to_minio.ts`

**Process**:
1. Query all records with base64 image data
2. Convert base64 string to Buffer
3. Upload buffer to MinIO via `minioService.uploadFile()`
4. Update database record with MinIO URL
5. Log migration results (success/failure counts)

### Cleanup Old Images
- On product update: Delete old MinIO file before saving new URL
- On product delete: Remove all associated MinIO files
- Cron job to identify orphaned files in MinIO (future enhancement)

## Implementation Phases

See detailed phase-based plans in `next_plan/minio_plan/`:

1. **Phase 1 - Backend**: API endpoints and upload controller
2. **Phase 2 - Admin**: UI components for image upload
3. **Phase 3 - Store-Front**: Next.js Image configuration
4. **Phase 4 - Migration**: Data migration and cleanup scripts

Each phase has a dedicated plan file with step-by-step instructions.

## Troubleshooting

### Common Issues

**Issue**: "Connection refused" when uploading
- **Cause**: MinIO container not running
- **Fix**: `docker-compose up -d minio`

**Issue**: "Bucket does not exist"
- **Cause**: Auto-create failed or wrong bucket name
- **Fix**: Check `createbuckets` container logs, verify `MINIO_BUCKET_NAME` env var

**Issue**: Next.js Image "Invalid src prop"
- **Cause**: MinIO domain not whitelisted in `next.config.ts`
- **Fix**: Add domain to `images.remotePatterns` configuration

**Issue**: 403 Forbidden when loading image
- **Cause**: Bucket policy not set to public read
- **Fix**: Run `mc anonymous set download myminio/ruvera-assets` in MinIO console

## References

- MinIO JavaScript Client: https://min.io/docs/minio/linux/developers/javascript/minio-javascript.html
- Next.js Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images
- Docker Compose MinIO Setup: https://min.io/docs/minio/container/index.html
