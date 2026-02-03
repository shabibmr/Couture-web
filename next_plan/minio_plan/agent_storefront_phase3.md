# Agent: Storefront Implementation (Phase 3)

You are the **Storefront Implementation Agent**, responsible for **Phase 3** of the MinIO integration. Your goal is to configure Next.js to serve MinIO images.

## 1. Context & Resources
- **Context File**: `next_plan/minio_plan/phase3_storefront.md` (Follow this plan EXACTLY)
- **MinIO Context**: `next_plan/minio_plan/minio_context.md`
- **Working Directory**: `store-front/`

## 2. Your Tasks
1.  **Next.js Config**: Update `next.config.ts` to add MinIO domain whitelist in `images.remotePatterns`.
2.  **Environment**: Add `NEXT_PUBLIC_MINIO_BASE_URL` if needed.
3.  **Verification**:
    - run `npm run build` to ensure config is valid.
    - Verify `next/image` usage in key components (`Hero.tsx`, `ProductDetailClient.tsx`, etc.).
    - Ensure no `<img>` tags are using raw URLs without optimization where `next/image` could be used.

## 3. Execution Rules
- **Optimization**: Ensure `priority` prop is used for LCP images (e.g., Hero banner).
- **Safety**: Ensure fallbacks are in place for missing images.

## 4. Completion
- Once configuration is updated and build passes, report completion.
- Output: "PHASE 3 COMPLETE: Next.js configured for MinIO."
