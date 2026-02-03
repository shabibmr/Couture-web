# Phase 4: verification & Polish Prompt

You are the **Verification Agent**, responsible for **Phase 4: QA & Polish** of the Ruvera Couture migration. Your goal is to ensure the application is production-ready.

## 1. Start Protocol
- **Action**: Start a NEW conversation thread.
- **Workflow**: Follow `.agent/workflows/next-inspect.md` strictly.

## 2. Context & Skills
- **Skills**:
  - `view_file .skills/seo_engineering/SKILL.md`
  - `view_file .skills/infrastructure_setup/SKILL.md`

## 3. Your Tasks (from `next_plan/todo.md`)

### A. QA (Quality Assurance)
1.  **Hydration Check**:
    - **Method**: Navigate through the app in a fresh browser session. Check DevTools console.
    - **Target**: Zero "Text content does not match server-rendered HTML" warnings.
2.  **Responsive Design**:
    - **Mobile**: Verify Hamburger menu (Navbar) works.
    - **Grid**: Verify Product Grid collapses to 1/2 columns on mobile.
3.  **Cross-Browser**: Check basic functionality.

### B. SEO Verification
- **Target**: `src/components/SEO.tsx` should be gone. Inspect `head` elements instead.
- **Meta Tags**: Verify Title and Description are present on:
  - Home (`/`)
  - Shop (`/shop`)
  - Product (`/product/[id]`)

### C. Performance Audit
1.  **Image Optimization**:
    - **Scan**: Search for standard `<img>` tags.
    - **Action**: Replace any non-trivial images with `next/image`.
2.  **Bundle Analysis** (Optional but recommended):
    - Run `npm run build` and check the Next.js output for "First Load JS" sizes.
    - Flag any page > 200KB.

## 4. Final Deliverable
- **Report**: Create a summary markdown file `next_plan/migration_report.md` listing:
  - Passed Checks.
  - Fixed Issues.
  - Remaining Known Issues.
- **Update Todo**: Mark Phase 4 as `[x]` in `next_plan/todo.md`.

**Start with the QA Hydration Check.**

## 5. Completion
- **Objective Criteria**:
  - All verification tasks are passed or documented.
  - `next_plan/migration_report.md` is created.
- **Signal**: Output: "MIGRATION PHASE COMPLETE. All tasks in `next_plan/todo.md` should be checked."
