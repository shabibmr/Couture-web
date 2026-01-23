# Backend Services MVP Plan

## Goal Description
Create the backend infrastructure and services for the Couture MVP. The goal is to establish a robust, modular backend that supports the core e-commerce features defined in the database schema.

## Architecture Proposal
**Tech Stack**: Node.js, Express, MySQL (via Sequelize).
**Structure**: Modular Monolith.
- A single deployable unit.
- Logic separated into distinct modules (Directories/Services).
- Easier to build and deploy for MVP than microservices.

## User Review Required
> [!IMPORTANT]
> This plan has been updated to use **MySQL** as per user request (migrating from PostgreSQL). Using `mysql2` driver.

## Proposed Modules/Services & Entities
Based on `database_schema.md`, here is the concise list of backend modules and their owned entities:

### 1. Identity & Access Management (IAM)
**Scope**: Authentication, Authorization, User Account Management.
**Entities**:
- `Admin`: Store administrators.
- `Customer`: End users/shoppers.
- `Address`: Customer shipping/billing addresses.
- `Role`/`Permission`: Access control (Internal logic or table).

### 2. Catalog Service
**Scope**: Product discovery, categorization, and details.
**Entities**:
- `Category`: Product hierarchy.
- `Brand`: Product manufacturers/brands.
- `Product`: Main product definitions.
- `ProductVariant`: Specific SKUs (combinations of Size/Color).
- `ProductImage`: Media assets.
- `Size` / `Color`: Variant attributes.
- `Review`: Customer feedback (Associated with Product).

### 3. Inventory Service
**Scope**: Stock management and availability.
**Entities**:
- `Inventory`: Stock counts per variant.

### 4. Order Management
**Scope**: Purchasing, Order lifecycle, Fulfillment.
**Entities**:
- `Cart` / `CartItem`: Temporary pre-order state.
- `Wishlist`: Saved items.
- `Order` / `OrderItem`: Confirmed purchases.
- `Shipment`: Delivery tracking.
- `ShippingMethod`: Delivery options.
- `Tax`: Regional tax calculations.

### 5. Payment Service
**Scope**: Transaction processing.
**Entities**:
- `PaymentTransaction`: Payment records.
- `PaymentGateway`: Configuration for **Razorpay**.
- `Refund`: Return processing.

### 6. Marketing & System
**Scope**: Promotions and site configuration.
**Entities**:
- `Coupon`: Discount codes.
- `Banner`: Homepage/Promotional banners.
- `StoreSettings`: Global config.
- `SEOMetadata`: Search optimization data.

## Proposed Implementation Steps

### Backend Setup
#### [NEW] [backend/](file:///e:/fcode/aii/Couture/backend)
- Initialize `package.json` with express, pg, cors, dotenv.
- Setup directory structure: `src/modules`, `src/config`, `src/middleware`.

### Database Connectivity
- Setup Database connection (PostgreSQL).
- Initialize ORM/Query Builder.

### Core Modules Implementation
- Implement **Identity** (Register/Login).
- Implement **Catalog** (CRUD Products).
- Implement **Order** (Cart -> Order flow).

### [NEW] Migration Phase (PostgreSQL -> MySQL)
- Uninstall `pg`, `pg-hstore`; Install `mysql2`.
- Update `src/config/database.js` dialect to `mysql`.
- Update `.env` variables (DB_USER, DB_PORT=3306).
- Refactor Models:
  - Change `DataTypes.JSONB` -> `DataTypes.JSON`.
  - Ensure `DataTypes.UUID` maps correctly or use `DataTypes.CHAR(36)` with `defaultValue: DataTypes.UUIDV4`.

## Verification Plan
### Automated Tests
- **Unit Tests**: Test core service logic (e.g., Price calculation).
- **API Tests**: Use `supertest` or HTTP client to verify endpoints.
  - `POST /api/auth/register` (Verify user creation)
  - `GET /api/products` (Verify listings)

### Manual Verification
- Start server: `npm run dev` (in backend).
- Use `curl` or Postman to hit health check endpoint.
- Verify connection to the PostgreSQL database created in previous tasks.
