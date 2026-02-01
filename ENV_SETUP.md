# Environment Variables Setup Guide

This guide explains how to configure environment variables for all three applications in the Ruvera Couture platform.

## Quick Start

Each application has three environment files:
- `.env.example` - Template with all variables documented (committed to git)
- `.env` - Main file for local development (ignored by git)
- `.env.development` - Development-specific settings (ignored by git)
- `.env.production` - Production-specific settings (ignored by git)

### Initial Setup

1. **Backend**
```bash
cd backend
cp .env.example .env
# Edit .env and fill in your actual values
```

2. **Customer App**
```bash
cd customer
cp .env.example .env
# Edit .env and fill in your actual values
```

3. **Admin App**
```bash
cd admin
cp .env.example .env
# Edit .env and fill in your actual values
```

## Backend Environment Variables

### Required Variables

#### Database Configuration
```bash
DB_HOST=127.0.0.1          # MySQL host
DB_PORT=3306               # MySQL port
DB_NAME=couture_db         # Database name
DB_USER=your_username      # Database user
DB_PASSWORD=your_password  # Database password
```

#### Server Configuration
```bash
PORT=5000                  # Backend server port
NODE_ENV=development       # development | production
```

#### Authentication
```bash
JWT_SECRET=your_secret     # Generate: openssl rand -base64 32
```

#### Firebase Admin SDK
```bash
FIREBASE_PROJECT_ID=your-project-id

# Option 1: Service Account JSON (recommended for production)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Option 2: Use default credentials (for local development)
# Just set FIREBASE_PROJECT_ID and ensure you're authenticated with gcloud
```

**Getting Firebase Service Account:**
1. Go to Firebase Console > Project Settings
2. Click "Service Accounts" tab
3. Click "Generate New Private Key"
4. Download the JSON file
5. Convert to single-line string: `JSON.stringify(require('./serviceAccountKey.json'))`

#### Payment Gateway (Razorpay)
```bash
RAZORPAY_MODE=test         # test | live

# Test credentials
RAZORPAY_TEST_KEY_ID=rzp_test_xxxxx
RAZORPAY_TEST_KEY_SECRET=your_test_secret
RAZORPAY_TEST_WEBHOOK_SECRET=your_test_webhook

# Live credentials (production only)
RAZORPAY_LIVE_KEY_ID=rzp_live_xxxxx
RAZORPAY_LIVE_KEY_SECRET=your_live_secret
RAZORPAY_LIVE_WEBHOOK_SECRET=your_live_webhook
```

**Getting Razorpay Credentials:**
1. Sign up at https://razorpay.com
2. Go to Settings > API Keys
3. Generate Test or Live keys
4. For webhooks: Settings > Webhooks > Add New Webhook

### Optional Variables

#### CORS & Frontend URLs
```bash
FRONTEND_URL=http://localhost:5173    # Customer app URL
ADMIN_URL=http://localhost:5174       # Admin app URL
API_URL=http://localhost:5000         # Backend API URL (for webhooks)
```

#### Email Configuration (SMTP)
```bash
SMTP_HOST=smtp.gmail.com              # SMTP server
SMTP_PORT=587                         # SMTP port (587 for TLS)
SMTP_USER=your-email@gmail.com        # SMTP username
SMTP_PASS=your-app-password           # SMTP password/app password
SMTP_FROM=noreply@yourdomain.com      # From email address
ADMIN_EMAIL=admin@yourdomain.com      # Admin notification email
```

**Gmail App Password Setup:**
1. Enable 2-Step Verification on your Google Account
2. Go to Google Account > Security > 2-Step Verification > App passwords
3. Generate a new app password for "Mail"
4. Use this password in `SMTP_PASS`

## Customer App Environment Variables

### Required Variables

```bash
# Backend API URL (no trailing slash)
VITE_API_URL=http://localhost:5000

# Firebase Client SDK Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Getting Firebase Client Config:**
1. Go to Firebase Console > Project Settings
2. Scroll to "Your apps" section
3. Click the Web app (</> icon)
4. Copy the config object values

### Optional Variables

```bash
VITE_APP_NAME=Ruvera Couture     # App name in browser title
```

### Mobile Testing

To test on mobile devices on the same network:
```bash
# Find your local IP: ifconfig (macOS/Linux) or ipconfig (Windows)
VITE_API_URL=http://192.168.x.x:5000  # Replace x.x with your IP
```

## Admin App Environment Variables

### Required Variables

```bash
# Backend API URL (no trailing slash)
VITE_API_URL=http://localhost:5000
```

### Optional Variables

```bash
VITE_APP_NAME=Ruvera Admin       # App name in browser title
```

## Environment-Specific Files

### Development (.env.development)
- Used during `npm run dev`
- Points to local backend (localhost:5000)
- Uses test payment gateway credentials
- Enables debug logging

### Production (.env.production)
- Used during `npm run build`
- Points to production backend (https://apis.ruveracouture.com)
- Uses live payment gateway credentials
- Disables debug logging
- Optimized for performance

### Switching Environments

By default, Vite uses:
- `.env.development` when running `npm run dev`
- `.env.production` when running `npm run build`
- `.env` is always loaded (as fallback/default)

To explicitly set environment:
```bash
# Development
npm run dev --mode development

# Production
npm run build --mode production
```

## Security Best Practices

### DO
✅ Keep `.env` files out of version control (already in `.gitignore`)
✅ Use strong, unique secrets for JWT_SECRET
✅ Use test credentials during development
✅ Rotate credentials regularly
✅ Use different Firebase projects for dev/prod
✅ Enable Gmail App Passwords instead of account password

### DON'T
❌ Commit `.env` files with real credentials
❌ Share credentials in chat/email
❌ Use production credentials in development
❌ Use weak or default secrets
❌ Store credentials in code comments

## Troubleshooting

### Backend won't start
1. Check database connection: `mysql -u user -p` and verify credentials
2. Ensure MySQL is running: `mysql.server status` or `brew services list`
3. Check if port 5000 is available: `lsof -i :5000`

### Firebase authentication fails
1. Verify all Firebase config values are correct
2. Check Firebase Console > Authentication is enabled
3. Ensure domains are whitelisted in Firebase Console > Authentication > Settings

### Razorpay payments fail
1. Verify you're using test keys in development
2. Check RAZORPAY_MODE matches your key type (test/live)
3. Test with Razorpay test cards: https://razorpay.com/docs/payments/payments/test-card-upi-details/

### Email notifications not sending
1. Verify SMTP credentials are correct
2. For Gmail, ensure App Password is used (not account password)
3. Check firewall/network allows SMTP port 587
4. Test SMTP connection: `telnet smtp.gmail.com 587`

## Example Configurations

### Local Development Setup
```bash
# Backend
PORT=5000
DB_HOST=127.0.0.1
RAZORPAY_MODE=test
VITE_API_URL=http://localhost:5000

# Customer & Admin
VITE_API_URL=http://localhost:5000
```

### Production Setup
```bash
# Backend
PORT=5000
DB_HOST=production-db-host
RAZORPAY_MODE=live
FRONTEND_URL=https://ruveracouture.com
ADMIN_URL=https://admin.ruveracouture.com

# Customer & Admin
VITE_API_URL=https://apis.ruveracouture.com
```

## Need Help?

If you encounter issues:
1. Check this guide first
2. Verify all required variables are set
3. Check application logs for specific errors
4. Ensure all services (MySQL, backend, frontend) are running
