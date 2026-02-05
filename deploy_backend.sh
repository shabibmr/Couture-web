#!/bin/bash
set -e

# Backend Deployment Script
echo "=================================================="
echo "📦 Backend API Deployment"
echo "=================================================="

# Configuration
PROJECT_ROOT="/home/ruvera/ruveracouture-web"
DEPLOY_PATH="/var/www/ruvera"

# Copy production .env
echo "📋 Copying backend production .env..."
if [ -f "/home/ruvera/.env.production-backend" ]; then
    cp /home/ruvera/.env.production-backend $PROJECT_ROOT/backend/.env
    echo "✅ Backend .env copied"
else
    echo "❌ Error: /home/ruvera/.env.production-backend not found!"
    exit 1
fi

# Verify RazorPay Live Mode
if grep -q "RAZORPAY_MODE=live" $PROJECT_ROOT/backend/.env; then
    echo "✅ RazorPay Live Mode confirmed"
else
    echo "❌ Error: RazorPay Live Mode not found!"
    exit 1
fi

# Build backend
cd $PROJECT_ROOT/backend
echo "📥 Installing dependencies..."
npm install

echo "🔨 Building backend..."
export NODE_ENV=production
export RAZORPAY_MODE=live
npm run build

# Deploy
echo "🚚 Deploying to $DEPLOY_PATH/backend..."
rsync -av --delete dist/ $DEPLOY_PATH/backend/dist/
cp package.json package-lock.json .env $DEPLOY_PATH/backend/

cd $DEPLOY_PATH/backend
npm install --omit=dev
