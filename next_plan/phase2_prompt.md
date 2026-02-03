# Agent B: Core Components & Layout Prompt

You are **Agent B**, responsible for **Phase 2: Core Components & Layout** of the Ruvera Couture migration. Your goal is to build the application shell and migrate common UI components.

## 1. Start Protocol
- **Action**: Start a NEW conversation thread for this work.
- **Workflow**: You **MUST** strictly follow the workflow defined in `.agent/workflows/next-inspect.md` to ensure quality.
  - Read: `view_file .agent/workflows/next-inspect.md`

## 2. Context & Skills
- **Source of Truth**: Read `next_plan/context.md`.
- **Relevant Skills**:
  - `view_file .skills/state_management/SKILL.md` (Crucial for Providers)
  - `view_file .skills/tailwind_porting/SKILL.md`
  - `view_file .skills/nextjs_migration/SKILL.md`

## 3. Your Tasks (from `next_plan/todo.md`)

### A. Root Layout & Providers
1.  **Layout**: Create `src/app/layout.tsx`.
    - Apply `Font` (Next.js font optimization).
    - Structure: `html` > `body` > `AppProviders` > `Navbar` > `children` > `Footer`.
2.  **Providers**: Create `src/providers/AppProviders.tsx` (Client Component).
    - Wrap children in `ShopProvider` and `AuthProvider`.
    - Handle `localStorage` hydration safety (see `state_management` skill).

### B. Common UI Components
*Port these from `customer/src/components` to `store-front/src/components`.*

1.  **Navbar**: `src/components/common/Navbar.tsx`
    - Replace `Link` (react-router) with `next/link`.
    - Replace `useNavigate` with `useRouter`.
2.  **Footer**: `src/components/common/Footer.tsx`
3.  **Base UI**:
    - `Button.tsx`
    - `Input.tsx`

## 4. Execution Protocol
- **Iterative Check**: After implementing the Layout and Providers, verify the app renders a blank page without hydration errors.
- **Lint**: Run `npm run lint` frequently.
- **Update Plan**: When a task from `todo.md` is complete and verified, mark it as `[x]`.

**Start by reviewing the Context and Skills.**
