#!/bin/bash

# Configuration
API_URL="http://localhost:5000"
DB_USER="user2grey"
DB_PASS="user2grey"
DB_NAME="couture_db"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "=================================================="
echo "   Coupon Module Verification (CURL Manual)"
echo "=================================================="

# 1. Register User
echo -e "\n${GREEN}[1] Registering User...${NC}"
TIMESTAMP=$(date +%s)
EMAIL="curl_user_${TIMESTAMP}@example.com"
PASSWORD="password123"

REGISTER_RES=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"first_name\": \"Curl\",
    \"last_name\": \"Tester\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"phone\": \"9999999999\"
  }")

TOKEN=$(echo $REGISTER_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $REGISTER_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Registration Failed. Response: $REGISTER_RES${NC}"
    exit 1
fi
echo "User: $EMAIL"
echo "Token: ${TOKEN:0:10}..."

# 2. Get Valid Product (via DB for reliability)
echo -e "\n${GREEN}[2] Fetching Product Data...${NC}"
PRODUCT_DATA=$(mysql -u $DB_USER -p$DB_PASS $DB_NAME -N -e "SELECT pv.product_id, pv.id, s.name FROM product_variants pv LEFT JOIN sizes s ON pv.size_id = s.id LIMIT 1")
PRODUCT_ID=$(echo $PRODUCT_DATA | awk '{print $1}')
VARIANT_ID=$(echo $PRODUCT_DATA | awk '{print $2}')
SIZE_NAME=$(echo $PRODUCT_DATA | awk '{print $3}')
[ -z "$SIZE_NAME" ] && SIZE_NAME="M"

echo "Product ID: $PRODUCT_ID"
echo "Variant ID: $VARIANT_ID"
echo "Size: $SIZE_NAME"

# 2b. Replenish Stock
echo -e "\n${GREEN}[2b] Replenishing Stock...${NC}"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "UPDATE inventory SET quantity = 10 WHERE variant_id = '$VARIANT_ID';"

# 3. Create Coupon (Active, 20% off)
echo -e "\n${GREEN}[3] Creating Coupon...${NC}"
COUPON_CODE="CURL${TIMESTAMP}"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "INSERT INTO coupons (id, code, discount_type, discount_value, min_order_value, is_active, valid_from, valid_until, created_at, updated_at) VALUES (UUID(), '$COUPON_CODE', 'percentage', 20.00, 100, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), NOW(), NOW());"
echo "Code: $COUPON_CODE"

# 4. Validate Coupon (Preview)
echo -e "\n${GREEN}[4] Validating Coupon (Preview)...${NC}"
# Note: We send 'items' with 'price' here because validation preview logic now calculates based on item prices.
# In a real app, frontend sends cart items which usually have price.
VALIDATE_PAYLOAD="{
    \"code\": \"$COUPON_CODE\",
    \"cartTotal\": 1000,
    \"customerId\": \"$USER_ID\",
    \"items\": [
        {
            \"product_id\": \"$PRODUCT_ID\",
            \"quantity\": 1,
            \"price\": 1000
        }
    ]
}"

VALIDATE_RES=$(curl -s -X POST "$API_URL/coupons/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$VALIDATE_PAYLOAD")

echo "Response: $VALIDATE_RES"
if [[ $VALIDATE_RES == *"\"isValid\":true"* ]]; then
    # Parse discountAmount. Assuming simplest json structure or grep
    DISCOUNT=$(echo $VALIDATE_RES | grep -o '"discountAmount":[^,]*' | cut -d':' -f2)
    echo -e "${GREEN}PASS: Coupon Valid. Discount Amount: $DISCOUNT${NC}"
else
    echo -e "${RED}FAIL: Validation Failed.${NC}"
fi

# 5. Create Order
echo -e "\n${GREEN}[5] Creating Order...${NC}"
ORDER_PAYLOAD="{
    \"items\": [
        {
            \"product_id\": \"$PRODUCT_ID\",
            \"variant_id\": \"$VARIANT_ID\",
            \"quantity\": 1,
            \"size\": \"$SIZE_NAME\",
            \"price\": 1000
        }
    ],
    \"shipping_address\": { \"name\": \"Curl\", \"address\": \"123 St\", \"city\": \"City\", \"zip\": \"12345\", \"phone\": \"9999999999\" },
    \"billing_address\": { \"name\": \"Curl\", \"address\": \"123 St\", \"city\": \"City\", \"zip\": \"12345\", \"phone\": \"9999999999\" },
    \"payment_method\": \"cod\",
    \"coupon_code\": \"$COUPON_CODE\"
}"

ORDER_RES=$(curl -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$ORDER_PAYLOAD")

getOrderDiscount() {
    # Simple extraction of "discount_amount":"123.45"
    echo $1 | sed -n 's/.*"discount_amount":"\([^"]*\)".*/\1/p'
}

DISCOUNT_FINAL=$(getOrderDiscount "$ORDER_RES")

echo "Response (truncated): ${ORDER_RES:0:200}..."
if [[ $ORDER_RES == *"\"id\":"* ]] && [ ! -z "$DISCOUNT_FINAL" ]; then
    echo -e "${GREEN}PASS: Order Created! Discount Applied: $DISCOUNT_FINAL${NC}"
else
     echo -e "${RED}FAIL: Order Creation Failed or No Discount.${NC}"
     echo $ORDER_RES
fi

echo -e "\n${GREEN}Verification Complete.${NC}"
