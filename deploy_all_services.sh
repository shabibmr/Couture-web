#!/bin/bash
set -e

# Master Deployment Script - Deploys All Services
echo "🚀 Starting Complete Deployment for Ruvera Couture..."
echo "=================================================="
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Make all scripts executable
chmod +x "$SCRIPT_DIR/deploy_backend.sh"
chmod +x "$SCRIPT_DIR/deploy_admin.sh"
chmod +x "$SCRIPT_DIR/deploy_customer.sh"

# Deploy Backend
echo "1️⃣  Deploying Backend API..."
"$SCRIPT_DIR/deploy_backend.sh"

# Deploy Admin Panel
echo "2️⃣  Deploying Admin Panel..."
"$SCRIPT_DIR/deploy_admin.sh"

# Deploy Customer Frontend
echo "3️⃣  Deploying Customer Frontend..."
"$SCRIPT_DIR/deploy_customer.sh"

# Summary
echo "=================================================="
echo "✅ Complete Deployment Finished Successfully!"
echo "=================================================="
echo ""
echo "🌐 Service URLs:"
echo "   Customer:  https://ruveracouture.com"
echo "   Admin:     https://admin.ruveracouture.com"
echo "   API:       https://apis.ruveracouture.com"
echo ""
echo "💳 Payment Configuration:"
echo "   RazorPay:  LIVE MODE ✅"
echo ""
echo "🔧 Backend Status:"
pm2 status ruvera-api
echo ""
