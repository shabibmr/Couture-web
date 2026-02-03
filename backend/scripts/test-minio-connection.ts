import { minioService } from '../src/services/minio.service.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testMinio() {
    console.log('Testing MinIO Connection...');

    // Create a dummy buffer
    const buffer = Buffer.from('Hello From MinIO Verification Script', 'utf-8');
    const fileName = `test-file-${Date.now()}.txt`;

    try {
        console.log('1. Uploading file...');
        const url = await minioService.uploadFile(buffer, fileName, 'text/plain');
        console.log('✅ File uploaded successfully!');
        console.log('File URL:', url);

        console.log('2. Deleting file...');
        await minioService.deleteFile(fileName);
        console.log('✅ File deleted successfully!');

        console.log('🎉 MinIO Integration Test Passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ MinIO Verification Failed:', error);
        process.exit(1);
    }
}

testMinio();
