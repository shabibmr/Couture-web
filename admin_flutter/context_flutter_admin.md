# Flutter Admin Application Context & Specification

## 1. Project Overview
The goal is to develop a comprehensive **Flutter application** that mirrors the functionality and UI/UX of the existing **React/Vite Admin Web Portal**. The application is primarily for **Android**, but must be responsive.

**Core Requirements:**
-   **Framework**: Flutter
-   **State Management**: `flutter_bloc`
-   **Architecture**: Clean Architecture (Domain, Data, Presentation layers)
-   **Design System**: Faithful replication of the current "Ruvera Couture" aesthetic (Gold, Midnight Blue, Stone).

## 2. Architecture Guidelines

### 2.1 Clean Architecture Layers
The project must be structured strictly following Clean Architecture principles:

1.  **Domain Layer** (Pure Dart, no Flutter dependencies)
    -   **Entities**: Core business objects (e.g., `Product`, `Order`, `Coupon`).
    -   **Repositories**: Abstract interfaces defining data operations (e.g., `IProductRepository`).
    -   **UseCases**: Single-responsibility classes for business logic (e.g., `GetProductList`, `UpdateOrderStatus`).

2.  **Data Layer**
    -   **Models**: DTOs (Data Transfer Objects) that handle JSON parsings (`ProductModel`, `OrderModel`). Must map to/from Entities.
    -   **Data Sources**:
        -   `RemoteDataSource`: API calls (Dio/Http).
        -   `LocalDataSource`: Local storage (SharedPreferences/Hive) for tokens/settings.
    -   **Repositories**: Concrete implementations of Domain Repositories.

3.  **Presentation Layer**
    -   **Blocs/Cubits**: State management using `flutter_bloc`. One Bloc per major feature (e.g., `ProductBloc`, `OrderBloc`).
    -   **Screens/Pages**: FLutter Widgets representing the views.
    -   **Widgets**: Reusable UI components.

### 2.2 Tech Stack Recommendations
-   **Networking**: `dio` (with interceptors for Auth).
-   **Storage**: `flutter_secure_storage` (for tokens), `shared_preferences` (for settings).
-   **DI**: `get_it` and `injectable`.
-   **Routing**: `go_router`.
-   **Icons**: `lucide_icons` (Matches existing `lucide-react`).

## 3. Design System
**Color Palette:**
-   **Midnight**: `#1a1a1a` (Backgrounds, Primary Buttons)
-   **Ruvera Gold**: `#d4af37` (Accents, Active States)
-   **Stone**:
    -   50: `#fafaf9` (App Background)
    -   100: `#f5f5f4` (Cards, Borders)
    -   200: `#e7e5e4` (Inputs)
    -   400: `#a8a29e` (Labels, Subtext)
    -   500: `#78716c` (Body Text)
-   **White**: `#ffffff` (Card Backgrounds)

**Typography:**
-   **Serif**: `Playfair Display` (Headers)
-   **Sans**: `Inter` or `Lato` (Body, UI controls)

**UI Patterns:**
-   **Cards**: Rounded corners (`border-radius: 16px`), Light shadow (`box-shadow`), White background.
-   **Inputs**: Rounded (`border-radius: 8px`), Border `#e5e7eb`, Focus ring `Ruvera Gold`.
-   **Sidebar**: Collapsible (Drawer on Mobile), Dark theme.

## 4. Modules & UI Specification

### 4.1 Authentication
**Endpoint**: `POST /auth/admin/login`

**UI**:
-   **Screen**: `LoginScreen`
-   **Form**:
    -   Email Field
    -   Password Field
    -   "Sign In" Button (Full width, Midnight Blue)
-   **Logic**:
    -   On success: Store JWT token securely. Navigate to Dashboard.
    -   On failure: Show error Toast/Snackbar.

### 4.2 Dashboard
**Endpoint**: `GET /dashboard/stats`

**UI**:
-   **Header**: Welcome message, Date.
-   **Quick Access Cards** (Grid 2x1):
    -   "Manage Products" (Navigates to Product List)
    -   "Pending Orders" (Navigates to Order List with filter)
-   **Stats Cards** (Grid 2x2 or 4x1):
    -   **Total Revenue**: Currency formatted.
    -   **New Orders**: Integer.
    -   **Total Customers**: Integer.
    -   **Growth**: Percentage (Green if positive, Red if negative).
-   **Recent Orders**: Placeholder for Chart/List.
-   **Concierge Intel**: Dark card with "gold" accent, showing activity logs.

### 4.3 Products
**Endpoints**:
-   List: `GET /products?page=x&limit=y`
-   Detail: `GET /products/id/:id`
-   Create: `POST /products`
-   Update: `PUT /products/:id`
-   Delete: `DELETE /products/:id`
-   Meta: `GET /products/categories`, `GET /products/sizes`

**UI - Product List**:
-   **Layout**: List/Grid of Product Cards.
-   **Card Item**:
    -   Thumbnail Image (Left)
    -   Title & Category (Top)
    -   Price & Status Badge (Active/Inactive) (Bottom)
-   **FAB**: "Add Product" button.

**UI - Product Editor (Create/Edit)**:
-   **Basic Info Section**:
    -   `Title` (Text Input)
    -   `Price` (Number Input)
    -   `SKU Code` (Text Input)
    -   `Description` (multiline Text Area)
-   **Variants Section**:
    -   `Sizes`: Multi-select chips (XS, S, M, L, XL). Highlight selected.
-   **Organization Section**:
    -   `Category`: Dropdown/Modal Selector.
    -   `Sort Order`: Number Input.
    -   `Toggles`:
        -   Active Status (Switch)
        -   New Arrival (Switch)
        -   Featured Product (Switch)
-   **Images Section**:
    -   **Main Image**: Single upload widget. Shows preview.
    -   **Additional Images**: Multi-upload widget (Max 3). Grid layout.
    -   **Logic**: Uses `ImageUpload` widget. Uploads to MinIO, returns URL. If editing, extracts Object Key from URL if needed.

### 4.4 Orders
**Endpoints**:
-   List: `GET /orders`
-   Detail: `GET /orders/:id`
-   Update Status: `PUT /orders/:id/status`
-   Delete: `DELETE /orders/:id`

**UI - Order List**:
-   **Filter**: Tabs or Dropdown for Status (All, Pending, Confirmed, Shipped, Delivered).
-   **Card Item**:
    -   Order ID (`#ORD-...`)
    -   Customer Name
    -   Total Amount
    -   Status Badge (Color coded: Amber=Pending, Blue=Shipped, Green=Delivered).
    -   Date.

**UI - Order Detail**:
-   **Header**: Order ID, Current Status Badge.
-   **Actions**:
    -   "Update Status" (Opens BottomSheet/Modal with status options).
    -   "Print Invoice" (Generate PDF).
    -   "Delete Order" (Only if Payment Pending).
-   **Order Items Card**:
    -   List of items: Image, Name, Variant (Size/Color), SKU, Qty, Price.
    -   **Summary**: Subtotal, Shipping, Tax, Total.
-   **Shipping Card**:
    -   "Shipment Details" header.
    -   Track status (or "Create Shipment" button).
-   **Customer Card**:
    -   Name, Email, Phone.
    -   Link to Customer Profile.
-   **Address Card**:
    -   Formatted Shipping Address.
-   **Payment Info Card**:
    -   Method (Razorpay, etc.), Status, Transaction IDs.

### 4.5 Coupons
**Endpoints**:
-   List: `GET /coupons`
-   Detail: `GET /coupons/:id`
-   Create/Update: `POST` / `PUT`

**UI - Coupon List**:
-   **Card Item**:
    -   Code (Bold, Uppercase)
    -   Discount Summary (e.g., "20% Off").
    -   Usage Stats (e.g., "45/100 used").
    -   Status Badge.

**UI - Coupon Editor (Complex Form)**:
-   **Basic Info**:
    -   `Code` (Text, Uppercase).
    -   `Discount Type`: Dropdown (Percentage, Fixed, Free Shipping, BOGO).
    -   `Discount Value`: Number (Hidden if Free Shipping).
    -   `Min Order Value`: Number.
    -   `Min Product Price`: Number.
    -   `Max Discount Cap`: Number (Visible only if Percentage).
    -   `Valid From / Until`: Date Pickers.
-   **Usage Controls**:
    -   `Global Limit`: Number.
    -   `Per Customer Limit`: Number.
    -   `Min Cart Items`: Number.
    -   `Single Use`: Checkbox.
    -   `First Order Only`: Checkbox.
-   **Targeting**:
    -   `Applies To`: Dropdown (All, Products, Categories).
    -   **Selector**: If Products/Categories selected, show Multi-select Modal/List.
-   **User Targeting**:
    -   `Private (VIP)`: Checkbox.
    -   `Allowed Customers`: Multi-select Modal (if Private).
    -   `Stackable`: Checkbox.
    -   `Active`: Checkbox.

### 4.6 Customers
**Endpoints**:
-   List: `GET /customers`
-   Detail: `GET /customers/:id`

**UI**:
-   **List**: Avatar (or Initials), Name, Email, VIP Badge.
-   **Detail**:
    -   Profile Header (Avatar, Name, VIP status).
    -   Stats: Total Spent, Orders Count.
    -   "Recent Orders" List.
    -   Addresses List.

### 4.7 Settings
**Endpoint**: `GET /settings`, `PUT /settings`

**UI - Form Sections**:
-   **General**:
    -   Currency Code (INR), Symbol (₹).
-   **Company Information**:
    -   Name, Address, City, State, Zip, Phone, Email.
-   **Shipping & Tax**:
    -   Shipping Fee, Free Shipping Threshold, Tax Rate (%).
-   **Social Media**:
    -   Facebook URL, Instagram URL, Twitter URL.
-   **Action**: "Save Changes" Button (Floating or Bottom).

### 4.8 Banners
**Endpoints**: `GET /banners`, `POST /banners`, `PUT /banners/:id`, `DELETE /banners/:id`

**UI - Banner Editor**:
-   **Image**: Large upload area (MinIO).
-   **Title**: Text Input.
-   **Description**: Text Area.
-   **Link URL**: Text Input.
-   **Dates**: Start Date, End Date.
-   **Sort Order**: Number.
-   **Active**: Checkbox.

### 4.9 Payments & Stock
**Payments Endpoint**: `GET /payments` (List of transactions)
**Stock Endpoint**: `GET /stock`, `PUT /stock`

**UI**:
-   **Payments**: Read-only Data Table/List showing Transaction ID, Order ID, Amount, Status, Gateway.
-   **Stock**: List of Products with "Current Stock" field. Editable inline or via modal to adjust quantity.

### 4.10 Categories
**Endpoints**: `GET/POST/PUT/DELETE /products/categories`

**UI**:
-   List view of categories.
-   Create/Edit Modal: Name, Slug, Description.

### 4.11 Image Handling (MinIO)
-   **Upload**:
    -   Multipart `POST` request to upload endpoint.
    -   Returns URL handling.
-   **Display**:
    -   Helper function `getMinioUrl(path)`:
        -   If `path` starts with `http`, return as is.
        -   Else, append Base Storage URL.
-   **Widget**:
    -   Custom widget handling:
        -   Empty State (Placeholder Icon).
        -   Loading State (Spinner).
        -   Preview State (Image with "Remove" X button).

## 5. API Reference Summary
Refer to `API_Documentation.md` for exact JSON contracts.
**Base URL**: `[Configurable]/api`
**Headers**: `Authorization: Bearer <token>`

## 6. Development Priorities
1.  **Skeleton**: Navigation (Drawer), Auth Bloc, Layout.
2.  **Products**: Essential for catalog management.
3.  **Orders**: Essential for processing.
4.  **Dashboard**: For overview.
5.  **Coupons/Customers**: Advanced features.
