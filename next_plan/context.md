# Project Context: Ruvera Couture Store Front Migration

## Overview
This project involves migrating the existing React (Vite) customer application (`customer`) to a new Next.js 14+ (App Router) application (`store-front`). The goal is to improve SEO, performance, and maintainability while preserving the existing design and functionality.

## Core Directives & Guardrails

### 1. Directory Structure Integrity
-   **Source of Truth**: The `customer` directory contains the *current working code*. READ from `customer`, WRITE to `store-front`.
-   **No Modification Rule**: Do **NOT** modify files in the `customer` directory unless explicitly instructed to fix a critical bug that blocks migration.
-   **Target Directory**: All new work must happen in `store-front`.

### 2. Technology Stack
-   **Framework**: Next.js 14+ (App Router).
-   **Language**: TypeScript (Strict mode).
-   **Styling**: Tailwind CSS (Configuration must match `customer` exactly).
-   **State Management**: React Context (Port existing `ShopContext`, `AuthContext`).
-   **Data Fetching**: Axios (Port existing services).
-   **Icons**: Lucide React.

### 3. Component Migration Strategy
-   **"Use Client" First**: To ensure rapid migration, mark ported components as `'use client'` initially if they use hooks (`useState`, `useEffect`). Optimization to Server Components is a secondary phase.
-   **Image Optimization**: Replace standard `<img>` tags with `next/image` where possible, but prioritize functionality first.
-   **Link Component**: Must replace `react-router-dom`'s `Link` with `next/link`.

### 4. Routing & State
-   **Route Mapping**:
    -   `/` -> `src/app/(main)/page.tsx`
    -   `/shop` -> `src/app/(main)/shop/page.tsx`
    -   `/product/:id` -> `src/app/(main)/product/[id]/page.tsx`
    -   `/cart` -> `src/app/(main)/cart/page.tsx`
    -   `/checkout` -> `src/app/checkout/page.tsx` (Separate layout)
-   **Global State**: Wrap the root layout in `ShopProvider` and `AuthProvider`. Handle `localStorage` access carefully to avoid hydration errors (use `useEffect`).

### 5. Styling & Design System
-   **Global CSS**: `store-front/src/app/globals.css` must mirror `customer/src/index.css`.
-   **Tailwind Config**: Must be identical to ensure design consistency.
-   **Fonts**: Use `next/font` to load fonts optimized.

## Critical Boundaries for Agents
1.  **Scope Isolation**: Each agent should work on a specific "vertical" (e.g., "Product Page", "Checkout Logic") to avoid merge conflicts.
2.  **Mocking vs. Real API**: Use the *real* API endpoints defined in `src/config/api.config.ts`. Do not introduce Mock Service Worker unless specified.
3.  **Authentication**: Respect the existing token-based auth flow. Ensure cookies/localStorage handling is SSR-safe.

## Known Issues / Gotchas
-   **Window Object**: Check for `typeof window !== 'undefined'` before accessing browser APIs.
-   **Hydration Errors**: Common with `localStorage` in Context initialization. Initialize state as empty/loading and sync with `localStorage` in `useEffect`.
-   **Router Hook**: `useNavigate` (React Router) -> `useRouter` (Next.js). Note that `router.push` is void.


## Definition of Done
-   Page renders without runtime errors.
-   Static assets (images, fonts) load correctly.
-   API calls function correctly (data loads).
-   Navigation works between pages.
-   Responsiveness matches the original design.
-   **Social Sharing**: Product pages MUST include Open Graph tags (`og:image`, `og:title`, `og:description`) to ensure image previews appear in WhatsApp/social media.

