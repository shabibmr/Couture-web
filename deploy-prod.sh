#!/bin/bash

# ========================================
# DEPLOY TO PRODUCTION SERVER
# ========================================
# This script deploys all three apps to production
# Domains:
#   - ruveracouture.com (customer)
#   - admin.ruveracouture.com (admin)
#   - apis.ruveracouture.com (backend)

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
# Production server details
PROD_SERVER="ruveracouture.com"
PROD_USER="deploy"
PROD_PATH="/var/www/ruvera"
BACKUP_PATH="/var/www/backups"

echo "================================================"
echo "Deploy to PRODUCTION Server"
echo "================================================"
echo ""
echo -e "${RED}WARNING: This will deploy to PRODUCTION!${NC}"
echo ""
echo "Server: $PROD_SERVER"
echo "Path: $PROD_PATH"
echo ""
echo "Domains:"
echo "  Customer: https://ruveracouture.com"
echo "  Admin:    https://admin.ruveracouture.com"
echo "  Backend:  https://apis.ruveracouture.com"
echo ""
read -p "Are you sure you want to deploy to production? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Check if SSH connection works
echo -e "\n${YELLOW}Testing SSH connection...${NC}"
if ! ssh -o ConnectTimeout=5 "$PROD_USER@$PROD_SERVER" "echo 'Connection successful'"; then
    echo -e "${RED}✗ Cannot connect to production server${NC}"
    exit 1
fi

# Build first
echo -e "\n${BLUE}Building for production...${NC}"
bash "$ROOT/build-prod.sh"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed, deployment cancelled${NC}"
    exit 1
fi

# ----------------------------------------
# Create Backup
# ----------------------------------------
echo -e "\n${BLUE}Creating backup of current production...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_${TIMESTAMP}"

ssh "$PROD_USER@$PROD_SERVER" << EOF
    mkdir -p $BACKUP_PATH
    tar -czf $BACKUP_PATH/$BACKUP_NAME.tar.gz \
        -C $PROD_PATH \
        backend/dist \
        customer \
        admin \
        2>/dev/null || true
EOF

echo -e "${GREEN}✓ Backup created: $BACKUP_NAME.tar.gz${NC}"

# ----------------------------------------
# Deploy Backend
# ----------------------------------------
echo -e "\n${BLUE}[1/3] Deploying Backend...${NC}"

echo -e "${YELLOW}Uploading backend files...${NC}"
rsync -avz --progress \
    "$ROOT/backend/dist/" \
    "$PROD_USER@$PROD_SERVER:$PROD_PATH/backend/dist/"

rsync -avz \
    "$ROOT/backend/package*.json" \
    "$PROD_USER@$PROD_SERVER:$PROD_PATH/backend/"

# Upload production env file
if [ -f "$ROOT/backend/.env.production" ]; then
    echo -e "${YELLOW}Uploading production environment config...${NC}"
    scp "$ROOT/backend/.env.production" \
        "$PROD_USER@$PROD_SERVER:$PROD_PATH/backend/.env"
fi

echo -e "${YELLOW}Installing production dependencies...${NC}"
ssh "$PROD_USER@$PROD_SERVER" "cd $PROD_PATH/backend && npm install --production"

echo -e "${YELLOW}Restarting backend service...${NC}"
ssh "$PROD_USER@$PROD_SERVER" << EOF
    pm2 restart ruvera-backend-prod || \
    pm2 start $PROD_PATH/backend/dist/app.js \
        --name ruvera-backend-prod \
        --node-args="--max-old-space-size=2048" \
        --env production
    pm2 save
EOF

echo -e "${GREEN}✓ Backend deployed${NC}"

# ----------------------------------------
# Deploy Customer App
# ----------------------------------------
echo -e "\n${BLUE}[2/3] Deploying Customer App...${NC}"

echo -e "${YELLOW}Uploading customer app...${NC}"
rsync -avz --delete --progress \
    "$ROOT/customer/dist/" \
    "$PROD_USER@$PROD_SERVER:$PROD_PATH/customer/"

echo -e "${YELLOW}Setting permissions...${NC}"
ssh "$PROD_USER@$PROD_SERVER" "sudo chown -R www-data:www-data $PROD_PATH/customer"

echo -e "${GREEN}✓ Customer app deployed to https://ruveracouture.com${NC}"

# ----------------------------------------
# Deploy Admin App
# ----------------------------------------
echo -e "\n${BLUE}[3/3] Deploying Admin App...${NC}"

echo -e "${YELLOW}Uploading admin app...${NC}"
rsync -avz --delete --progress \
    "$ROOT/admin/dist/" \
    "$PROD_USER@$PROD_SERVER:$PROD_PATH/admin/"

echo -e "${YELLOW}Setting permissions...${NC}"
ssh "$PROD_USER@$PROD_SERVER" "sudo chown -R www-data:www-data $PROD_PATH/admin"

echo -e "${GREEN}✓ Admin app deployed to https://admin.ruveracouture.com${NC}"

# ----------------------------------------
# Health Check
# ----------------------------------------
echo -e "\n${BLUE}Running health checks...${NC}"

# Check backend
if curl -f -s -o /dev/null https://apis.ruveracouture.com/health; then
    echo -e "${GREEN}✓ Backend API is responding${NC}"
else
    echo -e "${RED}✗ Backend API health check failed${NC}"
fi

# Check customer app
if curl -f -s -o /dev/null https://ruveracouture.com; then
    echo -e "${GREEN}✓ Customer app is responding${NC}"
else
    echo -e "${RED}✗ Customer app health check failed${NC}"
fi

# Check admin app
if curl -f -s -o /dev/null https://admin.ruveracouture.com; then
    echo -e "${GREEN}✓ Admin app is responding${NC}"
else
    echo -e "${RED}✗ Admin app health check failed${NC}"
fi

# ----------------------------------------
# Summary
# ----------------------------------------
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}Production deployment completed!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Live URLs:"
echo -e "  Customer: ${BLUE}https://ruveracouture.com${NC}"
echo -e "  Admin:    ${BLUE}https://admin.ruveracouture.com${NC}"
echo -e "  Backend:  ${BLUE}https://apis.ruveracouture.com${NC}"
echo ""
echo "Backup location: $BACKUP_PATH/$BACKUP_NAME.tar.gz"
echo ""
echo "Useful commands:"
echo "  View logs:    ssh $PROD_USER@$PROD_SERVER 'pm2 logs ruvera-backend-prod'"
echo "  Restart:      ssh $PROD_USER@$PROD_SERVER 'pm2 restart ruvera-backend-prod'"
echo "  Rollback:     ssh $PROD_USER@$PROD_SERVER 'tar -xzf $BACKUP_PATH/$BACKUP_NAME.tar.gz -C $PROD_PATH'"
echo ""
echo -e "${YELLOW}Post-deployment checklist:${NC}"
echo "  ☐ Test user authentication"
echo "  ☐ Test product browsing"
echo "  ☐ Test cart and checkout"
echo "  ☐ Test payment gateway (with test card)"
echo "  ☐ Verify SSL certificates"
echo "  ☐ Check monitoring/logging"
echo "  ☐ Notify team of deployment"
