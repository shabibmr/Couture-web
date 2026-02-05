#!/bin/bash
set -e

# Admin Panel Deployment Script
echo "=================================================="
echo "📦 Admin Panel Deployment"
echo "=================================================="

# Configuration
PROJECT_ROOT="/home/ruvera/ruveracouture-web"
DEPLOY_PATH="/var/www/ruvera"
API_URL="https://apis.ruveracouture.com/"

# Copy production .env
echo "📋 Copying admin production .env..."
if [ -f "/home/ruvera/.env.production-admin" ]; then
    cp /home/ruvera/.env.production-admin $PROJECT_ROOT/admin/.env.production
    echo "✅ Admin .env.production copied"
else
    echo "⚠️  Warning: /home/ruvera/.env.production-admin not found!"
fi

# Build admin
cd $PROJECT_ROOT/admin
echo "📥 Installing dependencies..."
npm install

echo "🔨 Building admin panel..."
export VITE_API_URL=$API_URL
export NODE_ENV=production
npm run build

# Deploy
echo "🚚 Deploying to $DEPLOY_PATH/admin/dist..."
mkdir -p $DEPLOY_PATH/admin/dist
rsync -av --delete dist/ $DEPLOY_PATH/admin/dist/

echo "✅ Admin panel deployment completed!"
echo "🌐 Admin: https://admin.ruveracouture.com"
echo ""
