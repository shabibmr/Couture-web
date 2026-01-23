# API Frontend Todo
The following API endpoints are required by the frontend application (or implied by standard e-commerce features present in the UI/Footer) but are **missing** from `@backend/API_DOCUMENTATION.md` and **not implemented** in the `@backend` codebase.

## Authentication & User Profile
| Endpoint | Method | Status | Requirement Context |
| :--- | :--- | :--- | :--- |
| `/auth/forgot-password` | `POST` | **Missing** | Required for "Forgot password?" link in `LoginPage.jsx`. |
| `/auth/reset-password` | `POST` | **Missing** | Required for the password reset flow. |
| `/auth/me` | `GET` | **Missing** | Required to fetch current user profile (Data beyond just the token, e.g., for header/profile page). `AuthContext` currently relies on Firebase, but backend should support this if managing users. |
| `/auth/me` | `PUT` | **Missing** | Required to update user profile details (Name, Phone) (distinct from `/auth/addresses`). |

## Products & Catalog
| Endpoint | Method | Status | Requirement Context |
| :--- | :--- | :--- | :--- |
| `/products` (Search Support) | `GET` | **Partial** | `getAllProducts` exists but **lacks search logic** (e.g., `?search=query`). Required for product discovery. |
| `/products/categories` | `GET` | **Missing** | Required to list available categories for the "Shop" page filters or navigation menu. |
| `/products/reviews/:id` | `GET` | **Missing** | Required for displaying product reviews (Standard e-commerce feature). |
| `/products/reviews` | `POST` | **Missing** | Required for submitting a new review. |

## Marketing & Communication
| Endpoint | Method | Status | Requirement Context |
| :--- | :--- | :--- | :--- |
| `/newsletter/subscribe` | `POST` | **Missing** | Required for the Newsletter Subscription form in `Footer.jsx`. |
| `/contact` | `POST` | **Missing** | Required for the "Contact Concierge" link in `Footer.jsx` (assuming a form submission). |

## Orders
| Endpoint | Method | Status | Requirement Context |
| :--- | :--- | :--- | :--- |
| `/orders/track` | `POST` | **Missing** | Required for "Track Order" link in Footer if checking status without full login (e.g., by Order ID + Email). Current `GET /orders/:id` requires Auth token. |

---
**Note**: The Frontend uses `AuthContext` with Firebase and `ShopContext` with Mock Data. The above APIs are necessary to replace these mocks with the actual Backend service.
