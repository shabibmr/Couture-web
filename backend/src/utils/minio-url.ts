import { MINIO_PUBLIC_URL } from '../config/minio.js';

/**
 * Construct full MinIO URL from object key
 * 
 * @param objectKey - Object key in MinIO (e.g., "main/uuid.webp")
 * @param bucket - MinIO bucket name (e.g., "products")
 * @returns Full MinIO URL (e.g., "http://localhost:9000/products/main/uuid.webp")
 */
export function getMinioUrl(objectKey: string, bucket: string): string {
    if (!objectKey) return '';

    // If it's already a full URL, return as-is (backward compatibility)
    if (objectKey.startsWith('http://') || objectKey.startsWith('https://')) {
        return objectKey;
    }

    return `${MINIO_PUBLIC_URL}/${bucket}/${objectKey}`;
}

/**
 * Extract object key from full MinIO URL
 * 
 * @param url - Full MinIO URL or object key
 * @param bucket - MinIO bucket name
 * @returns Object key (e.g., "main/uuid.webp")
 */
export function extractObjectKey(url: string, bucket: string): string {
    if (!url) return '';

    // If it's already an object key (no protocol), return as-is
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return url;
    }

    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);

        // Remove bucket from path
        if (pathParts[0] === bucket) {
            pathParts.shift();
        }

        return pathParts.join('/');
    } catch (error) {
        console.error('Error extracting object key:', error);
        return url;
    }
}

/**
 * Get MinIO URLs for an array of object keys
 * 
 * @param objectKeys - Array of object keys
 * @param bucket - MinIO bucket name
 * @returns Array of full MinIO URLs
 */
export function getMinioUrls(objectKeys: string[], bucket: string): string[] {
    return objectKeys.map(key => getMinioUrl(key, bucket));
}
