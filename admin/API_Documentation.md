# Couture Admin - Complete API Documentation

This document provides a comprehensive list of all API calls used in the Couture Admin application, organized by module. Each endpoint includes the HTTP method, path, query parameters, and sample JSON request/response data.

**Base URL**: `http://localhost:5000/api` (configurable via `VITE_API_URL`)

**Authentication**: All API requests (except login) include an Authorization header with a Bearer token stored in localStorage.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Dashboard](#2-dashboard)
3. [Products](#3-products)
4. [Categories](#4-categories)
5. [Orders](#5-orders)
6. [Customers](#6-customers)
7. [Coupons](#7-coupons)
8. [Banners](#8-banners)
9. [Payments](#9-payments)
10. [Inventory/Stock](#10-inventorystock)

---

## 1. Authentication

### 1.1 Admin Login

**Endpoint**: `POST /auth/admin/login`

**Description**: Authenticates admin user and returns JWT token

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123123"
}
```

**Response** (Success - 200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Response** (Error - 401):
```json
{
  "message": "Invalid credentials"
}
```

---

## 2. Dashboard

### 2.1 Get Dashboard Statistics

**Endpoint**: `GET /dashboard/stats`

**Description**: Retrieves dashboard statistics including revenue, orders, customers, and growth metrics

**Query Parameters**: None

**Response** (Success - 200):
```json
{
  "revenue": 125000,
  "orders": 342,
  "customers": 156,
  "growth": 12.5
}
```

---

## 3. Products

### 3.1 Get Products List (Paginated)

**Endpoint**: `GET /products`

**Description**: Retrieves paginated list of products with optional filters

**Query Parameters**:
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page
- `status` (string, optional) - Filter by status: `all`, `active`, `inactive`

**Example**: `GET /products?page=1&limit=10&status=all`

**Response** (Success - 200):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Structured Wool Blazer",
      "slug": "structured-wool-blazer",
      "description": "Premium wool blazer with structured shoulders",
      "base_price": 12500,
      "category_id": 3,
      "featured_image": "https://example.com/images/blazer.jpg",
      "is_active": true,
      "is_new_arrival": false,
      "is_featured": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:25:00Z",
      "variants": [
        {
          "id": 1,
          "sku": "WB-BLK-M",
          "Size": {
            "id": 2,
            "name": "M"
          },
          "Color": {
            "id": 1,
            "name": "Black"
          }
        }
      ],
      "images": [
        {
          "id": 1,
          "image_url": "https://example.com/images/blazer-1.jpg",
          "sort_order": 1
        }
      ]
    }
  ],
  "page": 1,
  "pages": 5,
  "total": 48,
  "limit": 10
}
```

### 3.2 Get Product by ID

**Endpoint**: `GET /products/id/:id`

**Description**: Retrieves a single product with full details including variants and images

**Path Parameters**:
- `id` (integer) - Product ID

**Example**: `GET /products/id/1`

**Response** (Success - 200):
```json
{
  "id": 1,
  "name": "Structured Wool Blazer",
  "slug": "structured-wool-blazer",
  "description": "Premium wool blazer with structured shoulders and classic tailoring",
  "base_price": 12500,
  "category_id": 3,
  "featured_image": "https://example.com/images/blazer.jpg",
  "is_active": true,
  "is_new_arrival": false,
  "is_featured": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:25:00Z",
  "variants": [
    {
      "id": 1,
      "sku": "WB-BLK-M",
      "price": 12500,
      "Size": {
        "id": 2,
        "name": "M"
      },
      "Color": {
        "id": 1,
        "name": "Black"
      }
    },
    {
      "id": 2,
      "sku": "WB-BLK-L",
      "price": 12500,
      "Size": {
        "id": 3,
        "name": "L"
      },
      "Color": {
        "id": 1,
        "name": "Black"
      }
    }
  ],
  "images": [
    {
      "id": 1,
      "image_url": "https://example.com/images/blazer-1.jpg",
      "sort_order": 1
    },
    {
      "id": 2,
      "image_url": "https://example.com/images/blazer-2.jpg",
      "sort_order": 2
    }
  ]
}
```

### 3.3 Create Product

**Endpoint**: `POST /products`

**Description**: Creates a new product

**Request Body**:
```json
{
  "name": "Silk Evening Gown",
  "slug": "silk-evening-gown",
  "description": "Elegant silk gown perfect for formal occasions",
  "base_price": 25000,
  "category_id": 5,
  "mainImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "additionalImages": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "",
    ""
  ],
  "sizes": ["S", "M", "L"],
  "is_active": true,
  "is_new_arrival": true,
  "is_featured": false
}
```

**Response** (Success - 201):
```json
{
  "id": 49,
  "name": "Silk Evening Gown",
  "slug": "silk-evening-gown",
  "description": "Elegant silk gown perfect for formal occasions",
  "base_price": 25000,
  "category_id": 5,
  "featured_image": "https://example.com/images/evening-gown.jpg",
  "is_active": true,
  "is_new_arrival": true,
  "is_featured": false,
  "created_at": "2024-01-25T03:31:28Z",
  "updated_at": "2024-01-25T03:31:28Z"
}
```

### 3.4 Update Product

**Endpoint**: `PUT /products/:id`

**Description**: Updates an existing product

**Path Parameters**:
- `id` (integer) - Product ID

**Request Body**:
```json
{
  "name": "Structured Wool Blazer - Updated",
  "base_price": 13500,
  "description": "Premium Italian wool blazer with modern tailoring",
  "category_id": 3,
  "is_active": true,
  "is_new_arrival": false,
  "is_featured": true
}
```

**Response** (Success - 200):
```json
{
  "id": 1,
  "name": "Structured Wool Blazer - Updated",
  "slug": "structured-wool-blazer",
  "base_price": 13500,
  "category_id": 3,
  "is_active": true,
  "updated_at": "2024-01-25T04:15:00Z",
  "message": "Product updated successfully"
}
```

### 3.5 Delete Product

**Endpoint**: `DELETE /products/:id`

**Description**: Deletes a product

**Path Parameters**:
- `id` (integer) - Product ID

**Example**: `DELETE /products/1`

**Response** (Success - 200):
```json
{
  "message": "Product deleted successfully"
}
```

### 3.6 Get Categories (for Product Form)

**Endpoint**: `GET /products/categories`

**Description**: Retrieves all categories for product category dropdown

**Query Parameters**: None

**Response** (Success - 200):
```json
[
  {
    "id": 1,
    "name": "Dresses",
    "slug": "dresses",
    "description": "Elegant dresses for all occasions",
    "sort_order": 1,
    "is_active": true
  },
  {
    "id": 2,
    "name": "Tops",
    "slug": "tops",
    "description": "Stylish tops and blouses",
    "sort_order": 2,
    "is_active": true
  },
  {
    "id": 3,
    "name": "Outerwear",
    "slug": "outerwear",
    "description": "Coats, jackets, and blazers",
    "sort_order": 3,
    "is_active": true
  }
]
```

### 3.7 Get Sizes (for Product Form)

**Endpoint**: `GET /products/sizes`

**Description**: Retrieves all available sizes for product variants

**Query Parameters**: None

**Response** (Success - 200):
```json
[
  {
    "id": 1,
    "name": "XS"
  },
  {
    "id": 2,
    "name": "S"
  },
  {
    "id": 3,
    "name": "M"
  },
  {
    "id": 4,
    "name": "L"
  },
  {
    "id": 5,
    "name": "XL"
  }
]
```

---

## 4. Categories

### 4.1 Get All Categories

**Endpoint**: `GET /products/categories`

**Description**: Retrieves all product categories

**Query Parameters**: None

**Response** (Success - 200):
```json
[
  {
    "id": 1,
    "name": "Dresses",
    "slug": "dresses",
    "description": "Elegant dresses for all occasions",
    "sort_order": 1,
    "is_active": true,
    "created_at": "2024-01-10T08:00:00Z",
    "updated_at": "2024-01-10T08:00:00Z"
  },
  {
    "id": 2,
    "name": "Tops",
    "slug": "tops",
    "description": "Stylish tops and blouses",
    "sort_order": 2,
    "is_active": true,
    "created_at": "2024-01-10T08:05:00Z",
    "updated_at": "2024-01-10T08:05:00Z"
  }
]
```

### 4.2 Create Category

**Endpoint**: `POST /products/categories`

**Description**: Creates a new product category

**Request Body**:
```json
{
  "name": "Accessories",
  "slug": "accessories",
  "description": "Bags, scarves, and jewelry",
  "status": "Active"
}
```

**Response** (Success - 201):
```json
{
  "id": 6,
  "name": "Accessories",
  "slug": "accessories",
  "description": "Bags, scarves, and jewelry",
  "sort_order": 6,
  "is_active": true,
  "created_at": "2024-01-25T03:31:28Z",
  "updated_at": "2024-01-25T03:31:28Z"
}
```

### 4.3 Update Category

**Endpoint**: `PUT /products/categories/:id`

**Description**: Updates an existing category

**Path Parameters**:
- `id` (integer) - Category ID

**Request Body**:
```json
{
  "name": "Dresses & Gowns",
  "slug": "dresses-gowns",
  "description": "Elegant dresses and evening gowns",
  "status": "Active"
}
```

**Response** (Success - 200):
```json
{
  "id": 1,
  "name": "Dresses & Gowns",
  "slug": "dresses-gowns",
  "description": "Elegant dresses and evening gowns",
  "is_active": true,
  "updated_at": "2024-01-25T04:20:00Z",
  "message": "Category updated successfully"
}
```

### 4.4 Delete Category

**Endpoint**: `DELETE /products/categories/:id`

**Description**: Deletes a category

**Path Parameters**:
- `id` (integer) - Category ID

**Example**: `DELETE /products/categories/6`

**Response** (Success - 200):
```json
{
  "message": "Category deleted successfully"
}
```

**Response** (Error - 400):
```json
{
  "message": "Cannot delete category with associated products"
}
```

---

## 5. Orders

### 5.1 Get Orders List (Paginated)

**Endpoint**: `GET /orders`

**Description**: Retrieves paginated list of orders

**Query Parameters**:
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page

**Example**: `GET /orders?page=1&limit=10`

**Response** (Success - 200):
```json
{
  "data": [
    {
      "id": "ORD-2024-00342",
      "customer": "Priya Sharma",
      "customer_email": "priya.sharma@example.com",
      "date": "2024-01-24",
      "items": 3,
      "total": 38500,
      "status": "confirmed",
      "shipping_address": {
        "street": "123 MG Road",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560001",
        "country": "India"
      },
      "created_at": "2024-01-24T14:30:00Z",
      "updated_at": "2024-01-24T15:00:00Z"
    },
    {
      "id": "ORD-2024-00341",
      "customer": "Rahul Verma",
      "customer_email": "rahul.verma@example.com",
      "date": "2024-01-24",
      "items": 1,
      "total": 12500,
      "status": "pending",
      "shipping_address": {
        "street": "456 Park Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "country": "India"
      },
      "created_at": "2024-01-24T12:15:00Z",
      "updated_at": "2024-01-24T12:15:00Z"
    }
  ],
  "page": 1,
  "pages": 35,
  "total": 342,
  "limit": 10
}
```

### 5.2 Get Order by ID

**Endpoint**: `GET /orders/:id`

**Description**: Retrieves detailed information for a specific order

**Path Parameters**:
- `id` (string) - Order ID

**Example**: `GET /orders/ORD-2024-00342`

**Response** (Success - 200):
```json
{
  "id": "ORD-2024-00342",
  "order_number": "ORD-2024-00342",
  "customer_id": 25,
  "customer": {
    "id": 25,
    "first_name": "Priya",
    "last_name": "Sharma",
    "email": "priya.sharma@example.com",
    "phone": "+91-9876543210"
  },
  "status": "confirmed",
  "subtotal": 38500,
  "tax": 3465,
  "shipping": 0,
  "total": 41965,
  "payment_method": "razorpay",
  "payment_status": "paid",
  "items": [
    {
      "id": 1,
      "product_variant_id": 15,
      "product_name": "Silk Evening Gown",
      "variant_sku": "SEG-GLD-M",
      "size": "M",
      "color": "Gold",
      "quantity": 1,
      "unit_price": 25000,
      "total_price": 25000,
      "image": "https://example.com/images/gown.jpg"
    },
    {
      "id": 2,
      "product_variant_id": 8,
      "product_name": "Cashmere Wrap",
      "variant_sku": "CW-BLK-OS",
      "size": "One Size",
      "color": "Black",
      "quantity": 1,
      "unit_price": 13500,
      "total_price": 13500,
      "image": "https://example.com/images/wrap.jpg"
    }
  ],
  "shipping_address": {
    "street": "123 MG Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "country": "India"
  },
  "billing_address": {
    "street": "123 MG Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "country": "India"
  },
  "tracking_number": "TRK123456789",
  "created_at": "2024-01-24T14:30:00Z",
  "updated_at": "2024-01-24T15:00:00Z"
}
```

---

## 6. Customers

### 6.1 Get Customers List (Paginated)

**Endpoint**: `GET /customers`

**Description**: Retrieves paginated list of customers with optional search

**Query Parameters**:
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page
- `search` (string, optional) - Search by name or email

**Example**: `GET /customers?page=1&limit=10&search=priya`

**Response** (Success - 200):
```json
{
  "data": [
    {
      "id": 25,
      "first_name": "Priya",
      "last_name": "Sharma",
      "email": "priya.sharma@example.com",
      "phone": "+91-9876543210",
      "avatar": "https://example.com/avatars/25.jpg",
      "status": "VIP",
      "created_at": "2023-08-15T10:00:00Z",
      "updated_at": "2024-01-24T15:00:00Z"
    },
    {
      "id": 42,
      "first_name": "Rahul",
      "last_name": "Verma",
      "email": "rahul.verma@example.com",
      "phone": "+91-9876543211",
      "avatar": null,
      "status": "Regular",
      "created_at": "2023-11-20T14:30:00Z",
      "updated_at": "2024-01-24T12:15:00Z"
    }
  ],
  "page": 1,
  "pages": 16,
  "total": 156,
  "limit": 10
}
```

### 6.2 Get Customer by ID

**Endpoint**: `GET /customers/:id`

**Description**: Retrieves detailed customer information including order history

**Path Parameters**:
- `id` (integer) - Customer ID

**Example**: `GET /customers/25`

**Response** (Success - 200):
```json
{
  "id": 25,
  "first_name": "Priya",
  "last_name": "Sharma",
  "email": "priya.sharma@example.com",
  "phone": "+91-9876543210",
  "avatar": "https://example.com/avatars/25.jpg",
  "status": "VIP",
  "total_spent": 125000,
  "orders_count": 12,
  "addresses": [
    {
      "id": 1,
      "type": "shipping",
      "street": "123 MG Road",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001",
      "country": "India",
      "is_default": true
    }
  ],
  "recent_orders": [
    {
      "id": "ORD-2024-00342",
      "date": "2024-01-24",
      "total": 41965,
      "status": "confirmed"
    },
    {
      "id": "ORD-2024-00298",
      "date": "2024-01-18",
      "total": 28500,
      "status": "delivered"
    }
  ],
  "created_at": "2023-08-15T10:00:00Z",
  "updated_at": "2024-01-24T15:00:00Z"
}
```

---

## 7. Coupons

### 7.1 Get All Coupons

**Endpoint**: `GET /coupons`

**Description**: Retrieves all discount coupons

**Query Parameters**: None

**Response** (Success - 200):
```json
[
  {
    "id": 1,
    "code": "SUMMER2024",
    "type": "percentage",
    "value": 20,
    "minOrder": 5000,
    "limit": 100,
    "usage": 45,
    "validFrom": "2024-04-01",
    "validUntil": "2024-06-30",
    "isActive": true,
    "created_at": "2024-03-15T10:00:00Z",
    "updated_at": "2024-03-15T10:00:00Z"
  },
  {
    "id": 2,
    "code": "FIRST500",
    "type": "fixed",
    "value": 500,
    "minOrder": 2000,
    "limit": 500,
    "usage": 347,
    "validFrom": "2024-01-01",
    "validUntil": "2024-12-31",
    "isActive": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-20T14:30:00Z"
  }
]
```

### 7.2 Create Coupon

**Endpoint**: `POST /coupons`

**Description**: Creates a new discount coupon

**Request Body**:
```json
{
  "code": "WINTER25",
  "type": "percentage",
  "value": 25,
  "minOrder": 10000,
  "limit": 50,
  "validFrom": "2024-12-01",
  "validUntil": "2025-01-31",
  "isActive": true
}
```

**Response** (Success - 201):
```json
{
  "id": 3,
  "code": "WINTER25",
  "type": "percentage",
  "value": 25,
  "minOrder": 10000,
  "limit": 50,
  "usage": 0,
  "validFrom": "2024-12-01",
  "validUntil": "2025-01-31",
  "isActive": true,
  "created_at": "2024-01-25T03:31:28Z",
  "updated_at": "2024-01-25T03:31:28Z"
}
```

### 7.3 Update Coupon

**Endpoint**: `PUT /coupons/:id`

**Description**: Updates an existing coupon

**Path Parameters**:
- `id` (integer) - Coupon ID

**Request Body**:
```json
{
  "code": "SUMMER2024",
  "type": "percentage",
  "value": 25,
  "minOrder": 5000,
  "limit": 150,
  "validFrom": "2024-04-01",
  "validUntil": "2024-07-31",
  "isActive": true
}
```

**Response** (Success - 200):
```json
{
  "id": 1,
  "code": "SUMMER2024",
  "value": 25,
  "limit": 150,
  "validUntil": "2024-07-31",
  "updated_at": "2024-01-25T04:25:00Z",
  "message": "Coupon updated successfully"
}
```

### 7.4 Delete Coupon

**Endpoint**: `DELETE /coupons/:id`

**Description**: Deletes a coupon

**Path Parameters**:
- `id` (integer) - Coupon ID

**Example**: `DELETE /coupons/3`

**Response** (Success - 200):
```json
{
  "message": "Coupon deleted successfully"
}
```

---

## 8. Banners

### 8.1 Get All Banners

**Endpoint**: `GET /banners`

**Description**: Retrieves all homepage banners

**Query Parameters**: None

**Response** (Success - 200):
```json
[
  {
    "id": 1,
    "title": "Summer Collection 2024",
    "image": "https://example.com/banners/summer-2024.jpg",
    "link": "/collections/summer-2024",
    "start": "2024-04-01",
    "end": "2024-06-30",
    "order": 1,
    "active": true,
    "created_at": "2024-03-15T10:00:00Z",
    "updated_at": "2024-03-15T10:00:00Z"
  },
  {
    "id": 2,
    "title": "New Arrivals",
    "image": "https://example.com/banners/new-arrivals.jpg",
    "link": "/collections/new",
    "start": null,
    "end": null,
    "order": 2,
    "active": true,
    "created_at": "2024-01-10T08:00:00Z",
    "updated_at": "2024-01-10T08:00:00Z"
  }
]
```

### 8.2 Create Banner

**Endpoint**: `POST /banners`

**Description**: Creates a new homepage banner

**Request Body**:
```json
{
  "title": "Winter Sale 2024",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "link": "/collections/winter-sale",
  "start": "2024-11-01",
  "end": "2024-12-31",
  "order": 3,
  "isActive": true
}
```

**Response** (Success - 201):
```json
{
  "id": 3,
  "title": "Winter Sale 2024",
  "image": "https://example.com/banners/winter-sale.jpg",
  "link": "/collections/winter-sale",
  "start": "2024-11-01",
  "end": "2024-12-31",
  "order": 3,
  "active": true,
  "created_at": "2024-01-25T03:31:28Z",
  "updated_at": "2024-01-25T03:31:28Z"
}
```

### 8.3 Update Banner

**Endpoint**: `PUT /banners/:id`

**Description**: Updates an existing banner

**Path Parameters**:
- `id` (integer) - Banner ID

**Request Body**:
```json
{
  "title": "Summer Collection 2024 - Extended",
  "link": "/collections/summer-2024",
  "end": "2024-07-31",
  "order": 1,
  "isActive": true
}
```

**Response** (Success - 200):
```json
{
  "id": 1,
  "title": "Summer Collection 2024 - Extended",
  "end": "2024-07-31",
  "updated_at": "2024-01-25T04:30:00Z",
  "message": "Banner updated successfully"
}
```

### 8.4 Delete Banner

**Endpoint**: `DELETE /banners/:id`

**Description**: Deletes a banner

**Path Parameters**:
- `id` (integer) - Banner ID

**Example**: `DELETE /banners/3`

**Response** (Success - 200):
```json
{
  "message": "Banner deleted successfully"
}
```

---

## 9. Payments

### 9.1 Get Payments List (Paginated)

**Endpoint**: `GET /payment`

**Description**: Retrieves paginated list of payment transactions

**Query Parameters**:
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page

**Example**: `GET /payment?page=1&limit=10`

**Response** (Success - 200):
```json
{
  "data": [
    {
      "id": "pay_MjQ5ODc2NTQzMjE",
      "orderId": "ORD-2024-00342",
      "amount": 41965,
      "gateway": "Razorpay",
      "status": "completed",
      "date": "2024-01-24 15:00",
      "transaction_id": "txn_abc123xyz",
      "method": "UPI",
      "created_at": "2024-01-24T15:00:00Z",
      "updated_at": "2024-01-24T15:00:30Z"
    },
    {
      "id": "pay_MjQ5ODc2NTQzMjA",
      "orderId": "ORD-2024-00341",
      "amount": 12500,
      "gateway": "Stripe",
      "status": "pending",
      "date": "2024-01-24 12:15",
      "transaction_id": null,
      "method": "Card",
      "created_at": "2024-01-24T12:15:00Z",
      "updated_at": "2024-01-24T12:15:00Z"
    }
  ],
  "page": 1,
  "pages": 35,
  "total": 342,
  "limit": 10
}
```

### 9.2 Get Payment by ID

**Endpoint**: `GET /payments/:id`

**Description**: Retrieves detailed information for a specific payment transaction

**Path Parameters**:
- `id` (string) - Payment ID

**Example**: `GET /payments/pay_MjQ5ODc2NTQzMjE`

**Response** (Success - 200):
```json
{
  "id": "pay_MjQ5ODc2NTQzMjE",
  "order_id": "ORD-2024-00342",
  "customer_id": 25,
  "amount": 41965,
  "currency": "INR",
  "gateway": "Razorpay",
  "status": "completed",
  "method": "UPI",
  "transaction_id": "txn_abc123xyz",
  "gateway_response": {
    "razorpay_payment_id": "pay_MjQ5ODc2NTQzMjE",
    "razorpay_order_id": "order_MjQ5ODc2NTQzMjE",
    "razorpay_signature": "abc123def456..."
  },
  "refund_amount": 0,
  "refund_status": null,
  "notes": "Payment successful via UPI",
  "created_at": "2024-01-24T15:00:00Z",
  "updated_at": "2024-01-24T15:00:30Z"
}
```

---

## 10. Inventory/Stock

### 10.1 Get All Inventory

**Endpoint**: `GET /inventory`

**Description**: Retrieves all inventory items with product and variant information

**Query Parameters**: None

**Response** (Success - 200):
```json
[
  {
    "id": 1,
    "variant_id": 15,
    "quantity": 25,
    "reserved_quantity": 3,
    "low_stock_threshold": 10,
    "ProductVariant": {
      "id": 15,
      "sku": "SEG-GLD-M",
      "Product": {
        "id": 5,
        "name": "Silk Evening Gown"
      },
      "Color": {
        "id": 8,
        "name": "Gold"
      },
      "Size": {
        "id": 3,
        "name": "M"
      }
    },
    "updated_at": "2024-01-24T15:00:00Z"
  },
  {
    "id": 2,
    "variant_id": 8,
    "quantity": 5,
    "reserved_quantity": 1,
    "low_stock_threshold": 10,
    "ProductVariant": {
      "id": 8,
      "sku": "CW-BLK-OS",
      "Product": {
        "id": 3,
        "name": "Cashmere Wrap"
      },
      "Color": {
        "id": 1,
        "name": "Black"
      },
      "Size": {
        "id": 10,
        "name": "One Size"
      }
    },
    "updated_at": "2024-01-23T10:30:00Z"
  }
]
```

### 10.2 Update Inventory Stock

**Endpoint**: `PUT /inventory/update`

**Description**: Updates stock quantity for a specific product variant

**Request Body**:
```json
{
  "variant_id": 15,
  "quantity": 30
}
```

**Response** (Success - 200):
```json
{
  "id": 1,
  "variant_id": 15,
  "quantity": 30,
  "reserved_quantity": 3,
  "low_stock_threshold": 10,
  "updated_at": "2024-01-25T04:35:00Z",
  "message": "Inventory updated successfully"
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Notes

1. **Authentication**: All endpoints (except `/auth/admin/login`) require a valid JWT token in the Authorization header: `Authorization: Bearer <token>`

2. **Pagination**: Paginated endpoints return data in a consistent format with `data`, `page`, `pages`, `total`, and `limit` fields.

3. **Date Format**: All dates follow ISO 8601 format (e.g., `2024-01-25T03:31:28Z`)

4. **Currency**: All monetary amounts are in the smallest currency unit (paise for INR). Example: ₹125.00 is represented as `12500`

5. **Image Uploads**: Images can be uploaded as base64-encoded strings or file URLs. The backend will handle storage and return CDN URLs.

6. **Status Values**:
   - **Order Status**: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`
   - **Payment Status**: `pending`, `completed`, `failed`
   - **Product Status**: Uses `is_active` boolean field

7. **Client-Side Filtering**: Some list endpoints (like coupons and banners) currently return all items, with filtering done client-side. This should be optimized with server-side filtering in production.

---

**Document Version**: 1.0  
**Last Updated**: January 25, 2024  
**Base API URL**: `http://localhost:5000/api`
