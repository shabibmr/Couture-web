#!/bin/bash
set -e

# Customer Frontend Deployment Script
echo "=================================================="
echo "📦 Customer Frontend Deployment"
echo "=================================================="

# Configuration
PROJECT_ROOT="/home/ruvera/ruveracouture-web"
DEPLOY_PATH="/var/www/ruvera"
API_URL="https://apis.ruveracouture.com/"

# Copy production .env
echo "📋 Copying customer production .env..."
if [ -f "/home/ruvera/.env.production-customer" ]; then
    cp /home/ruvera/.env.production-customer $PROJECT_ROOT/customer/.env.production
    echo "✅ Customer .env.production copied"
else
    echo "⚠️  Warning: /home/ruvera/.env.production-customer not found!"
fi

# Build customer
cd $PROJECT_ROOT/customer
echo "📥 Installing dependencies..."
npm install

echo "🔨 Building customer frontend..."
export VITE_API_URL=$API_URL
export NODE_ENV=production
npm run build

# Deploy
echo "🚚 Deploying to $DEPLOY_PATH/customer/dist..."
mkdir -p $DEPLOY_PATH/customer/dist
rsync -av --delete dist/ $DEPLOY_PATH/customer/dist/

echo "✅ Customer frontend deployment completed!"
echo "🌐 Customer: https://ruveracouture.com"
echo ""
