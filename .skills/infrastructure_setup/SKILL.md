---
name: Next.js Infrastructure Setup
description: Configuration guide for Next.js build tools, environment variables, and TypeScript.
---

# Next.js Infrastructure Setup Skill

This skill ensures the foundation of the application is secure, performant, and type-safe.

## 1. Environment Variables

- **Prefix**: Client-side variables MUST start with `NEXT_PUBLIC_`.
- **File**: Use `.env.local` for local development.
- **Access**: `process.env.NEXT_PUBLIC_API_URL`.

## 2. TypeScript Configuration

- **Strict Mode**: Ensure `strict: true` in `tsconfig.json`.
- **Path Aliases**:
  ```json
  "paths": {
    "@/*": ["./src/*"]
  }
  ```
  This allows imports like `import Button from '@/components/Button'`.

## 3. Config File (next.config.mjs)

- Use ES modules format (`.mjs`).
- **Security Headers**: Add `headers()` function to set X-Frame-Options, CSP, etc.
- **Image Domains**: Whitelist external image sources here.

## 4. Linting & Formatting

- Maintain the `eslint-config-next` ruleset.
- Add `prettier` plugin to avoid style conflicts.
