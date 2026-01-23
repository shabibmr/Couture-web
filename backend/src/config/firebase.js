import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// In a real scenario, you'd provide a serviceAccountKey.json file.
// For now, we'll try to use environment variables or a placeholder.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : null;

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    // Fallback for development if no service account is provided
    console.warn('Firebase Admin initialized without service account. Verification might fail.');
    admin.initializeApp();
}

export default admin;
