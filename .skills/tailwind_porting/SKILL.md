---
name: Tailwind & Design System Porting
description: Guide for porting Tailwind CSS configurations, styles, and assets to Next.js.
---

# Tailwind & Design System Porting Skill

This skill ensures visual fidelity when migrating to Next.js by correctly configuring Tailwind, fonts, and assets.

## 1. Configuration Parity

- **tailwind.config.ts**: Copy the entire content from the source project's `tailwind.config.ts`.
  - Ensure `content` paths include the new `app` directory:
    ```ts
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Add this
    ],
    ```

## 2. Global Styles

- **Source**: `src/index.css` (Vite)
- **Target**: `src/app/globals.css` (Next.js)
- **Action**: Copy all contents. Ensure Tailwind directives are present:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

## 3. Fonts & Assets

- **Fonts**: Do not use CSS `@import` for Google Fonts if possible. Use `next/font/google`.
  ```ts
  import { Inter } from 'next/font/google';
  const inter = Inter({ subsets: ['latin'] });
  // Add className={inter.className} to <body /> in layout.tsx
  ```

- **Images**:
  - Replace `<img src="..." />` with `<Image src="..." width={w} height={h} />`.
  - **remotePatterns**: If loading images from external URLs, update `next.config.mjs` to allow the domains.

## 4. UI Library Components

- When migrating components (Buttons, Inputs, Modals), ensure they retain their full Tailwind class strings.
- Verify `cn` (classnames) utility usage is consistent.
