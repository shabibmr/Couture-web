#!/bin/bash

# ========================================
# BUILD ALL APPS - DEVELOPMENT
# ========================================
# This script builds all three apps for development environment

set -e  # Exit on error

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "================================================"
echo "Building Ruvera Couture - DEVELOPMENT"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ----------------------------------------
# Build Backend
# ----------------------------------------
echo -e "\n${BLUE}[1/3] Building Backend...${NC}"
cd "$ROOT/backend"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
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
echo -e "\n${BLUE}[2/3] Building Customer App (Development)...${NC}"
cd "$ROOT/customer"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing customer dependencies...${NC}"
    npm install
fi

echo -e "${YELLOW}Building with development config...${NC}"
npm run build -- --mode development

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Customer app build successful${NC}"
else
    echo -e "${RED}✗ Customer app build failed${NC}"
    exit 1
fi

# ----------------------------------------
# Build Admin App
# ----------------------------------------
echo -e "\n${BLUE}[3/3] Building Admin App (Development)...${NC}"
cd "$ROOT/admin"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing admin dependencies...${NC}"
    npm install
fi

echo -e "${YELLOW}Building with development config...${NC}"
npm run build -- --mode development

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Admin app build successful${NC}"
else
    echo -e "${RED}✗ Admin app build failed${NC}"
    exit 1
fi

# ----------------------------------------
# Build Summary
# ----------------------------------------
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}All builds completed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Build artifacts locations:"
echo "  Backend:  $ROOT/backend/dist/"
echo "  Customer: $ROOT/customer/dist/"
echo "  Admin:    $ROOT/admin/dist/"
echo ""
echo "Next steps:"
echo "  - Review build artifacts"
echo "  - Test builds locally with 'npm run preview'"
echo "  - Deploy using './deploy-dev.sh'"
