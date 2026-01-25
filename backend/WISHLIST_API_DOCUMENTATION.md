# Wishlist API Testing Guide

## Expected JSON Formats

### 1. Add Product to Wishlist
**Endpoint**: `POST /api/wishlist/items`
**Authentication**: Required (Bearer token)
**Request Body**:
```json
{
  "product_id": "uuid-string"
}
```

**Example Success Response (201)**:
```json
{
  "message": "Product added to wishlist",
  "item": {
    "id": "generated-uuid",
    "wishlist_id": "wishlist-uuid",
    "product_id": "product-uuid",
    "added_at": "2026-01-24T15:42:59.000Z"
  }
}
```

**Example Already Exists Response (200)**:
```json
{
  "message": "Product already in wishlist",
  "item": {
    "id": "existing-uuid",
    "wishlist_id": "wishlist-uuid",
    "product_id": "product-uuid",
    "added_at": "2026-01-24T15:40:27.000Z"
  }
}
```

### 2. Get Wishlist
**Endpoint**: `GET /api/wishlist`
**Authentication**: Required (Bearer token)
**Request Body**: None

**Example Response**:
```json
{
  "id": "wishlist-uuid",
  "customer_id": "customer-uuid",
  "created_at": "2026-01-24T15:40:00.000Z",
  "updated_at": "2026-01-24T15:42:59.000Z",
  "items": [
    {
      "id": "item-uuid",
      "wishlist_id": "wishlist-uuid",
      "product_id": "product-uuid",
      "added_at": "2026-01-24T15:40:27.000Z",
      "Product": {
        "id": "product-uuid",
        "name": "Product Name",
        "slug": "product-slug",
        "base_price": "1299.00",
        "sale_price": "999.00",
        "featured_image": "base64-image-data",
        "images": [
          {
            "id": "image-uuid",
            "image_data": "base64-image-data",
            "display_order": 1
          }
        ]
      }
    }
  ]
}
```

### 3. Remove Product from Wishlist
**Endpoint**: `DELETE /api/wishlist/items/:id`
**Authentication**: Required (Bearer token)
**Request Body**: None
**URL Parameter**: `id` - The wishlist item ID (not product ID)

**Example Response**:
```json
{
  "message": "Item removed from wishlist"
}
```

### 4. Clear Wishlist
**Endpoint**: `DELETE /api/wishlist/clear`
**Authentication**: Required (Bearer token)
**Request Body**: None

**Example Response**:
```json
{
  "message": "Wishlist cleared"
}
```

## Sample cURL Commands

### Prerequisites
1. Obtain authentication token by logging in
2. Get a valid product ID from the database

### Example Flow

#### Step 1: Authenticate (using Firebase sync)
```bash
curl -X POST http://localhost:5000/api/auth/firebase-sync \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "firebase-user-id",
    "email": "user@example.com"
  }'
```

Save the `backendToken` from the response.

#### Step 2: Get Initial Wishlist
```bash
curl -X GET http://localhost:5000/api/wishlist \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Step 3: Add Product to Wishlist
```bash
curl -X POST http://localhost:5000/api/wishlist/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "product_id": "PRODUCT_UUID_HERE"
  }'
```

#### Step 4: View Updated Wishlist
```bash
curl -X GET http://localhost:5000/api/wishlist \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Step 5: Remove Product from Wishlist
```bash
curl -X DELETE http://localhost:5000/api/wishlist/items/WISHLIST_ITEM_UUID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing with Real Data

Replace the following placeholders with actual values from your database:
- `YOUR_TOKEN_HERE` - Token from authentication response
- `PRODUCT_UUID_HERE` - A valid product UUID from the products table
- `WISHLIST_ITEM_UUID` - The wishlist item ID from the add response

## Error Responses

### 400 Bad Request
```json
{
  "message": "product_id is required"
}
```

### 401 Unauthorized
```json
{
  "message": "No token provided"
}
```

### 404 Not Found
```json
{
  "message": "Wishlist not found"
}
```
or
```json
{
  "message": "Item not found in wishlist"
}
```

### 500 Server Error
```json
{
  "message": "Server error"
}
```
