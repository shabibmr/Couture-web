# Phase 2: Admin Panel Integration

## Overview
Implement UI components in the admin panel to enable uploading images to MinIO. This includes creating a reusable `ImageUpload` component and integrating it into existing forms (Product, Banner).

## Prerequisites
- ✅ Phase 1 complete (Backend upload API working)
- ✅ Admin panel built with React + Vite
- ✅ Axios or Fetch API for HTTP requests

## Implementation Steps

### Step 2.1: Create Reusable ImageUpload Component

**File**: `admin/src/components/common/ImageUpload.tsx` (NEW)

```typescript
import React, { useState, useRef } from 'react';
import axios from 'axios';

interface ImageUploadProps {
    label?: string;
    currentImageUrl?: string;
    onImageUploaded: (url: string, fileName: string) => void;
    onError?: (error: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    label = 'Upload Image',
    currentImageUrl,
    onImageUploaded,
    onError,
}) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            const errorMsg = 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.';
            setError(errorMsg);
            if (onError) onError(errorMsg);
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            const errorMsg = 'File too large. Maximum size is 5MB.';
            setError(errorMsg);
            if (onError) onError(errorMsg);
            return;
        }

        // Clear previous errors
        setError('');

        // Show local preview immediately
        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);

        // Upload to backend
        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            setProgress(0);

            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/upload`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / (progressEvent.total || 100)
                        );
                        setProgress(percentCompleted);
                    },
                }
            );

            // Upload successful
            const { url, fileName } = response.data;
            setPreviewUrl(url);
            onImageUploaded(url, fileName);
            setUploading(false);

        } catch (err: any) {
            console.error('Upload failed:', err);
            const errorMsg = err.response?.data?.message || 'Upload failed. Please try again.';
            setError(errorMsg);
            if (onError) onError(errorMsg);
            setUploading(false);
            setPreviewUrl(currentImageUrl || ''); // Revert to previous image
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="image-upload-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            {/* Preview */}
            {previewUrl && (
                <div className="mb-4">
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full max-w-xs h-48 object-cover rounded border"
                    />
                </div>
            )}

            {/* Upload Button */}
            <button
                type="button"
                onClick={handleClick}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
                {uploading ? `Uploading... ${progress}%` : 'Choose Image'}
            </button>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Progress Bar */}
            {uploading && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}

            {/* URL Display (for debugging/verification) */}
            {previewUrl && !uploading && (
                <p className="mt-2 text-xs text-gray-500 truncate">
                    {previewUrl}
                </p>
            )}
        </div>
    );
};
```

---

### Step 2.2: Integrate into Product Form

**File**: `admin/src/pages/Products/ProductForm.tsx` (MODIFY)

**Import**:
```typescript
import { ImageUpload } from '../../components/common/ImageUpload';
```

**Update State** (add these to existing state):
```typescript
const [mainImageUrl, setMainImageUrl] = useState(product?.featured_image || '');
const [additionalImageUrls, setAdditionalImageUrls] = useState<string[]>(
    product?.images?.map(img => img.image_url) || []
);
```

**Replace existing image input fields**:

```tsx
{/* Main Image Upload */}
<div className="mb-6">
    <ImageUpload
        label="Main Product Image"
        currentImageUrl={mainImageUrl}
        onImageUploaded={(url, fileName) => {
            setMainImageUrl(url);
        }}
        onError={(error) => {
            console.error('Main image upload error:', error);
            // Optionally show toast notification
        }}
    />
</div>

{/* Additional Images Upload */}
<div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
        Additional Images (Gallery)
    </label>
    
    {additionalImageUrls.map((imageUrl, index) => (
        <div key={index} className="mb-4">
            <ImageUpload
                label={`Gallery Image ${index + 1}`}
                currentImageUrl={imageUrl}
                onImageUploaded={(url, fileName) => {
                    const newUrls = [...additionalImageUrls];
                    newUrls[index] = url;
                    setAdditionalImageUrls(newUrls);
                }}
                onError={(error) => {
                    console.error(`Gallery image ${index + 1} upload error:`, error);
                }}
            />
            <button
                type="button"
                onClick={() => {
                    const newUrls = additionalImageUrls.filter((_, i) => i !== index);
                    setAdditionalImageUrls(newUrls);
                }}
                className="mt-2 text-sm text-red-600 hover:underline"
            >
                Remove Image
            </button>
        </div>
    ))}

    <button
        type="button"
        onClick={() => setAdditionalImageUrls([...additionalImageUrls, ''])}
        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
    >
        + Add Another Image
    </button>
</div>
```

**Update Form Submission**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
        name,
        description,
        base_price: price,
        category_id,
        brand_id,
        mainImage: mainImageUrl,  // MinIO URL
        additionalImages: additionalImageUrls.filter(url => url), // Filter empty strings
        sizes: selectedSizes,
        // ... other fields
    };

    try {
        if (isEditMode) {
            await axios.put(`/api/products/${productId}`, productData);
        } else {
            await axios.post('/api/products', productData);
        }
        // Success: redirect or show notification
    } catch (error) {
        console.error('Product save failed:', error);
        // Show error notification
    }
};
```

---

### Step 2.3: Integrate into Banner Management

**File**: `admin/src/pages/Banner/BannerManagement.tsx` (MODIFY)

**Import**:
```typescript
import { ImageUpload } from '../../components/common/ImageUpload';
```

**Update State**:
```typescript
const [bannerImageUrl, setBannerImageUrl] = useState(banner?.image_url || '');
```

**Replace banner image input**:
```tsx
<div className="mb-6">
    <ImageUpload
        label="Banner Image"
        currentImageUrl={bannerImageUrl}
        onImageUploaded={(url, fileName) => {
            setBannerImageUrl(url);
        }}
        onError={(error) => {
            console.error('Banner upload error:', error);
        }}
    />
</div>
```

**Update Form Submission**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bannerData = {
        title,
        subtitle,
        cta_text,
        cta_link,
        image_url: bannerImageUrl,  // MinIO URL
        is_active,
        // ... other fields
    };

    try {
        if (isEditMode) {
            await axios.put(`/api/banners/${bannerId}`, bannerData);
        } else {
            await axios.post('/api/banners', bannerData);
        }
        // Success notification
    } catch (error) {
        console.error('Banner save failed:', error);
    }
};
```

---

### Step 2.4: Configure Environment Variable

**File**: `admin/.env.development` (MODIFY)

Ensure API base URL is set:
```env
VITE_API_BASE_URL=http://localhost:8001
```

---

## Testing

### Step 2.5: Manual Testing - Products

1. **Start Admin Panel**:
   ```bash
   cd admin
   npm run dev
   ```

2. **Navigate to Products**:
   - Click "Add New Product" or edit existing product

3. **Upload Main Image**:
   - Click "Choose Image" in Main Product Image section
   - Select a JPG image
   - Verify:
     - Upload progress bar appears
     - Image preview displays after upload
     - MinIO URL appears below preview (e.g., `http://localhost:9000/ruvera-assets/uploads/...`)

4. **Upload Additional Images**:
   - Click "+ Add Another Image"
   - Upload 2-3 gallery images
   - Verify each uploads successfully

5. **Submit Product**:
   - Fill in other required fields (name, price, category, sizes)
   - Click "Save Product"
   - Verify product created with MinIO URLs in database

6. **Edit Product**:
   - Open an existing product
   - Verify current image displays
   - Replace main image with new one
   - Save and verify old image is still in MinIO (cleanup is Phase 4)

---

### Step 2.6: Manual Testing - Banners

1. **Navigate to Banners**:
   - Admin Panel → Banners

2. **Upload Banner Image**:
   - Click "Choose Image"
   - Select a wide banner image (1920x600 recommended)
   - Verify upload succeeds and preview shows

3. **Submit Banner**:
   - Fill in title, subtitle, CTA fields
   - Save banner
   - Verify banner created with MinIO URL

---

### Step 2.7: Error Handling Tests

1. **Test Invalid File Type**:
   - Try uploading .txt or .pdf file
   - Verify error message: "Invalid file type..."

2. **Test Large File**:
   - Try uploading image > 5MB
   - Verify error message: "File too large..."

3. **Test Network Error**:
   - Stop backend server (`Ctrl+C` in backend terminal)
   - Try uploading image
   - Verify error message: "Upload failed..."
   - Verify UI reverts to previous image state

4. **Test Unauthorized**:
   - Logout from admin panel
   - Try to create product/banner
   - Should redirect to login (if protected)

---

## Verification Checklist

- [ ] `ImageUpload.tsx` component created with all features
- [ ] Component displays image preview
- [ ] Component shows upload progress
- [ ] Component handles errors gracefully
- [ ] Integrated into `ProductForm.tsx` for main + additional images
- [ ] Integrated into `BannerManagement.tsx` for banner images
- [ ] Product submission sends MinIO URLs (not files)
- [ ] Banner submission sends MinIO URLs (not files)
- [ ] Invalid file types rejected with error message
- [ ] Large files (>5MB) rejected with error message
- [ ] Network errors show user-friendly message
- [ ] Images appear in MinIO console after upload

---

## UI/UX Enhancements (Optional)

### Add Toast Notifications

```bash
npm install react-hot-toast
```

**Usage**:
```typescript
import toast from 'react-hot-toast';

// On successful upload
toast.success('Image uploaded successfully!');

// On error
toast.error(error);
```

### Add Loading Spinner

Replace progress bar with spinner during upload:
```tsx
{uploading && (
    <div className="flex items-center gap-2 mt-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Uploading {progress}%</span>
    </div>
)}
```

### Add Drag-and-Drop Support

Wrap component in drag-drop zone for better UX.

---

## Next Steps

After completing Phase 2, proceed to:
- **Phase 3**: Configure Next.js store-front for MinIO images
