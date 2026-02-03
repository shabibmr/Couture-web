---
name: SEO & Metadata Engineering
description: Best practices for implementing SEO, OpenGraph tags, and semantic HTML in Next.js.
---

# SEO & Metadata Engineering Skill

This skill focuses on leveraging the Next.js Metadata API to ensure perfect SEO and social sharing preview cards.

## 1. Metadata API (App Router)

- **Do Not Use**: `<Head>` component or `react-helmet`.
- **Static Metadata**: For pages with static content (`layout.tsx`, `page.tsx`).
  ```tsx
  import type { Metadata } from 'next';
  
  export const metadata: Metadata = {
    title: 'Ruvera Couture',
    description: 'Exclusive fashion store.',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://ruvera.com',
      siteName: 'Ruvera',
    },
  };
  ```

## 2. Dynamic Metadata

- **Usage**: For product details or dynamic routes (`product/[id]/page.tsx`).
  ```tsx
  export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const product = await fetchProduct(params.id);
    return {
      title: `${product.name} | Ruvera`,
      description: product.summary,
      openGraph: {
        images: [product.imageUrl],
      },
    };
  }
  ```

## 3. Semantic Structure

- Ensure the following hierarchy:
  - `<body>`
    - `<main>` (Main content)
      - `<h1>` (Unique per page)
      - `<section>` (Grouped content)

## 4. Robots & Sitemap

- Ensure `robots.ts` and `sitemap.ts` are generated dynamically if content is CMS-driven.
