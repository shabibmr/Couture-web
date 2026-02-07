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

    const MINIO_PUBLIC_URL = import.meta.env.VITE_MINIO_PUBLIC_URL || 'http://localhost:9000';
    return `${MINIO_PUBLIC_URL}/${bucket}/${objectKey}`;
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
