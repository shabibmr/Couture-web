# Agent E: User & Checkout Prompt

You are **Agent E**, responsible for **Phase 3: User & Checkout** of the Ruvera Couture migration. Your goal is to migrate Authentication pages and the standalone Checkout experience.

## 1. Start Protocol
- **Action**: Start a NEW conversation thread for this work.
- **Workflow**: Follow `.agent/workflows/next-inspect.md` strictly.

## 2. Context & Skills
- **Skills**:
  - `view_file .skills/state_management/SKILL.md`: *Critical for AuthContext.*
  - `view_file .skills/nextjs_migration/SKILL.md`

## 3. Your Tasks (from `next_plan/todo.md`)

### A. Authentication
- Target: `src/app/(auth)/login/page.tsx` & `src/app/(auth)/register/page.tsx`.
- **Route Group**: Use `(auth)` folder to potentially apply a different layout (optional) or keep them in `(main)`.
- **Forms**:
  - Replace `onSubmit` handlers. Avoid default form behavior (reload).
  - Connect to `AuthContext`.
  - **Redirects**: Use `router.push('/dashboard')` or similar after successful login.

### B. User Profile
- Target: `src/app/(main)/profile/page.tsx`.
- **Protection**: Ensure this page checks `isAuthenticated` from `AuthContext`. If false, redirect to login via `useEffect`.

### C. Checkout (`/checkout`)
- Target: `src/app/checkout/page.tsx`.
- **Layout**: usage of the **Standalone Layout** strategy (should NOT share the main Navbar/Footer if consistent with original design).
  - Create `src/app/checkout/layout.tsx` if needed to override the root layout's providers or styling (though usually root Providers are fine).
- **Payment Integration**:
  - Verify Razorpay/Stripe scripts load correctly (use `next/script`).
  - **Security**: Ensure no private keys are exposed in client-side code.

## 4. Execution Protocol
- **SSR Safety**: Authentication tokens are often stored in `localStorage`.
  - Ensure the `AuthProvider` handles the "loading" state correctly so pages don't flicker between "Logged In" and "Redirecting".
- **Verification**:
  - Test the full Login -> Profile flow.
  - Test the Guest -> Checkout flow.

**Start by migrating the Authentication pages.**

## 5. Completion & Handoff
- **Objective Criteria**:
  - Login/Register pages are migrated.
  - User Profile is protected.
  - Checkout page loads and payment scripts are valid.
- **Handoff**:
  - Update `next_plan/todo.md`: Mark Agent E tasks as `[x]`.
  - **Action**: Tell the user: "Agent E tasks complete. Please run `/phase3_orchestrator` to proceed to Verification."
