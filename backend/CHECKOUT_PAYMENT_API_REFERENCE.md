# API Documentation - Checkout, Payment, & Settings

This document outlines the key API endpoints used in the checkout and payment flows, along with the system settings. It is intended for comparison with the main backend API documentation.

**Base URL**: `/api`
**Authentication**: Most endpoints require a Bearer Token in the `Authorization` header.

---

## Order Module
**Base Path**: `/orders`

### 1. Create Order
Creates a new order from the user's active cart.
- **Method**: `POST`
- **Endpoint**: `/`
- **Auth**: Required

**Request Body**
```json
{
  "shipping_address": {
    "full_name": "John Doe",
    "address_line1": "123 Fashion St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001",
    "country": "India",
    "phone": "+919876543210"
  },
  "billing_address": {
    "full_name": "John Doe",
    "address_line1": "123 Fashion St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001",
    "country": "India",
    "phone": "+919876543210"
  },
  "shipping_method_id": "uuid-shipping-method-id"
}
```

**Response (201 Created)**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": "uuid-order-id",
    "order_number": "ORD-1706176543210",
    "total_amount": 1500.00,
    "status": "pending",
    "created_at": "2024-01-25T10:00:00.000Z"
  }
}
```

### 2. Get Orders
Retrieves a list of orders for the authenticated user.
- **Method**: `GET`
- **Endpoint**: `/?page=1&limit=10`
- **Auth**: Required

**Response**
```json
{
  "total": 5,
  "pages": 1,
  "currentPage": 1,
  "data": [
    {
      "id": "uuid-order-id",
      "order_number": "ORD-1706176543210",
      "total_amount": "1500.00",
      "status": "delivered",
      "items": [ ... ]
    }
  ]
}
```

---

## Payment Module
**Base Path**: `/payment`

### 1. Create Razorpay Order
Initiates a payment by creating an order in Razorpay context.
- **Method**: `POST`
- **Endpoint**: `/create-order`
- **Auth**: Required

**Request Body**
```json
{
  "order_id": "uuid-order-id-from-previous-step"
}
```

**Response**
```json
{
  "id": "order_N2J4K5L6M7", // Razorpay Order ID
  "currency": "INR",
  "amount": 150000, // Amount in paise
  "key_id": "rzp_test_..."
}
```

### 2. Verify Payment
Verifies the payment signature returned by Razorpay after successful client-side payment.
- **Method**: `POST`
- **Endpoint**: `/verify`
- **Auth**: Required

**Request Body**
```json
{
  "razorpay_order_id": "order_N2J4K5L6M7",
  "razorpay_payment_id": "pay_O3P4Q5R6S7",
  "razorpay_signature": "generated_hmac_signature_string"
}
```

**Response**
```json
{
  "status": "success",
  "message": "Payment verified successfully"
}
```

### 3. Razorpay Webhook
Receives async events from Razorpay (e.g., payment captured, failed).
- **Method**: `POST`
- **Endpoint**: `/webhook`
- **Auth**: None (Signature verification via `X-Razorpay-Signature` header)

**Request Body (Raw JSON)**
```json
{
  "entity": "event",
  "account_id": "acc_BFQ7uCaaPj5",
  "event": "payment.captured",
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_Des7cnI5j5",
        "order_id": "order_Des7cnI5j5",
        "amount": 50000,
        "status": "captured",
        ...
      }
    }
  }
}
```

---

## System Settings
**Base Path**: `/settings`

### 1. Get Settings
Retrieves global application settings (e.g., site title, currency).
- **Method**: `GET`
- **Endpoint**: `/`
- **Auth**: Public/Required (Context dependent, usually Public for general config)

**Response**
```json
{
  "site_title": "Couture",
  "currency": "INR",
  "tax_rate": "18"
}
```

### 2. Update Settings
Updates global settings.
- **Method**: `PUT`
- **Endpoint**: `/`
- **Auth**: Required (Admin only)

**Request Body**
```json
{
  "site_title": "Ruvera Couture",
  "currency": "USD"
}
```
