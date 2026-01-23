# Backend Implementation Walkthrough

## Overview
A Modular Monolith Node.js/Express backend service for Couture.

## Modules Implemented
1.  **Identity**: User Authentication (JWT), Customer/Admin Models, Address Management.
2.  **Catalog**: Product Management (Category, Brand, Product, Variants, Images).
3.  **Order**: Shopping Cart, Order Processing, Shipping.
4.  **Payment**: Razorpay Integration (Order Creation, Verification), Transaction logging.

## API Endpoints
### Auth
- `POST /api/auth/register` - Register a new customer
- `POST /api/auth/login` - Customer login
- `POST /api/auth/admin/login` - Admin login

### Products
- `GET /api/products` - List all products (with pagination)
- `GET /api/products/:slug` - Get product details

### Cart
- `GET /api/cart` - Get current user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update quantity
- `DELETE /api/cart/items/:id` - Remove item

### Orders
- `POST /api/orders` - Create an order (from cart)
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify Razorpay payment

## How to Run
1.  Ensure PostgreSQL is running and `couture_db` exists.
2.  Navigate to `backend/`.
3.  Run `npm install`.
4.  Run `npm run dev` to start the server on port 5000.
