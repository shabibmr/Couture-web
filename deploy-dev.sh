#!/bin/bash

# ========================================
# DEPLOY TO DEVELOPMENT SERVER
# ========================================
# This script deploys all three apps to development server

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ----------------------------------------
# Configuration
# ----------------------------------------
# Update these with your development server details
DEV_SERVER="dev.ruveracouture.com"
DEV_USER="deploy"
DEV_PATH="/var/www/ruvera-dev"

echo "================================================"
echo "Deploy to Development Server"
echo "================================================"
echo ""
echo "Server: $DEV_SERVER"
echo "Path: $DEV_PATH"
echo ""

# Check if SSH connection works
echo -e "${YELLOW}Testing SSH connection...${NC}"
if ! ssh -o ConnectTimeout=5 "$DEV_USER@$DEV_SERVER" "echo 'Connection successful'"; then
    echo -e "${RED}✗ Cannot connect to development server${NC}"
    echo "Please check:"
    echo "  1. Server address is correct"
    echo "  2. SSH keys are set up"
    echo "  3. Server is accessible"
    exit 1
fi

# Build first
echo -e "\n${BLUE}Building for development...${NC}"
bash "$ROOT/build-dev.sh"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed, deployment cancelled${NC}"
    exit 1
fi

# ----------------------------------------
# Deploy Backend
# ----------------------------------------
echo -e "\n${BLUE}[1/3] Deploying Backend...${NC}"

echo -e "${YELLOW}Uploading backend files...${NC}"
rsync -avz --progress \
    "$ROOT/backend/dist/" \
    "$DEV_USER@$DEV_SERVER:$DEV_PATH/backend/dist/"

rsync -avz \
    "$ROOT/backend/package*.json" \
    "$DEV_USER@$DEV_SERVER:$DEV_PATH/backend/"

echo -e "${YELLOW}Installing production dependencies...${NC}"
ssh "$DEV_USER@$DEV_SERVER" "cd $DEV_PATH/backend && npm install --production"

echo -e "${YELLOW}Restarting backend service...${NC}"
ssh "$DEV_USER@$DEV_SERVER" "pm2 restart ruvera-backend-dev || pm2 start $DEV_PATH/backend/dist/app.js --name ruvera-backend-dev"

echo -e "${GREEN}✓ Backend deployed${NC}"

# ----------------------------------------
# Deploy Customer App
# ----------------------------------------
echo -e "\n${BLUE}[2/3] Deploying Customer App...${NC}"

echo -e "${YELLOW}Uploading customer app...${NC}"
rsync -avz --delete --progress \
    "$ROOT/customer/dist/" \
    "$DEV_USER@$DEV_SERVER:$DEV_PATH/customer/"

echo -e "${GREEN}✓ Customer app deployed${NC}"

# ----------------------------------------
# Deploy Admin App
# ----------------------------------------
echo -e "\n${BLUE}[3/3] Deploying Admin App...${NC}"

echo -e "${YELLOW}Uploading admin app...${NC}"
rsync -avz --delete --progress \
    "$ROOT/admin/dist/" \
    "$DEV_USER@$DEV_SERVER:$DEV_PATH/admin/"

echo -e "${GREEN}✓ Admin app deployed${NC}"

# ----------------------------------------
# Summary
# ----------------------------------------
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}Deployment to development server completed!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Services:"
echo "  Backend:  http://$DEV_SERVER:5000"
echo "  Customer: http://dev.ruveracouture.com"
echo "  Admin:    http://admin-dev.ruveracouture.com"
echo ""
echo "Useful commands:"
echo "  View logs:     ssh $DEV_USER@$DEV_SERVER 'pm2 logs ruvera-backend-dev'"
echo "  Restart:       ssh $DEV_USER@$DEV_SERVER 'pm2 restart ruvera-backend-dev'"
echo "  Check status:  ssh $DEV_USER@$DEV_SERVER 'pm2 status'"
