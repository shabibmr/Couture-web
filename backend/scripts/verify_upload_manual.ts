/**
 * Verification Script for Upload API
 * Run with: npm run dev (in one terminal) AND npx tsx scripts/test-upload-api.ts (in another)
 * 
 * Note: You need a valid admin token. 
 * This script is a template.
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5000/api/upload';
// REPLACE WITH VALID ADMIN TOKEN
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

async function testUpload() {
    try {
        // Create a dummy file
        const filePath = path.join(__dirname, 'test-image.png');
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, 'fake image content'); // This might fail mime check if generic content
            // Better to use a real image or mock buffer if testing controller directly
            console.log('Please place a valid test-image.png in scripts/ folder first.');
            return;
        }

        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        console.log('Uploading file...');
        const response = await axios.post(API_URL, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            }
        });

        console.log('Upload Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Upload Failed:', error.response ? error.response.data : error.message);
    }
}

testUpload();
