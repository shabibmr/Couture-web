import { Request, Response } from 'express';
import { uploadImage, uploadMultipleImages, deleteImage, parseMinioUrl } from './upload.service.js';
import { BUCKETS } from '../../config/minio.js';

/**
 * Upload a single image
 * POST /api/upload/image
 */
export async function uploadSingleImage(req: Request, res: Response): Promise<void> {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const { bucket = BUCKETS.GENERAL, folder } = req.body;

        console.log('📤 Upload request:', {
            filename: req.file.originalname,
            size: req.file.size,
            bucket,
            folder
        });

        // Validate bucket name
        const validBuckets = Object.values(BUCKETS);
        if (!validBuckets.includes(bucket)) {
            res.status(400).json({
                error: 'Invalid bucket name',
                validBuckets
            });
            return;
        }

        const result = await uploadImage(req.file, bucket, folder);

        console.log('✅ Upload successful:', result);
        res.status(200).json(result);
    } catch (error: any) {
        console.error('❌ Upload error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
}

/**
 * Upload multiple images
 * POST /api/upload/images
 */
export async function uploadImages(req: Request, res: Response): Promise<void> {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({ error: 'No files uploaded' });
            return;
        }

        const { bucket = BUCKETS.GENERAL, folder } = req.body;

        // Validate bucket name
        const validBuckets = Object.values(BUCKETS);
        if (!validBuckets.includes(bucket)) {
            res.status(400).json({
                error: 'Invalid bucket name',
                validBuckets
            });
            return;
        }

        const results = await uploadMultipleImages(req.files, bucket, folder);

        res.status(200).json({ images: results });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload images' });
    }
}

/**
 * Delete an image
 * DELETE /api/upload/image
 */
export async function deleteImageController(req: Request, res: Response): Promise<void> {
    try {
        const { url } = req.body;

        if (!url) {
            res.status(400).json({ error: 'Image URL is required' });
            return;
        }

        // Parse the MinIO URL to extract bucket and object name
        const parsed = parseMinioUrl(url);
        if (!parsed) {
            res.status(400).json({ error: 'Invalid MinIO URL' });
            return;
        }

        await deleteImage(parsed.bucket, parsed.objectName);

        res.status(200).json({ success: true, message: 'Image deleted successfully' });
    } catch (error: any) {
        console.error('Delete error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete image' });
    }
}
