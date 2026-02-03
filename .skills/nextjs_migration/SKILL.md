---
name: Next.js App Router Migration
description: Comprehensive guide for migrating React Router (SPA) patterns to Next.js 14+ App Router.
---

# Next.js App Router Migration Skill

This skill provides the specific steps and patterns required to migrate a standard Vite/React application to Next.js App Router.

## 1. Routing Replacements

### Hooks
- **Old**: `import { useNavigate } from 'react-router-dom'; const navigate = useNavigate();`
- **New**: `import { useRouter } from 'next/navigation'; const router = useRouter();`
- **Note**: `router.push('/path')` is void and does not return a promise.

### Components
- **Old**: `import { Link } from 'react-router-dom'; <Link to="/path">`
- **New**: `import Link from 'next/link'; <Link href="/path">`

### Route Parameters
- **Old**: `import { useParams } from 'react-router-dom'; const { id } = useParams();`
- **New**: 
    - **Server Components**: Props `params: { id: string }` are passed directly to the page component.
    - **Client Components**: `import { useParams } from 'next/navigation';`

## 2. Directory Structure & Layouts

- **File System Routing**: 
  - `src/pages/Home.tsx` -> `src/app/page.tsx`
  - `src/pages/Product.tsx` -> `src/app/product/[id]/page.tsx`
- **Layouts**: 
  - Wrap common UI (Navbar, Footer) in `src/app/layout.tsx`.
  - Use `(group)` folders to share layouts without affecting URL structure (e.g., `src/app/(main)/layout.tsx`).

## 3. Client vs. Server Components

- **Default**: All components in `app` are **Server Components** by default.
- **Directive**: Add `'use client';` at the very top of the file if the component uses:
  - Event listeners (`onClick`, `onChange`)
  - React Hooks (`useState`, `useEffect`)
  - Browser-only APIs (`localStorage`, `window`)

## 4. General Migration Workflow
1. Create the target file in `src/app`.
2. Copy content from the source React component.
3. Fix imports (Images, Link, Router).
4. Add `'use client';` if necessary (start with it for speed, optimize later).
5. Verify it renders.
