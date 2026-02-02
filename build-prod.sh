#!/bin/bash

# ========================================
# BUILD ALL APPS - PRODUCTION
# ========================================
# This script builds all three apps for production environment
# Domains:
#   - ruveracouture.com (customer)
#   - admin.ruveracouture.com (admin)
#   - apis.ruveracouture.com (backend)

set -e  # Exit on error

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "================================================"
echo "Building Ruvera Couture - PRODUCTION"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Confirm production build
echo -e "${RED}WARNING: This will build for PRODUCTION environment${NC}"
echo "Domains:"
echo "  Customer: https://ruveracouture.com"
echo "  Admin:    https://admin.ruveracouture.com"
echo "  Backend:  https://apis.ruveracouture.com"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Build cancelled."
    exit 0
fi

# ----------------------------------------
# Build Backend
# ----------------------------------------
echo -e "\n${BLUE}[1/3] Building Backend...${NC}"
cd "$ROOT/backend"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install --production=false
fi

echo -e "${YELLOW}Running TypeScript compilation...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend build successful${NC}"
else
    echo -e "${RED}✗ Backend build failed${NC}"
    exit 1
fi

# ----------------------------------------
# Build Customer App
# ----------------------------------------
echo -e "\n${BLUE}[2/3] Building Customer App (Production)...${NC}"
cd "$ROOT/customer"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing customer dependencies...${NC}"
    npm install
fi

echo -e "${YELLOW}Building with production config...${NC}"
npm run build -- --mode production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Customer app build successful${NC}"
    # Display build size
    if [ -d "dist" ]; then
        SIZE=$(du -sh dist | cut -f1)
        echo -e "${YELLOW}  Build size: $SIZE${NC}"
    fi
else
    echo -e "${RED}✗ Customer app build failed${NC}"
    exit 1
fi

# ----------------------------------------
# Build Admin App
# ----------------------------------------
echo -e "\n${BLUE}[3/3] Building Admin App (Production)...${NC}"
cd "$ROOT/admin"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing admin dependencies...${NC}"
    npm install
fi

echo -e "${YELLOW}Building with production config...${NC}"
npm run build -- --mode production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Admin app build successful${NC}"
    # Display build size
    if [ -d "dist" ]; then
        SIZE=$(du -sh dist | cut -f1)
        echo -e "${YELLOW}  Build size: $SIZE${NC}"
    fi
else
    echo -e "${RED}✗ Admin app build failed${NC}"
    exit 1
fi

# ----------------------------------------
# Create deployment package
# ----------------------------------------
echo -e "\n${BLUE}Creating deployment package...${NC}"
cd "$ROOT"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="ruvera-couture-prod-${TIMESTAMP}.tar.gz"

tar -czf "$PACKAGE_NAME" \
    --exclude='node_modules' \
    --exclude='*.log' \
    backend/dist \
    backend/package.json \
    backend/package-lock.json \
    backend/.env.production \
    customer/dist \
    admin/dist

if [ $? -eq 0 ]; then
    PACKAGE_SIZE=$(du -sh "$PACKAGE_NAME" | cut -f1)
    echo -e "${GREEN}✓ Deployment package created: $PACKAGE_NAME ($PACKAGE_SIZE)${NC}"
else
    echo -e "${RED}✗ Failed to create deployment package${NC}"
    exit 1
fi

# ----------------------------------------
# Build Summary
# ----------------------------------------
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}Production build completed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Build artifacts:"
echo "  Backend:  $ROOT/backend/dist/"
echo "  Customer: $ROOT/customer/dist/"
echo "  Admin:    $ROOT/admin/dist/"
echo ""
echo "Deployment package: $PACKAGE_NAME"
echo ""
echo "Next steps:"
echo "  1. Test builds locally"
echo "  2. Review .env.production settings"
echo "  3. Deploy using './deploy-prod.sh'"
echo ""
echo -e "${YELLOW}IMPORTANT:${NC}"
echo "  - Ensure production .env files are configured"
echo "  - Verify SSL certificates are in place"
echo "  - Test payment gateway with live credentials"
echo "  - Set up monitoring and logging"
