#!/bin/bash
# Manual Wishlist API Test Script
# This script demonstrates a complete wishlist flow with real HTTP calls

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Wishlist API Test ===${NC}\n"

# Configuration
API_BASE="http://localhost:5000/api"
PRODUCT_ID="6417d6d6-af99-459b-bef8-5c5930bf67f6"  # Sample product from database
FIREBASE_UID="pzlJEXx3HhZZ7F469uZrMXLlzp92"  # You'll need to replace this
CUSTOMER_EMAIL="shabibmr@gmail.com"

echo -e "${YELLOW}Note: Make sure the backend server is running on port 5000${NC}\n"

# Step 1: Authenticate
echo -e "${BLUE}Step 1: Authenticating...${NC}"
AUTH_RESPONSE=$(curl -s -X POST "$API_BASE/auth/firebase-sync" \
  -H "Content-Type: application/json" \
  -d "{
    \"uid\": \"$FIREBASE_UID\",
    \"email\": \"$CUSTOMER_EMAIL\"
  }")

echo "Auth Response: $AUTH_RESPONSE"

# Extract token (using jq if available, otherwise manual)
if command -v jq &> /dev/null; then
  TOKEN=$(echo $AUTH_RESPONSE | jq -r '.backendToken')
else
  # Simple extraction without jq (may not work in all cases)
  TOKEN=$(echo $AUTH_RESPONSE | grep -o '"backendToken":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo -e "${RED}Failed to get authentication token${NC}"
  echo "Please check the FIREBASE_UID and CUSTOMER_EMAIL values"
  exit 1
fi

echo -e "${GREEN}✓ Authentication successful${NC}"
echo -e "Token: ${TOKEN:0:30}...\n"

# Step 2: Get initial wishlist
echo -e "${BLUE}Step 2: Getting initial wishlist (GET /api/wishlist)...${NC}"
INITIAL_WISHLIST=$(curl -s -X GET "$API_BASE/wishlist" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
if command -v jq &> /dev/null; then
  echo "$INITIAL_WISHLIST" | jq '.'
else
  echo "$INITIAL_WISHLIST"
fi
echo ""

# Step 3: Add product to wishlist
echo -e "${BLUE}Step 3: Adding product to wishlist (POST /api/wishlist/items)...${NC}"
echo -e "${YELLOW}Request JSON:${NC}"
echo "{
  \"product_id\": \"$PRODUCT_ID\"
}"

ADD_RESPONSE=$(curl -s -X POST "$API_BASE/wishlist/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"product_id\": \"$PRODUCT_ID\"
  }")

echo -e "\n${YELLOW}Response:${NC}"
if command -v jq &> /dev/null; then
  echo "$ADD_RESPONSE" | jq '.'
  WISHLIST_ITEM_ID=$(echo "$ADD_RESPONSE" | jq -r '.item.id')
else
  echo "$ADD_RESPONSE"
  WISHLIST_ITEM_ID=$(echo "$ADD_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
fi

if [ -z "$WISHLIST_ITEM_ID" ] || [ "$WISHLIST_ITEM_ID" == "null" ]; then
  echo -e "${RED}Failed to add product to wishlist${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Product added successfully${NC}"
echo -e "Wishlist Item ID: $WISHLIST_ITEM_ID\n"

# Step 4: Get updated wishlist
echo -e "${BLUE}Step 4: Getting updated wishlist...${NC}"
UPDATED_WISHLIST=$(curl -s -X GET "$API_BASE/wishlist" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
if command -v jq &> /dev/null; then
  echo "$UPDATED_WISHLIST" | jq '.'
else
  echo "$UPDATED_WISHLIST"
fi
echo ""

# Step 5: Verify the product is in the wishlist
echo -e "${BLUE}Step 5: Verifying product is in wishlist...${NC}"
if command -v jq &> /dev/null; then
  ITEM_COUNT=$(echo "$UPDATED_WISHLIST" | jq '.items | length')
  echo -e "Wishlist contains ${GREEN}$ITEM_COUNT${NC} item(s)"
  
  if [ "$ITEM_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Verification successful - product found in wishlist${NC}\n"
  else
    echo -e "${RED}✗ Verification failed - wishlist is empty${NC}\n"
  fi
else
  echo -e "${YELLOW}Install 'jq' for better JSON parsing${NC}\n"
fi

# Step 6: Remove product from wishlist
echo -e "${BLUE}Step 6: Removing product from wishlist (DELETE /api/wishlist/items/$WISHLIST_ITEM_ID)...${NC}"
REMOVE_RESPONSE=$(curl -s -X DELETE "$API_BASE/wishlist/items/$WISHLIST_ITEM_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
if command -v jq &> /dev/null; then
  echo "$REMOVE_RESPONSE" | jq '.'
else
  echo "$REMOVE_RESPONSE"
fi

echo -e "${GREEN}✓ Product removed successfully${NC}\n"

# Step 7: Verify wishlist is empty
echo -e "${BLUE}Step 7: Verifying wishlist is empty...${NC}"
FINAL_WISHLIST=$(curl -s -X GET "$API_BASE/wishlist" \
  -H "Authorization: Bearer $TOKEN")

if command -v jq &> /dev/null; then
  FINAL_COUNT=$(echo "$FINAL_WISHLIST" | jq '.items | length')
  echo -e "Wishlist contains ${GREEN}$FINAL_COUNT${NC} item(s)"
  
  if [ "$FINAL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ Verification successful - wishlist is empty${NC}\n"
  else
    echo -e "${RED}✗ Verification failed - wishlist still has items${NC}\n"
  fi
fi

echo -e "${GREEN}=== All Tests Completed Successfully ===${NC}\n"
