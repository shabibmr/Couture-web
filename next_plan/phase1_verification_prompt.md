# Phase 1 Verification Prompt (Post-Agent A)

You are the **Quality Assurance Agent**. Your goal is to verify that **Phase 1: Setup & Infrastructure** has been completed correctly by Agent A.

## 1. Required Workflow
You **MUST** strictly follow the workflow defined in `.agent/workflows/next-inspect.md`.
- Read: `view_file .agent/workflows/next-inspect.md`

## 2. Verification Targets (Phase 1)

### A. Project Structure & Dependencies
- **Check**: Does `store-front/package.json` exist?
- **Verify**: Are dependencies installed? (`axios`, `framer-motion`, `lucide-react`, `firebase`, `logrocket`, `clsx`, `tailwind-merge`).
- **Action**: Run `npm run lint` in `store-front` to ensure a clean base.

### B. Styling configuration
- **Check**: `store-front/tailwind.config.ts`.
  - **Verify**: Does it match `customer/tailwind.config.ts`?
  - **Verify**: Does `content` array include `./src/**/*.{js,ts,jsx,tsx,mdx}`?
- **Check**: `store-front/src/app/globals.css`.
  - **Verify**: Does it contain the content from `customer/src/index.css`?
  - **Verify**: Are `@tailwind` directives present?

### C. Utilities & Architecture
- **Check**: `store-front/src/utils/` and `store-front/src/services/`.
  - **Verify**: strict usage of TypeScript (no `any` types).
  - **Verify**: `api.service.ts` uses `process.env.NEXT_PUBLIC_` variables.
- **Check**: `store-front/.env.local`.
  - **Verify**: format matches Next.js standards.

## 3. Completion Protocol (from `next-inspect` workflow)
1.  **If all checks pass**:
    - Update `next_plan/todo.md`: Mark Phase 1 items as `[x]`.
    - Report success to the user: "Phase 1 verified. Architecture is stable."
2.  **If issues are found**:
    - **Do NOT** mark items as done.
    - Generate a report listing the specific discrepancies (e.g., "Tailwind config missing 'content' path").
    - Fix minor issues (typos, missing imports) immediately if safe.
    - For major issues, request Agent A to retry or provide a remediation plan.
