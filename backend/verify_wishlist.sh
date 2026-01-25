#!/bin/bash

BASE_URL="http://localhost:5000/api"
PRODUCT_ID="a308d5d7-7256-4774-bfc1-0b8e463a3b6e"

echo "1. Registering/Logging in test user..."
# Try to login first, if fails register
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test_wishlist@example.com", "password":"Password123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(0)); console.log(data.token || '')")

if [ -z "$TOKEN" ]; then
    echo "Login failed, trying to register..."
    REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
      -H "Content-Type: application/json" \
      -d '{"email":"test_wishlist@example.com", "password":"Password123!", "first_name":"Test", "last_name":"User"}')
    TOKEN=$(echo $REGISTER_RESPONSE | node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(0)); console.log(data.token || '')")
fi

if [ -z "$TOKEN" ]; then
    echo "Failed to get token!"
    exit 1
fi

echo "Auth Token obtained."

echo -e "\n2. GET Wishlist (Initial)"
curl -s -X GET "$BASE_URL/wishlist" \
  -H "Authorization: Bearer $TOKEN" | json_pp

echo -e "\n3. POST Add Item to Wishlist"
ADD_RESPONSE=$(curl -s -X POST "$BASE_URL/wishlist/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"product_id\":\"$PRODUCT_ID\"}")
echo $ADD_RESPONSE | json_pp

ITEM_ID=$(echo $ADD_RESPONSE | node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(0)); console.log(data.item ? data.item.id : '')")

echo -e "\n4. GET Wishlist (After adding)"
curl -s -X GET "$BASE_URL/wishlist" \
  -H "Authorization: Bearer $TOKEN" | json_pp

echo -e "\n5. DELETE Item from Wishlist ($ITEM_ID)"
if [ ! -z "$ITEM_ID" ]; then
    curl -s -X DELETE "$BASE_URL/wishlist/items/$ITEM_ID" \
      -H "Authorization: Bearer $TOKEN" | json_pp
else
    echo "No Item ID to delete!"
fi

echo -e "\n6. GET Wishlist (After deleting)"
curl -s -X GET "$BASE_URL/wishlist" \
  -H "Authorization: Bearer $TOKEN" | json_pp

echo -e "\n7. CLEAR Wishlist"
curl -s -X DELETE "$BASE_URL/wishlist/clear" \
  -H "Authorization: Bearer $TOKEN" | json_pp

echo -e "\n8. GET Wishlist (Final)"
curl -s -X GET "$BASE_URL/wishlist" \
  -H "Authorization: Bearer $TOKEN" | json_pp
