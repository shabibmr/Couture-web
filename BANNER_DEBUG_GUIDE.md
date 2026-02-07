# Banner Image Upload & Display - Debug Guide

## Current Status

✅ Backend running on port 5000
✅ MinIO running on port 9000
✅ Debug logging added to trace the flow

## Testing Instructions

### 1. Open Browser DevTools
- Press F12 or right-click → Inspect
- Go to **Console** tab

### 2. Navigate to Banners
- Go to http://localhost:3000/banners (or your admin port)
- Click "Add Banner" or edit an existing one

### 3. Upload an Image
When you upload an image, you should see these logs in sequence:

#### Frontend Console Logs (Browser):
```
📤 Single upload result: { url: "abc123.jpg", objectName: "abc123.jpg" }
🖼️ Calling onChange with: abc123.jpg
🎯 BannerEditor: Image changed to: abc123.jpg
```

#### After Upload - Display Logs:
```
🖼️ Displaying image: {
  objectKey: "abc123.jpg",
  bucket: "banners",
  fullUrl: "http://localhost:9000/banners/abc123.jpg"
}
```

#### Backend Terminal Logs:
```
📤 Upload request: {
  filename: "my-image.jpg",
  size: 123456,
  bucket: "banners",
  folder: undefined
}
✅ Upload successful: { url: "abc123.jpg", objectName: "abc123.jpg" }
```

## Common Issues & Solutions

### Issue 1: Upload Returns Full URL Instead of Object Key
**Symptom:** `result.url` is `http://localhost:9000/banners/abc123.jpg` instead of `abc123.jpg`

**Solution:** Backend is returning full URL. Check `backend/src/modules/system/upload.service.ts` line 46:
```typescript
return { url: objectName, objectName };  // Should return key, not full URL
```

### Issue 2: Image Preview Shows Broken Image
**Symptom:** Upload succeeds but image doesn't display

**Check:**
1. Is `fullUrl` correct in console? Should be: `http://localhost:9000/banners/abc123.jpg`
2. Can you access the URL directly in browser? Paste the `fullUrl` into address bar
3. Is MinIO accessible? Run: `curl http://localhost:9000/minio/health/live`

**Solution:** Check `admin/.env` has:
```
VITE_MINIO_PUBLIC_URL=http://localhost:9000
```

### Issue 3: Upload Fails with "Invalid bucket name"
**Symptom:** Backend returns 400 error

**Solution:** Backend expects exact bucket names from config. Check:
- Frontend passes: `bucket="banners"`
- Backend accepts: `BUCKETS.BANNERS` (from `backend/src/config/minio.ts`)

### Issue 4: CORS Error
**Symptom:** Browser console shows CORS error when loading image

**Solution:** MinIO buckets need public read policy. Check `backend/src/config/minio.ts` line 36-47 sets proper bucket policy.

## File Structure

### Backend Files:
- `backend/src/modules/system/upload.controller.ts` - Upload endpoint handlers
- `backend/src/modules/system/upload.service.ts` - MinIO upload logic
- `backend/src/modules/system/upload.routes.ts` - Upload routes
- `backend/src/config/minio.ts` - MinIO configuration
- `backend/src/middleware/upload.middleware.ts` - Multer configuration

### Frontend Files:
- `admin/src/components/ImageUpload.tsx` - Reusable image upload component
- `admin/src/services/upload.ts` - Upload API client
- `admin/src/utils/minio-url.ts` - URL construction utilities
- `admin/src/pages/Banners/BannerEditor.jsx` - Banner form

### Backend Model:
- `backend/src/modules/marketing/models/banner.model.js` - Banner database model with getters/setters
- `backend/src/modules/marketing/banner.controller.js` - Banner CRUD operations

## Data Flow

1. **User selects image** → ImageUpload component
2. **Component calls** → `uploadImage(file, 'banners')` from `services/upload.ts`
3. **Service POSTs** → `/api/upload/image` with FormData
4. **Backend uploads** → MinIO bucket 'banners' with unique filename
5. **Backend returns** → `{ url: "abc123.jpg", objectName: "abc123.jpg" }`
6. **Component calls** → `onChange("abc123.jpg")`
7. **Editor updates** → `formData.image = "abc123.jpg"`
8. **Component displays** → `getMinioUrl("abc123.jpg", "banners")` = `http://localhost:9000/banners/abc123.jpg`
9. **Form submits** → Saves object key to database
10. **On load** → Constructs URL from key for display

## Next Steps

1. **Test the upload** and share the console logs
2. **Check if image displays** after upload
3. **Try editing** an existing banner with an image
4. **Verify save** - does the image persist after page reload?

## Remove Debug Logs Later

Once working, remove console.log statements from:
- `backend/src/modules/system/upload.controller.ts` (lines with 📤, ✅, ❌)
- `admin/src/components/ImageUpload.tsx` (lines with 📤, 🖼️)
- `admin/src/pages/Banners/BannerEditor.jsx` (line with 🎯)
