# Wireframes Documentation
## Couture - Online Readymade Store

---

## Table of Contents
1. [Customer-Facing Pages](#customer-facing-pages)
2. [Admin Pages](#admin-pages)
3. [Responsive Design Notes](#responsive-design-notes)
4. [Component Library](#component-library)

---

## Customer-Facing Pages

### 1. Homepage

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Fixed on scroll)                                     │
│ ┌─────────┐  [Search Bar]  [Wishlist] [Cart] [Account]     │
│ │  LOGO   │                                                  │
│ └─────────┘                                                  │
│ [Men] [Women] [Kids] [Accessories] [Sale] [New Arrivals]   │
└─────────────────────────────────────────────────────────────┘
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │   HERO BANNER / SLIDER                                │   │
│ │   [Large promotional image with CTA]                  │   │
│ │   • 1920x600px (desktop)                             │   │
│ │   • Auto-rotate every 5 seconds                      │   │
│ │   • Dots navigation + arrows                         │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │   CATEGORY SHOWCASE                                   │   │
│ │   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │   │
│ │   │ MEN  │  │WOMEN │  │ KIDS │  │ACCESS│           │   │
│ │   │[img] │  │[img] │  │[img] │  │[img] │           │   │
│ │   └──────┘  └──────┘  └──────┘  └──────┘           │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │   NEW ARRIVALS                          [View All →] │   │
│ │   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │   │
│ │   │[img]│ │[img]│ │[img]│ │[img]│ │[img]│          │   │
│ │   │Name │ │Name │ │Name │ │Name │ │Name │          │   │
│ │   │$99  │ │$125 │ │$89  │ │$149 │ │$79  │          │   │
│ │   │★★★★★│ │★★★★☆│ │★★★★★│ │★★★☆☆│ │★★★★★│          │   │
│ │   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘          │   │
│ │   [← →] Horizontal scroll                           │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │   FEATURED COLLECTION                                 │   │
│ │   ┌──────────────┐  ┌──────────────┐                │   │
│ │   │              │  │              │                │   │
│ │   │  Large Image │  │  Large Image │                │   │
│ │   │  "Summer     │  │  "Formal     │                │   │
│ │   │   2026"      │  │   Wear"      │                │   │
│ │   │  [Shop Now]  │  │  [Shop Now]  │                │   │
│ │   └──────────────┘  └──────────────┘                │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │   BEST SELLERS                          [View All →] │   │
│ │   [Similar grid layout as New Arrivals]              │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │   SHOP BY BRAND                                       │   │
│ │   [Brand Logo] [Brand Logo] [Brand Logo] [Brand Logo]│   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │   TESTIMONIALS                                        │   │
│ │   "Amazing quality!" - Sarah M. ★★★★★               │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │   NEWSLETTER SIGNUP                                   │   │
│ │   "Get 10% off your first order"                     │   │
│ │   [Email Input] [Subscribe Button]                   │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ FOOTER                                                       │
│ ┌──────────┬──────────┬──────────┬──────────┐              │
│ │ About Us │ Customer │ Policies │ Follow Us│              │
│ │ Contact  │ Service  │ Shipping │ [Social] │              │
│ │ Careers  │ FAQ      │ Returns  │ [Icons]  │              │
│ └──────────┴──────────┴──────────┴──────────┘              │
│ © 2026 Couture. All rights reserved.                        │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Product Listing Page

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Same as homepage)                                    │
└─────────────────────────────────────────────────────────────┘
│                                                              │
│ Home > Men > T-Shirts                                        │
│                                                              │
│ ┌──────┐ ┌────────────────────────────────────────────┐    │
│ │      │ │ MEN'S T-SHIRTS                   [Grid/List]│    │
│ │FILTER│ │ 245 Products                                │    │
│ │      │ │                                              │    │
│ │Price │ │ Sort: [Popularity ▼]                        │    │
│ │ ☐ $0 │ │                                              │    │
│ │ ☐ $50│ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐                │    │
│ │      │ │ │[img]│ │[img]│ │[img]│ │[img]│                │    │
│ │Size  │ │ │    │ │    │ │    │ │    │                │    │
│ │ ☐ XS │ │ │Name│ │Name│ │Name│ │Name│                │    │
│ │ ☑ S  │ │ │$99 │ │$125│ │$89 │ │$149│                │    │
│ │ ☐ M  │ │ │★★★★│ │★★★☆│ │★★★★│ │★★☆☆│                │    │
│ │      │ │ │❤   │ │❤   │ │❤   │ │❤   │                │    │
│ │Color │ │ └────┘ └────┘ └────┘ └────┘                │    │
│ │ ⬜⬛ │ │                                              │    │
│ │ 🟥🟦 │ │ [4 more rows of products]                   │    │
│ │      │ │                                              │    │
│ │Brand │ │                                              │    │
│ │ ☐ Nike│ │ [Pagination: 1 2 3 ... 20 Next]            │    │
│ │ ☑ Zara│ │                                              │    │
│ │      │ │                                              │    │
│ │Rating│ │                                              │    │
│ │ ☐ 4+ │ │                                              │    │
│ │      │ │                                              │    │
│ │[Clear│ │                                              │    │
│ │ All] │ │                                              │    │
│ └──────┘ └────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Product Card (Grid View)
```
┌─────────────────┐
│                 │  ← Hover: Quick View, Add to Wishlist
│   Product Image │  ← Badge: "Sale", "New"
│   [280x350px]   │
│                 │
├─────────────────┤
│ Product Name    │
│ $99  $129       │  ← Sale price + original (strikethrough)
│ ★★★★☆ (124)    │  ← Rating + review count
│ ⬜🟥🟦 +3       │  ← Color options
└─────────────────┘
```

---

### 3. Product Detail Page

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
└─────────────────────────────────────────────────────────────┘
│ Home > Men > T-Shirts > Classic Cotton T-Shirt              │
│                                                              │
│ ┌──────────────────┐  ┌─────────────────────────────────┐  │
│ │                  │  │ Classic Cotton T-Shirt           │  │
│ │  Main Product    │  │ By: Brand Name    ★★★★☆ (124)  │  │
│ │  Image           │  │                                  │  │
│ │  [600x750px]     │  │ $99  $129  (23% OFF)           │  │
│ │                  │  │ Tax included                     │  │
│ │                  │  │                                  │  │
│ │     [Zoom]       │  │ Color: Black                     │  │
│ │                  │  │ ⬛ ⬜ 🟥 🟦                      │  │
│ └──────────────────┘  │                                  │  │
│                       │ Size: M         [Size Guide]     │  │
│ [Thumb] [Thumb]       │ ☐ XS  ☐ S  ☑ M  ☐ L  ☐ XL     │  │
│ [Thumb] [Thumb]       │                                  │  │
│                       │ Quantity: [- 1 +]                │  │
│                       │                                  │  │
│                       │ ✓ In Stock (47 available)       │  │
│                       │                                  │  │
│                       │ [Add to Cart - Full Width]       │  │
│                       │ [Buy Now - Full Width]           │  │
│                       │ [♥ Add to Wishlist]              │  │
│                       │                                  │  │
│                       │ 📦 Free shipping on orders $50+ │  │
│                       │ ↩️  30-day easy returns          │  │
│                       │ 🔒 Secure checkout               │  │
│                       └────────────────────────────────┘  │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Description] [Specifications] [Shipping] [Reviews]     │ │
│ │                                                          │ │
│ │ Product Description:                                     │ │
│ │ Lorem ipsum dolor sit amet, consectetur adipiscing...   │ │
│ │                                                          │ │
│ │ Material: 100% Cotton                                    │ │
│ │ Fit: Regular                                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ CUSTOMER REVIEWS (124)                  [Write Review]  │ │
│ │                                                          │ │
│ │ ★★★★★ 4.5/5                                             │ │
│ │ ████████████░░ 5★ (80)                                  │ │
│ │ █████░░░░░░░░░ 4★ (30)                                  │ │
│ │                                                          │ │
│ │ ───────────────────────────────────────────────────     │ │
│ │ Sarah M.  ★★★★★                    Jan 15, 2026        │ │
│ │ "Amazing quality! Fits perfectly..."                    │ │
│ │ [Helpful? 👍 45  👎 2]                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ YOU MAY ALSO LIKE                                       │ │
│ │ [Product] [Product] [Product] [Product]                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Shopping Cart Page

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
└─────────────────────────────────────────────────────────────┘
│                                                              │
│ SHOPPING CART (3 items)                                      │
│                                                              │
│ ┌───────────────────────────────┐  ┌──────────────────┐    │
│ │ CART ITEMS                    │  │ ORDER SUMMARY    │    │
│ │                               │  │                  │    │
│ │ ┌────────────────────────────┐│  │ Subtotal: $327  │    │
│ │ │[img] Product 1             ││  │ Shipping: $10   │    │
│ │ │      Name, Size: M, Black  ││  │ Tax:      $27   │    │
│ │ │      $99                   ││  │ Discount: -$30  │    │
│ │ │      Qty: [- 1 +]  [Remove]││  │ ───────────────  │    │
│ │ └────────────────────────────┘│  │ Total:    $334  │    │
│ │                               │  │                  │    │
│ │ ┌────────────────────────────┐│  │ [Coupon Code]   │    │
│ │ │[img] Product 2             ││  │ [Apply]         │    │
│ │ │      Name, Size: L, White  ││  │                  │    │
│ │ │      $125                  ││  │ [Proceed to     │    │
│ │ │      Qty: [- 2 +]  [Remove]││  │  Checkout]      │    │
│ │ └────────────────────────────┘│  │                  │    │
│ │                               │  │ [Continue       │    │
│ │ ┌────────────────────────────┐│  │  Shopping]      │    │
│ │ │[img] Product 3             ││  │                  │    │
│ │ │      ...                   ││  │ 🔒 Secure       │    │
│ │ └────────────────────────────┘│  │    Checkout     │    │
│ │                               │  └──────────────────┘    │
│ └───────────────────────────────┘                          │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ FREQUENTLY BOUGHT TOGETHER                              │ │
│ │ [Product] [Product] [Product]                           │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Checkout Page

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ LOGO                                     🔒 Secure Checkout │
└─────────────────────────────────────────────────────────────┘
│                                                              │
│ ┌─────────────────────────────┐  ┌──────────────────┐      │
│ │ CHECKOUT FLOW               │  │ ORDER SUMMARY    │      │
│ │                             │  │                  │      │
│ │ [1. Shipping] → 2. Payment  │  │ 3 Items  $334    │      │
│ │  → 3. Review                │  │                  │      │
│ │                             │  │ [img] Product 1  │      │
│ │ SHIPPING INFORMATION        │  │       x1   $99   │      │
│ │                             │  │                  │      │
│ │ ☐ Use saved address         │  │ [img] Product 2  │      │
│ │                             │  │       x2   $250  │      │
│ │ Email: [____________]       │  │                  │      │
│ │                             │  │ [img] Product 3  │      │
│ │ Full Name: [____________]   │  │       x1   $103  │      │
│ │                             │  │                  │      │
│ │ Phone: [____________]       │  │ ───────────────  │      │
│ │                             │  │ Subtotal:  $352  │      │
│ │ Address: [____________]     │  │ Shipping:  $10   │      │
│ │                             │  │ Tax:       $28   │      │
│ │ City: [____] State: [____]  │  │ Discount:  -$30  │      │
│ │                             │  │ ───────────────  │      │
│ │ ZIP: [____] Country: [____] │  │ Total:     $360  │      │
│ │                             │  └──────────────────┘      │
│ │ ☑ Billing same as shipping  │                            │
│ │                             │                            │
│ │ [Continue to Payment →]     │                            │
│ └─────────────────────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. My Account Dashboard

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
└─────────────────────────────────────────────────────────────┘
│                                                              │
│ ┌──────────┐  ┌────────────────────────────────────────┐   │
│ │ SIDEBAR  │  │ MY ACCOUNT                              │   │
│ │          │  │                                          │   │
│ │ 👤 John  │  │ Welcome back, John!                     │   │
│ │    Doe   │  │                                          │   │
│ │          │  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ │   │
│ │ ▶ Dashboard│ │ Orders    │ │ Wishlist  │ │ Addresses││   │
│ │   Orders  │  │    12     │ │    5      │ │    3     ││   │
│ │   Wishlist│  │ [Icon]    │ │ [Icon]    │ │ [Icon]   ││   │
│ │   Profile │  │ └──────────┘ └──────────┘ └──────────┘ │   │
│ │   Address │  │                                          │   │
│ │   Reviews │  │ RECENT ORDERS                           │   │
│ │   Settings│  │                                          │   │
│ │   Logout  │  │ ┌─────────────────────────────────────┐││   │
│ │          │  │ │ Order #12345      Jan 15  $280      │││   │
│ │          │  │ │ Status: Delivered                   │││   │
│ │          │  │ │ [View Details] [Track] [Reorder]    │││   │
│ │          │  │ └─────────────────────────────────────┘││   │
│ │          │  │                                          │   │
│ │          │  │ ┌─────────────────────────────────────┐││   │
│ │          │  │ │ Order #12344      Jan 10  $150      │││   │
│ │          │  │ │ Status: In Transit                  │││   │
│ │          │  │ │ [View Details] [Track]              │││   │
│ │          │  │ └─────────────────────────────────────┘││   │
│ └──────────┘  └────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Admin Pages

### 7. Admin Dashboard

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ COUTURE ADMIN  [Search] [Notifications] [Profile ▾]         │
└─────────────────────────────────────────────────────────────┘
│ ┌──────┐ ┌──────────────────────────────────────────────┐  │
│ │SIDEBAR│ │ DASHBOARD                           Today ▾  │  │
│ │       │ │                                              │  │
│ │☰ Menu │ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │  │
│ │       │ │ │💰    │ │📦    │ │👤    │ │⭐    │        │  │
│ │▶ Dash │ │ │Revenue│ │Orders│ │Users │ │Avg   │        │  │
│ │  Products│ │$52.4K │ │  342 │ │1,245 │ │4.8   │        │  │
│ │  Orders │ │+12.5% │ │+8.2% │ │+5.1% │ │+0.3  │        │  │
│ │  Customers│└──────┘ └──────┘ └──────┘ └──────┘        │  │
│ │  Marketing│                                            │  │
│ │  Analytics│ ┌─────────────────────────────────────┐   │  │
│ │  Settings│ │ SALES OVERVIEW                       │   │  │
│ │       │ │ │ [Line Chart - Last 30 days]          │   │  │
│ │       │ │ │                                       │   │  │
│ │       │ │ │     $60K ●─────●                     │   │  │
│ │       │ │ │          │  ╱  │                     │   │  │
│ │       │ │ │     $40K │╱    │                     │   │  │
│ │       │ │ │          ●─────●                     │   │  │
│ │       │ │ │     $20K                             │   │  │
│ │       │ │ │          Jan   Feb   Mar   Apr       │   │  │
│ │       │ │ └─────────────────────────────────────┘   │  │
│ │       │ │                                            │  │
│ │       │ │ ┌──────────────┐ ┌─────────────────────┐ │  │
│ │       │ │ │RECENT ORDERS │ │ TOP PRODUCTS        │ │  │
│ │       │ │ │              │ │                     │ │  │
│ │       │ │ │#12345 $280★ │ │ 1. Classic Tee $99  │ │  │
│ │       │ │ │#12344 $150▲ │ │    342 sold         │ │  │
│ │       │ │ │#12343 $420● │ │ 2. Denim Jeans $150 │ │  │
│ │       │ │ │[View All]    │ │ 3. ...              │ │  │
│ │       │ │ └──────────────┘ └─────────────────────┘ │  │
│ └──────┘ └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Legend: ★=Delivered ▲=Shipped ●=Processing
```

---

### 8. Product Management - List View

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN HEADER                                                 │
└─────────────────────────────────────────────────────────────┘
│ ┌──────┐ ┌──────────────────────────────────────────────┐  │
│ │SIDEBAR│ │ PRODUCTS                     [+ Add Product] │  │
│ │       │ │                                              │  │
│ │       │ │ [Search products...]  [Category▾] [Status▾] │  │
│ │       │ │                         [Export CSV]        │  │
│ │       │ │                                              │  │
│ │       │ │ 245 Products  [Bulk Actions ▾]  [Filter]    │  │
│ │       │ │                                              │  │
│ │       │ │ ┌─────────────────────────────────────────┐ │  │
│ │       │ │ │☐│Img│Name      │SKU   │Stock│Price│●│✏│││  │
│ │       │ │ ├─┼───┼──────────┼──────┼─────┼─────┼─┼─┤││  │
│ │       │ │ │☐│[T]│Classic..│TS001 │ 45  │$99  │✓│✏│││  │
│ │       │ │ │☐│[D]│Denim... │DJ002 │ 12  │$150 │✓│✏│││  │
│ │       │ │ │☐│[S]│Summer.. │SS003 │ 0   │$89  │✗│✏│││  │
│ │       │ │ │☐│[P]│Premium..│PJ004 │ 120 │$200 │✓│✏│││  │
│ │       │ │ └─────────────────────────────────────────┘ │  │
│ │       │ │                                              │  │
│ │       │ │ [< Prev]  Page 1 of 25  [Next >]           │  │
│ └──────┘ └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### 9. Product Management - Add/Edit Product

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN HEADER                                                 │
└─────────────────────────────────────────────────────────────┘
│ ┌──────┐ ┌──────────────────────────────────────────────┐  │
│ │SIDEBAR│ │ ADD NEW PRODUCT                [Save Draft]  │  │
│ │       │ │                                [Publish]     │  │
│ │       │ │ ┌─────────────────────────────────────────┐ │  │
│ │       │ │ │ BASIC INFORMATION                       │ │  │
│ │       │ │ │                                          │ │  │
│ │       │ │ │ Product Name *                           │ │  │
│ │       │ │ │ [_________________________________]      │ │  │
│ │       │ │ │                                          │ │  │
│ │       │ │ │ Description                              │ │  │
│ │       │ │ │ [Rich Text Editor               ]       │ │  │
│ │       │ │ │ [B] [I] [U] [Link] [Image]      ]       │ │  │
│ │       │ │ │                                          │ │  │
│ │       │ │ │ Category *      Brand                    │ │  │
│ │       │ │ │ [Select ▾]      [Select ▾]              │ │  │
│ │       │ │ └─────────────────────────────────────────┘ │  │
│ │       │ │                                              │  │
│ │       │ │ ┌─────────────────────────────────────────┐ │  │
│ │       │ │ │ PRODUCT IMAGES                          │ │  │
│ │       │ │ │                                          │ │  │
│ │       │ │ │ ┌────┐ ┌────┐ ┌────┐ [+ Add Image]     │ │  │
│ │       │ │ │ │Img1│ │Img2│ │Img3│                    │ │  │
│ │       │ │ │ │[✗] │ │[✗] │ │[✗] │                    │ │  │
│ │       │ │ │ └────┘ └────┘ └────┘                    │ │  │
│ │       │ │ └─────────────────────────────────────────┘ │  │
│ │       │ │                                              │  │
│ │       │ │ ┌─────────────────────────────────────────┐ │  │
│ │       │ │ │ PRICING                                  │ │  │
│ │       │ │ │                                          │ │  │
│ │       │ │ │ Base Price *    Sale Price               │ │  │
│ │       │ │ │ $ [_______]     $ [_______]              │ │  │
│ │       │ │ └─────────────────────────────────────────┘ │  │
│ │       │ │                                              │  │
│ │       │ │ ┌─────────────────────────────────────────┐ │  │
│ │       │ │ │ VARIANTS                  [+ Add Variant]│ │  │
│ │       │ │ │                                          │ │  │
│ │       │ │ │ Size  Color   SKU      Stock   Price     │ │  │
│ │       │ │ │ [S]   [Black] TS001-S  [50]   [$99] [✗] │ │  │
│ │       │ │ │ [M]   [Black] TS001-M  [45]   [$99] [✗] │ │  │
│ │       │ │ │ [S]   [White] TS001-SW [30]   [$99] [✗] │ │  │
│ │       │ │ └─────────────────────────────────────────┘ │  │
│ │       │ │                                              │  │
│ │       │ │ ┌─────────────────────────────────────────┐ │  │
│ │       │ │ │ SEO                                      │ │  │
│ │       │ │ │ Meta Title: [_____________________]      │ │  │
│ │       │ │ │ Meta Desc:  [_____________________]      │ │  │
│ │       │ │ │ URL Slug:   [_____________________]      │ │  │
│ │       │ │ └─────────────────────────────────────────┘ │  │
│ │       │ │                                              │  │
│ │       │ │ [Cancel]            [Save Draft] [Publish]  │  │
│ └──────┘ └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### 10. Order Management - List View

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN HEADER                                                 │
└─────────────────────────────────────────────────────────────┘
│ ┌──────┐ ┌──────────────────────────────────────────────┐  │
│ │SIDEBAR│ │ ORDERS                        [Export]       │  │
│ │       │ │                                              │  │
│ │       │ │ [Search orders...] [Status▾] [Date Range▾]  │  │
│ │       │ │                                              │  │
│ │       │ │ 342 Orders  [All] [Pending] [Processing]    │  │
│ │       │ │             [Shipped] [Delivered]           │  │
│ │       │ │                                              │  │
│ │       │ │┌──────────────────────────────────────────┐ │  │
│ │       │ ││Order#│Customer  │Date  │Total│Status│Action││  │
│ │       │ │├──────┼──────────┼──────┼─────┼──────┼──────┤│  │
│ │       │ ││#12345│John Doe  │Jan15 │$280 │●Dlvd │[View]││  │
│ │       │ ││#12344│Sarah M.  │Jan10 │$150 │▲Ship │[View]││  │
│ │       │ ││#12343│Mike R.   │Jan08 │$420 │★Proc │[View]││  │
│ │       │ ││#12342│Emma W.   │Jan05 │$199 │⏱Pend │[View]││  │
│ │       │ │└──────────────────────────────────────────┘ │  │
│ │       │ │                                              │  │
│ │       │ │ [< Prev]  Page 1 of 35  [Next >]           │  │
│ └──────┘ └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Legend: ●=Delivered ▲=Shipped ★=Processing ⏱=Pending
```

---

### 11. Order Details View

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN HEADER                                                 │
└─────────────────────────────────────────────────────────────┘
│ ┌──────┐ ┌──────────────────────────────────────────────┐  │
│ │SIDEBAR│ │ ORDER #12345         [Print Invoice]         │  │
│ │       │ │                      [Print Packing Slip]    │  │
│ │       │ │ ┌─────────────────────────────────────────┐ │  │
│ │       │ │ │ ORDER STATUS                             │ │  │
│ │       │ │ │                                          │ │  │
│ │       │ │ │ Current: Processing                      │ │  │
│ │       │ │ │ Update to: [Select Status ▾] [Update]   │ │  │
│ │       │ │ │                                          │ │  │
│ │       │ │ │ Timeline:                                │ │  │
│ │       │ │ │ ● Placed    - Jan 15, 10:30 AM          │ │  │
│ │       │ │ │ ● Confirmed - Jan 15, 11:00 AM          │ │  │
│ │       │ │ │ ○ Shipped   -                           │ │  │
│ │       │ │ │ ○ Delivered -                           │ │  │
│ │       │ │ └─────────────────────────────────────────┘ │  │
│ │       │ │                                              │  │
│ │       │ │ ┌──────────────┐ ┌──────────────────────┐  │  │
│ │       │ │ │ CUSTOMER     │ │ SHIPPING ADDRESS     │  │  │
│ │       │ │ │              │ │                      │  │  │
│ │       │ │ │ John Doe     │ │ John Doe             │  │  │
│ │       │ │ │ john@e.com   │ │ 123 Main St          │  │  │
│ │       │ │ │ 555-1234     │ │ City, ST 12345       │  │  │
│ │       │ │ │              │ │ Country              │  │  │
│ │       │ │ └──────────────┘ └──────────────────────┘  │  │
│ │       │ │                                              │  │
│ │       │ │ ┌─────────────────────────────────────────┐ │  │
│ │       │ │ │ ORDER ITEMS                              │ │  │
│ │       │ │ │                                          │ │  │
│ │       │ │ │ [Img] Classic Tee (M, Black)            │ │  │
│ │       │ │ │       $99 x 1 = $99                     │ │  │
│ │       │ │ │                                          │ │  │
│ │       │ │ │ [Img] Denim Jeans (L, Blue)             │ │  │
│ │       │ │ │       $150 x 1 = $150                   │ │  │
│ │       │ │ │                                          │ │  │
│ │       │ │ │ ─────────────────────────────────────    │ │  │
│ │       │ │ │ Subtotal:              $249             │ │  │
│ │       │ │ │ Shipping:              $10              │ │  │
│ │       │ │ │ Tax:                   $21              │ │  │
│ │       │ │ │ ─────────────────────────────────────    │ │  │
│ │       │ │ │ TOTAL:                 $280             │ │  │
│ │       │ │ └─────────────────────────────────────────┘ │  │
│ │       │ │                                              │  │
│ │       │ │ ┌─────────────────────────────────────────┐ │  │
│ │       │ │ │ PAYMENT INFORMATION                      │ │  │
│ │       │ │ │ Method: Credit Card (**** 1234)         │ │  │
│ │       │ │ │ Status: Paid                             │ │  │
│ │       │ │ │ Transaction: TXN123456789               │ │  │
│ │       │ │ └─────────────────────────────────────────┘ │  │
│ └──────┘ └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsive Design Notes

### Mobile Layout (< 768px)
- **Header**: Hamburger menu, logo centered
- **Product Grid**: 2 columns → 1 column
- **Filters**: Slide-out drawer
- **Cart**: Full-screen overlay
- **Checkout**: Single column, stacked sections
- **Admin**: Collapsible sidebar, touch-friendly controls

### Tablet Layout (768px - 1024px)
- **Product Grid**: 2-3 columns
- **Filters**: Sidebar (collapsible)
- **Admin Dashboard**: Responsive grid

### Desktop Layout (> 1024px)
- **Product Grid**: 4-5 columns
- **Full feature set**
- **Fixed sidebars on admin**

---

## Component Library

### Buttons
```
Primary:   [Add to Cart] - Blue, white text
Secondary: [Continue Shopping] - Outline
Danger:    [Delete] - Red
Success:   [Publish] - Green
```

### Form Inputs
```
Text:     [____________]
Select:   [Choose ▾]
Checkbox: ☑ Option
Radio:    ● Selected ○ Unselected
```

### Cards
```
┌─────────────┐
│ Card Header │
├─────────────┤
│ Content     │
│ Area        │
└─────────────┘
```

### Badges
```
●●● Pending
✓✓✓ Delivered
★★★ Processing
```

---

## Interactive Elements

### Hover States
- **Product Cards**: Show quick view + wishlist
- **Buttons**: Darken/lighten
- **Links**: Underline
- **Images**: Slight zoom

### Loading States
- **Skeleton screens** for product grids
- **Spinners** for buttons
- **Progress bars** for uploads

### Animations
- **Page transitions**: Fade in
- **Cart add**: Fly-to-cart animation
- **Notifications**: Slide in from top
- **Modals**: Fade + scale in

---

## Accessibility Notes

- **Color Contrast**: WCAG AA compliant
- **Focus States**: Visible outlines
- **Alt Text**: All images
- **Keyboard Navigation**: Full support
- **Screen Reader**: ARIA labels
- **Font Sizes**: Minimum 14px body text

---

## Next Steps

- [ ] Review wireframes with stakeholders
- [ ] Create high-fidelity designs
- [ ] Build component library
- [ ] Develop style guide
- [ ] Set up design system in code
