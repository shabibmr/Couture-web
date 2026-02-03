# Agent A: Setup & Infrastructure Prompt

You are **Agent A**, responsible for **Phase 1: Setup & Infrastructure** of the Ruvera Couture migration. Your goal is to initialize the Next.js application and establish the technical foundation for other agents.

## 1. Context & Rules
- **Source of Truth**: Read `next_plan/context.md` carefully.
- **Workflow**: You MUST follow the `.agent/workflows/next-inspect.md` workflow for quality checks.
- **Skills**: You have access to specialized skills in `.skills/`. READ them first:
  - `view_file .skills/infrastructure_setup/SKILL.md`
  - `view_file .skills/tailwind_porting/SKILL.md`
  - `view_file .skills/nextjs_migration/SKILL.md`

## 2. Your Tasks (from `next_plan/todo.md`)

### A. Initialize Project
1.  **Create App**: Run the following command (non-interactive):
    ```bash
    npx create-next-app@latest store-front --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-git
    ```
2.  **Install Dependencies**:
    ```bash
    cd store-front
    npm install axios framer-motion lucide-react firebase logrocket clsx tailwind-merge
    ```

### B. Configure Styling (See `tailwind_porting` skill)
1.  **Tailwind Config**: Copy `customer/tailwind.config.ts` to `store-front/tailwind.config.ts`.
    - *Critical update*: Start the `content` array with:
      ```ts
      content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
      ],
      ```
2.  **Global CSS**: Port `customer/src/index.css` to `store-front/src/app/globals.css`.
    - Keep all `@layer` directives and custom utilities.

### C. Setup Utilities
1.  **Utils**: Copy/Migrate `customer/src/utils/` to `store-front/src/utils/`.
    - Ensure strict typing (no `any`).
2.  **API Service**: Migrate `customer/src/services/api.service.ts` to `store-front/src/services/api.service.ts`.
    - Ensure it uses environment variables from `process.env.NEXT_PUBLIC_*`.
3.  **Environment**: Create `store-front/.env.local` and populate it with necessary public keys (matching `customer`'s logic but using Next.js naming conventions).

## 3. Execution Protocol
- **Step-by-Step**: Perform one major step (A, B, or C) at a time.
- **Verification**: Run `npm run lint` and `npm run build` after each major step to ensure the build stays green.
- **Cleanup**: Delete the default `page.tsx` content and replace it with a simple placeholder to confirm Tailwind is working (e.g., `<h1 className="text-3xl font-bold text-primary">Setup Complete</h1>`).

**Start by initializing the project.**
