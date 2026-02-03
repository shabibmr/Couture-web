import { Client } from 'minio';

class MinioService {
    private minioClient: Client;
    private bucketName: string;

    constructor() {
        this.minioClient = new Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: parseInt(process.env.MINIO_PORT || '9000'),
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        });

        this.bucketName = process.env.MINIO_BUCKET_NAME || 'ruvera-assets';
        this.initializeBucket();
    }

    private async initializeBucket() {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1'); // Region is required but often ignored for local MinIO
                console.log(`Bucket '${this.bucketName}' created successfully.`);

                // Set policy to public read (simplified for this context, ideally leverage automatic policy setup via mc or restricting access)
                const policy = {
                    Version: "2012-10-17",
                    Statement: [
                        {
                            Effect: "Allow",
                            Principal: { AWS: ["*"] },
                            Action: ["s3:GetObject"],
                            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
                        },
                    ],
                };
                await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
                console.log(`Bucket '${this.bucketName}' policy set to public read.`);

            } else {
                console.log(`Bucket '${this.bucketName}' already exists.`);
            }
        } catch (err) {
            console.error('Error verifying/creating MinIO bucket:', err);
        }
    }

    async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
        try {
            await this.minioClient.putObject(this.bucketName, fileName, fileBuffer, fileBuffer.length, {
                'Content-Type': mimeType,
            });
            // Return the public URL
            // If connecting from outside docker to localhost
            const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
            const host = process.env.MINIO_ENDPOINT || 'localhost';
            const port = process.env.MINIO_PORT || '9000';
            return `${protocol}://${host}:${port}/${this.bucketName}/${fileName}`;
        } catch (err) {
            console.error('Error uploading file to MinIO:', err);
            throw new Error('File upload failed');
        }
    }

    async deleteFile(fileName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(this.bucketName, fileName);
            console.log(`File '${fileName}' deleted successfully.`);
        } catch (err) {
            console.error(`Error deleting file '${fileName}':`, err);
            throw new Error('File deletion failed');
        }
    }

    getClient(): Client {
        return this.minioClient;
    }
}

export const minioService = new MinioService();
