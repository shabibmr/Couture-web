declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // Environment
            NODE_ENV: 'development' | 'production' | 'test';
            PORT: string;

            // Database Configuration
            DB_HOST: string;
            DB_PORT: string;
            DB_NAME: string;
            DB_USER: string;
            DB_PASSWORD: string;

            // Authentication
            JWT_SECRET: string;
            JWT_EXPIRES_IN: string;

            // Firebase Configuration
            FIREBASE_PROJECT_ID: string;
            FIREBASE_PRIVATE_KEY: string;
            FIREBASE_CLIENT_EMAIL: string;

            // Payment Gateway (Razorpay)
            RAZORPAY_KEY_ID: string;
            RAZORPAY_KEY_SECRET: string;
            RAZORPAY_WEBHOOK_SECRET?: string;

            // Email Configuration
            EMAIL_HOST: string;
            EMAIL_PORT: string;
            EMAIL_USER: string;
            EMAIL_PASSWORD: string;
            EMAIL_FROM: string;

            // Application URLs
            FRONTEND_URL?: string;
            BACKEND_URL?: string;

            // Other Services
            STORAGE_BUCKET?: string;
            REDIS_URL?: string;
        }
    }
}

export { };
