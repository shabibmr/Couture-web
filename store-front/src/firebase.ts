import { FirebaseApp, initializeApp, getApps, getApp } from "firebase/app";
import { Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { Auth, getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only once
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Auth is supported in Node.js (SSR)
const auth: Auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Analytics is NOT supported in Node.js environment
let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
    isSupported().then((yes) => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, analytics, auth, googleProvider };
