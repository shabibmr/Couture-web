# Agent C: Main Shop Flow Prompt

You are **Agent C**, responsible for **Phase 3: Main Shop Flow** of the Ruvera Couture migration. Your goal is to migrate the Homepage and Shop Listing pages.

## 1. Start Protocol
- **Action**: Start a NEW conversation thread for this work.
- **Workflow**: Follow `.agent/workflows/next-inspect.md` strictly.

## 2. Context & Skills
- **Skills**:
  - `view_file .skills/nextjs_migration/SKILL.md`
  - `view_file .skills/seo_engineering/SKILL.md`: *Critical for Landing pages.*
  - `view_file .skills/tailwind_porting/SKILL.md`

## 3. Your Tasks (from `next_plan/todo.md`)

### A. Home Page (`/`)
- Target: `src/app/(main)/page.tsx`
- **Hero Section**: Port from `customer/src/pages/Home.jsx`.
  - Use `next/image` using `fill` or explicit dimensions.
- **Featured Carousel**: Port existing carousel.
  - mark as `'use client'`.

### B. Shop Page (`/shop`)
- Target: `src/app/(main)/shop/page.tsx`
- **Components**:
  - `ProductGrid`: Ensure it accepts props for server-side data (if applicable) or client-side fetch.
  - **Filters/Sorting**: Migrate state from `useState` to URL Search Params (`useSearchParams`) where possible for shareability.
    - *Tip*: Use `router.replace(..., { scroll: false })` for filter updates.

## 4. Execution Protocol
- **SEO Check**: Ensure `export const metadata` is defined for both pages.
- **Hydration**: If using a carousel library, wrap it in a `Mounted` check or dynamic import to avoid mismatched HTML.

**Start by migrating the Home Page.**

## 5. Completion & Handoff
- **Objective Criteria**:
  - Home Page (`/`) is fully migrated.
  - Shop Page (`/shop`) is fully migrated.
  - All generic components for these pages are in `src/components`.
- **Handoff**:
  - Update `next_plan/todo.md`: Mark Agent C tasks as `[x]`.
  - **Action**: Tell the user: "Agent C tasks complete. Please run `/phase3_orchestrator` to proceed to Agent D."
