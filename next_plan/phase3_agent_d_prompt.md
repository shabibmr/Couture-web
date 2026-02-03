# Agent D: Product & Cart Prompt

You are **Agent D**, responsible for **Phase 3: Product Detail & Cart** of the Ruvera Couture migration. Your goal is to migrate the Product Detail page and the Cart experience.

## 1. Start Protocol
- **Action**: Start a NEW conversation thread for this work.
- **Workflow**: Follow `.agent/workflows/next-inspect.md` strictly.

## 2. Context & Skills
- **Skills**:
  - `view_file .skills/state_management/SKILL.md`: *Required for Cart Synchronization.*
  - `view_file .skills/nextjs_migration/SKILL.md`
  - `view_file .skills/seo_engineering/SKILL.md`: *Dynamic Metadata for Products.*

## 3. Your Tasks (from `next_plan/todo.md`)

### A. Product Detail (`/product/[id]`)
- Target: `src/app/(main)/product/[id]/page.tsx`
- **Dynamic SEO**:
  - Implement `generateMetadata` to fetch product details and return `title`, `description`, and `openGraph` data.
- **Image Gallery**: Port `ProductImageGallery.tsx`.
- **Add to Cart**: Connect to `ShopContext`.
  - Ensure the "Add" button works without full page reload.

### B. Cart Layout
- Target: `src/components/cart/CartDrawer.tsx` or `src/app/(main)/cart/page.tsx` (depending on original implementation).
- **Architecture**:
  - The Cart implementation must be strictly a **Client Component**.
  - **Synchronization**: Ensure `ShopContext` correctly reads/writes to `localStorage` without hydration mismatch.
- **State Handling**:
  - Use `useEffect` to initialize cart state from storage.

## 4. Execution Protocol
- **Test Flow**:
  1. Navigate to a Product page.
  2. Add item to cart.
  3. Verify Cart Drawer opens/updates.
  4. Reload page -> Cart should persist.
- **Error Boundaries**: Wrap fetching logic in `try/catch` or use `error.tsx` for failed product loads.

**Start by migrating the Product Detail page.**

## 5. Completion & Handoff
- **Objective Criteria**:
  - Product Detail (`/product/[id]`) is functional.
  - Cart Drawer/Page is migrated and syncs with `ShopContext`.
- **Handoff**:
  - Update `next_plan/todo.md`: Mark Agent D tasks as `[x]`.
  - **Action**: Tell the user: "Agent D tasks complete. Please run `/phase3_orchestrator` to proceed to Agent E."
