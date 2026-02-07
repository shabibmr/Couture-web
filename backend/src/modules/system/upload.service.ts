import { v4 as uuidv4 } from 'uuid';
import minioClient, { BUCKETS, MINIO_PUBLIC_URL, ensureBucket } from '../../config/minio.js';

interface UploadResult {
    url: string;
    objectName: string;
}

/**
 * Generate a unique filename with UUID
 */
function generateUniqueFilename(originalName: string, folder?: string): string {
    const ext = originalName.split('.').pop();
    const uniqueName = `${uuidv4()}.${ext}`;
    return folder ? `${folder}/${uniqueName}` : uniqueName;
}

/**
 * Upload a single image to MinIO
 */
export async function uploadImage(
    file: Express.Multer.File,
    bucket: string,
    folder?: string
): Promise<UploadResult> {
    try {
        // Ensure bucket exists
        await ensureBucket(bucket);

        // Generate unique filename
        const objectName = generateUniqueFilename(file.originalname, folder);

        // Upload to MinIO
        await minioClient.putObject(
            bucket,
            objectName,
            file.buffer,
            file.size,
            {
                'Content-Type': file.mimetype,
            }
        );

        // Return only object key (not full URL)
        // Frontend will construct URL using MINIO_PUBLIC_URL
        return { url: objectName, objectName };
    } catch (error) {
        console.error('Error uploading image to MinIO:', error);
        throw new Error('Failed to upload image');
    }
}

/**
 * Upload multiple images to MinIO
 */
export async function uploadMultipleImages(
    files: Express.Multer.File[],
    bucket: string,
    folder?: string
): Promise<UploadResult[]> {
    try {
        const uploadPromises = files.map(file => uploadImage(file, bucket, folder));
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw new Error('Failed to upload images');
    }
}

/**
 * Delete an image from MinIO
 */
export async function deleteImage(bucket: string, objectName: string): Promise<void> {
    try {
        await minioClient.removeObject(bucket, objectName);
        console.log(`✓ Deleted image: ${bucket}/${objectName}`);
    } catch (error) {
        console.error('Error deleting image from MinIO:', error);
        throw new Error('Failed to delete image');
    }
}

/**
 * Get public URL for an image
 */
export function getImageUrl(bucket: string, objectName: string): string {
    return `${MINIO_PUBLIC_URL}/${bucket}/${objectName}`;
}

/**
 * Extract bucket and object name from MinIO URL
 */
export function parseMinioUrl(url: string): { bucket: string; objectName: string } | null {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
            const bucket = pathParts[0];
            const objectName = pathParts.slice(1).join('/');
            return { bucket, objectName };
        }
        return null;
    } catch (error) {
        return null;
    }
}
