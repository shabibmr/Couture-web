# Phase 1: Backend API Implementation

## Overview
Complete the backend upload API infrastructure to support file uploads from the admin panel. This includes creating routes, controllers, and middleware for handling multipart file uploads to MinIO.

## Prerequisites
- ✅ MinIO service running via Docker Compose
- ✅ `minio.service.ts` implemented
- ✅ `storage.config.ts` configured

## Implementation Steps

### Step 1.1: Install Multer for File Uploads

**File**: `backend/package.json`

```bash
cd backend
npm install multer @types/multer --save
```

**Purpose**: Multer is middleware for handling `multipart/form-data` (file uploads) in Express.

---

### Step 1.2: Create Upload Controller

**File**: `backend/src/controllers/upload.controller.ts` (NEW)

```typescript
import { Request, Response } from 'express';
import { minioService } from '../services/minio.service';

/**
 * Upload a single file to MinIO
 * POST /api/upload
 * Content-Type: multipart/form-data
 * Field: 'file'
 */
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const file = req.file;
        
        // Validate file type (images only)
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            res.status(400).json({ 
                message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' 
            });
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            res.status(400).json({ 
                message: 'File too large. Maximum size is 5MB.' 
            });
            return;
        }

        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const fileName = `uploads/${timestamp}-${file.originalname}`;

        // Upload to MinIO
        const url = await minioService.uploadFile(
            file.buffer,
            fileName,
            file.mimetype
        );

        // Return URL and filename
        res.status(200).json({ 
            url, 
            fileName,
            message: 'File uploaded successfully' 
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            message: 'File upload failed', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

/**
 * Delete a file from MinIO
 * DELETE /api/upload
 * Content-Type: application/json
 * Body: { fileName: "uploads/timestamp-filename.ext" }
 */
export const deleteFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fileName } = req.body;

        if (!fileName) {
            res.status(400).json({ message: 'fileName is required' });
            return;
        }

        // Delete from MinIO
        await minioService.deleteFile(fileName);

        res.status(200).json({ 
            message: 'File deleted successfully',
            fileName 
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ 
            message: 'File deletion failed', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};
```

---

### Step 1.3: Create Upload Routes

**File**: `backend/src/routes/upload.routes.ts` (NEW)

```typescript
import { Router } from 'express';
import multer from 'multer';
import { uploadFile, deleteFile } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';

const router = Router();

// Configure multer for memory storage (file buffer)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
});

/**
 * POST /api/upload
 * Upload single file to MinIO
 * Protected: Admin only
 */
router.post(
    '/',
    authenticate,
    isAdmin,
    upload.single('file'),
    uploadFile
);

/**
 * DELETE /api/upload
 * Delete file from MinIO by filename
 * Protected: Admin only
 */
router.delete(
    '/',
    authenticate,
    isAdmin,
    deleteFile
);

export default router;
```

---

### Step 1.4: Register Upload Routes in Main App

**File**: `backend/src/index.ts` (MODIFY)

**Add import**:
```typescript
import uploadRoutes from './routes/upload.routes';
```

**Register route** (after other routes):
```typescript
app.use('/api/upload', uploadRoutes);
```

**Full context** (find existing routes section and add):
```typescript
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes); // <-- ADD THIS LINE
```

---

### Step 1.5: Update Product Controller Validation (Optional but Recommended)

**File**: `backend/src/modules/catalog/product.controller.js` (MODIFY)

**Add URL validation** in `createProduct` and `updateProduct`:

```javascript
// Add helper function at top of file
const isValidMinioUrl = (url) => {
    if (!url) return true; // Allow null/undefined
    const minioEndpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const minioPort = process.env.MINIO_PORT || '9000';
    const bucketName = process.env.MINIO_BUCKET_NAME || 'ruvera-assets';
    const expectedPrefix = `http://${minioEndpoint}:${minioPort}/${bucketName}/`;
    return url.startsWith(expectedPrefix);
};

// In createProduct, before creating product:
if (mainImage && !isValidMinioUrl(mainImage)) {
    return res.status(400).json({ 
        message: 'Invalid image URL. Must be a MinIO URL.' 
    });
}

// In updateProduct, before updating:
if (mainImage !== undefined && !isValidMinioUrl(mainImage)) {
    return res.status(400).json({ 
        message: 'Invalid image URL. Must be a MinIO URL.' 
    });
}
```

---

## Testing

### Step 1.6: Test Upload Endpoint with cURL

**Get Admin Token**:
```bash
# Login as admin first
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-admin-password"
  }'

# Copy the token from response
```

**Upload Test Image**:
```bash
curl -X POST http://localhost:8001/api/upload \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@/path/to/test-image.jpg"

# Expected response:
# {
#   "url": "http://localhost:9000/ruvera-assets/uploads/1738542123456-test-image.jpg",
#   "fileName": "uploads/1738542123456-test-image.jpg",
#   "message": "File uploaded successfully"
# }
```

**Test Delete Endpoint**:
```bash
curl -X DELETE http://localhost:8001/api/upload \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "uploads/1738542123456-test-image.jpg"
  }'

# Expected response:
# {
#   "message": "File deleted successfully",
#   "fileName": "uploads/1738542123456-test-image.jpg"
# }
```

---

### Step 1.7: Verify in MinIO Console

1. Open MinIO Console: http://localhost:9001
2. Login: minioadmin / minioadmin
3. Navigate to Buckets → ruvera-assets → uploads/
4. Verify uploaded file appears
5. Click file to get public URL
6. Open URL in browser to confirm image loads

---

## Verification Checklist

- [ ] Multer installed and configured
- [ ] `upload.controller.ts` created with upload/delete handlers
- [ ] `upload.routes.ts` created with protected routes
- [ ] Routes registered in `index.ts`
- [ ] Upload endpoint tested with cURL (returns MinIO URL)
- [ ] Delete endpoint tested (removes file from MinIO)
- [ ] File appears in MinIO console after upload
- [ ] File removed from MinIO after delete
- [ ] Invalid file types are rejected (e.g., .txt, .pdf)
- [ ] Files larger than 5MB are rejected
- [ ] Unauthorized requests (no token) return 401

---

## Error Handling

### Common Errors

**Error**: "No file uploaded"
- **Cause**: Request missing file field or wrong field name
- **Fix**: Ensure field name is `file` in multipart form

**Error**: "Invalid file type"
- **Cause**: Non-image file uploaded
- **Fix**: Only upload JPG, PNG, GIF, or WebP images

**Error**: "File too large"
- **Cause**: File exceeds 5MB limit
- **Fix**: Compress image or reduce size

**Error**: "File upload failed"
- **Cause**: MinIO connection issue
- **Fix**: Check MinIO container is running (`docker ps`)

---

## Next Steps

After completing Phase 1, proceed to:
- **Phase 2**: Implement Admin Panel UI for image uploads
