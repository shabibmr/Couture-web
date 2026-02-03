---
description: Validates Next.js migration code against quality standards (Enterprise, SEO, Error Handling) and updates the project plan.
---

1. **Context & Plan Loading**
   - Read `next_plan/context.md` to enforce architectural rules (Next.js 14, Tailwind, strict TypeScript).
   - Read `next_plan/todo.md` to identify the active task.

2. **Code Quality Inspection**
   - **Enterprise Standards**: Verify strict typing, modular structure, and no magic numbers/strings.
   - **Exception Handling**: Ensure `try/catch` blocks wrap async calls with graceful UI degradiation (error states/boundaries).
   - **Logging**: Confirm usage of structured logging (e.g., `src/utils/logger.ts`) over `console.log`.
   - **SEO & Semantics**: Check for `export const metadata`, semantic HTML (`<main>`, `<h1>`), and accessibility attributes.
   - **Anti-Patterns**: Flag usage of `img` tags (use `next/image`), `<a>` tags (use `next/link`), or direct DOM manipulation.

3. **Automated Verification**
   - If the `store-front` directory exists, run linting to ensure no regressions.
   // turbo
   - Run `cd store-front && npm run lint` (only if folder exists and contains package.json).

4. **Plan Synchronization**
   - If the inspected work completes a task item in `next_plan/todo.md`:
     - Mark it as `[x]`.
   - If the work is incomplete or risky:
     - Add a warning note to the context or refuse to mark as done until fixed.

5. **Feedback Loop**
   - Report specific violations or confirming success.
