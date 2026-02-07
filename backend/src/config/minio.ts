import * as Minio from 'minio';
import dotenv from 'dotenv';

dotenv.config();

// MinIO client configuration
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

// Bucket names from environment
export const BUCKETS = {
    PRODUCTS: process.env.MINIO_BUCKET_PRODUCTS || 'products',
    BANNERS: process.env.MINIO_BUCKET_BANNERS || 'banners',
    GENERAL: process.env.MINIO_BUCKET_GENERAL || 'general',
};

// Public URL for accessing images
export const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000';

/**
 * Ensure a bucket exists, create it if it doesn't
 */
export async function ensureBucket(bucketName: string): Promise<void> {
    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`✓ Created MinIO bucket: ${bucketName}`);

            // Set public read policy for the bucket
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${bucketName}/*`],
                    },
                ],
            };
            await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
            console.log(`✓ Set public read policy for bucket: ${bucketName}`);
        }
    } catch (error) {
        console.error(`Error ensuring bucket ${bucketName}:`, error);
        throw error;
    }
}

/**
 * Initialize all required buckets
 */
export async function initializeBuckets(): Promise<void> {
    try {
        await Promise.all([
            ensureBucket(BUCKETS.PRODUCTS),
            ensureBucket(BUCKETS.BANNERS),
            ensureBucket(BUCKETS.GENERAL),
        ]);
        console.log('✓ All MinIO buckets initialized');
    } catch (error) {
        console.error('Failed to initialize MinIO buckets:', error);
        throw error;
    }
}

export default minioClient;
