# Phase 3: Next.js Store-Front Configuration

## Overview
Configure the Next.js store-front application to properly load and optimize images from MinIO. This phase focuses on Next.js Image component configuration, not implementing new components (they already exist).

## Prerequisites
- ✅ Phase 1 & 2 complete (Backend API + Admin panel working)
- ✅ Products/Banners have MinIO URLs in database
- ✅ Store-front already uses `next/image` (verified in context analysis)

## Current State

### Existing Image Usage (✅ Already Implemented)
The store-front already uses Next.js Image components in:
- `components/home/Hero.tsx` - Hero banner
- `components/home/LiquidGallery.tsx` - Product gallery
- `components/product/ProductDetailClient.tsx` - Product details + related items
- `components/cart/CartDrawer.tsx` - Cart item thumbnails
- `app/(main)/shop/ShopClient.tsx` - Product grid
- `app/checkout/CheckoutClient.tsx` - Checkout order summary
- `components/common/Navbar.tsx` - Logo

### Current Image Sources
Components receive URLs from:
- `product.image` (alias for `featured_image`)
- `product.featured_image` 
- `banner.image_url`
- `ProductVariant.variant_image`

---

## Implementation Steps

### Step 3.1: Configure Next.js Image Domains

**File**: `store-front/next.config.ts` (MODIFY)

**Current Config** (likely minimal):
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

**Updated Config**:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/ruvera-assets/**',
      },
      // Add production MinIO domain when deploying
      // {
      //   protocol: 'https',
      //   hostname: 'cdn.yourdomain.com',
      //   pathname: '/ruvera-assets/**',
      // },
    ],
  },
};

export default nextConfig;
```

**Explanation**:
- `remotePatterns` - Whitelists external domains for Next.js Image optimization
- `protocol: 'http'` - Matches MinIO local dev setup (use `https` in production)
- `hostname: 'localhost'` - MinIO endpoint (change to production domain later)
- `port: '9000'` - MinIO API port
- `pathname: '/ruvera-assets/**'` - Only allow images from this bucket

---

### Step 3.2: Environment Variable (Optional but Recommended)

**File**: `store-front/.env.local` (MODIFY or CREATE)

Add MinIO base URL for consistency:
```env
NEXT_PUBLIC_MINIO_BASE_URL=http://localhost:9000/ruvera-assets
```

**Usage in API calls** (if needed):
```typescript
const minioBaseUrl = process.env.NEXT_PUBLIC_MINIO_BASE_URL || 'http://localhost:9000/ruvera-assets';
```

*Note: This is optional since backend API already returns full URLs.*

---

### Step 3.3: Verify Existing Image Components

No code changes needed, but verify the components use best practices:

**✅ Good Example** (already in use):
```tsx
import Image from 'next/image';

<Image
    src={displayImage}  // MinIO URL from API
    alt={product.name}
    width={500}
    height={500}
    className="object-cover"
    priority  // For LCP images (hero, first product)
/>
```

**❌ Bad Example** (avoid):
```tsx
<img src={displayImage} alt={product.name} />  // Don't use raw <img>
```

**Key Props**:
- `src` - Full MinIO URL (e.g., `http://localhost:9000/ruvera-assets/uploads/...`)
- `width` & `height` - Required for optimization (prevents layout shift)
- `priority` - Mark LCP images (hero banner, first product) for faster loading
- `className` - Styling classes (Tailwind CSS)
- `fill` - For responsive containers (alternative to width/height)

---

### Step 3.4: Handle Missing Images Gracefully

**Add Fallback Pattern** (where appropriate):

```tsx
<Image
    src={displayImage || '/fallback-product.png'}
    alt={product.name}
    width={500}
    height={500}
    onError={(e) => {
        e.currentTarget.src = '/fallback-product.png';
    }}
/>
```

**Create Fallback Images**:
- Place `fallback-product.png` in `store-front/public/`
- Use simple placeholder or "No Image Available" graphic

---

## Testing

### Step 3.5: Development Server Testing

1. **Start Next.js Dev Server**:
   ```bash
   cd store-front
   npm run dev
   ```
   *Open: http://localhost:3000*

2. **Test Home Page** (`/`):
   - Verify Hero banner loads from MinIO
   - Verify LiquidGallery product images load
   - Open browser DevTools → Network tab
   - Confirm images requested from `localhost:9000`
   - Check for Next.js optimized image format (WebP where supported)

3. **Test Shop Page** (`/shop`):
   - Verify all product grid thumbnails load
   - Scroll to trigger lazy loading
   - Confirm images load progressively

4. **Test Product Detail** (`/product/[id]`):
   - Click on a product
   - Verify main product image loads
   - Verify additional gallery images load (if present)
   - Verify related products section images load

5. **Test Cart Drawer**:
   - Add item to cart
   - Open cart drawer
   - Verify cart item thumbnail loads from MinIO

6. **Test Checkout** (`/checkout`):
   - Proceed to checkout
   - Verify order summary images load

---

### Step 3.6: Production Build Testing

1. **Create Production Build**:
   ```bash
   cd store-front
   npm run build
   ```

2. **Expected Output**:
   ```
   ✓ Compiled successfully
   ✓ Collecting page data
   ✓ Generating static pages
   ✓ Finalizing page optimization
   ```

3. **Check for Errors**:
   - Should NOT see: "Invalid src prop" errors
   - Should NOT see: "hostname not configured under images" errors

4. **Start Production Server**:
   ```bash
   npm start
   ```

5. **Verify Production Build**:
   - Navigate through pages
   - Confirm images load correctly
   - Check Network tab for optimized WebP images

---

### Step 3.7: Performance Testing

**Use Lighthouse** (Chrome DevTools):

1. Open Home page in Chrome
2. DevTools → Lighthouse tab
3. Run report (Performance, Best Practices, SEO)
4. Check metrics:
   - **LCP (Largest Contentful Paint)**: Should be < 2.5s
     - Hero image should be marked with `priority` prop
   - **Image Optimization**: Should show "Properly sized images"
   - **Next.js Image**: Should detect optimized formats (WebP)

**Expected Score**:
- Performance: 90+
- SEO: 95+

---

### Step 3.8: Error Handling Tests

1. **Test Invalid MinIO URL**:
   - Temporarily change a product's `featured_image` to invalid URL
   - Reload product page
   - Verify:
     - Fallback image displays (if implemented)
     - OR Next.js shows built-in error placeholder
     - No page crash

2. **Test MinIO Server Down**:
   - Stop MinIO container: `docker-compose stop minio`
   - Reload store-front pages
   - Verify:
     - Images fail to load but page remains functional
     - Fallback images appear (if implemented)
   - Restart MinIO: `docker-compose start minio`

3. **Test Unconfigured Domain**:
   - Temporarily remove MinIO from `remotePatterns`
   - Reload page with MinIO images
   - Verify Next.js error: "Invalid src prop...hostname not configured"
   - Re-add configuration

---

## Verification Checklist

- [ ] `next.config.ts` updated with MinIO domain in `images.remotePatterns`
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] Home page hero banner loads from MinIO
- [ ] Shop page product grid images load from MinIO
- [ ] Product detail page images load from MinIO
- [ ] Cart drawer thumbnails load from MinIO
- [ ] Checkout page images load from MinIO
- [ ] Production build succeeds (`npm run build`)
- [ ] No "Invalid src prop" errors in console
- [ ] No "hostname not configured" errors
- [ ] Images use Next.js optimization (WebP format in Network tab)
- [ ] LCP performance < 2.5s (Lighthouse)
- [ ] Fallback images display for missing/broken URLs

---

## Next.js Image Optimization Benefits

After configuration, you get automatic:

1. **Format Optimization**:
   - Serves WebP/AVIF to supported browsers
   - Falls back to original format for older browsers

2. **Size Optimization**:
   - Generates multiple sizes for responsive loading
   - Serves appropriate size based on device/viewport

3. **Lazy Loading**:
   - Images below fold load only when scrolled into view
   - Reduces initial page load time

4. **Priority Loading**:
   - Images with `priority` prop preload (hero banner, LCP images)

5. **Blur Placeholder** (Optional):
   - Add `placeholder="blur"` with `blurDataURL` for smooth loading

---

## Production Deployment Checklist

When deploying to production:

- [ ] Change `protocol: 'https'` in `next.config.ts`
- [ ] Update `hostname` to production MinIO domain (e.g., `cdn.yourdomain.com`)
- [ ] Remove `port` config if MinIO uses standard HTTPS port (443)
- [ ] Update `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Set MinIO bucket to public read access
- [ ] Consider CDN in front of MinIO for global performance
- [ ] Test production build with production MinIO URLs

**Example Production Config**:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cdn.ruvera.com',
      pathname: '/ruvera-assets/**',
    },
  ],
}
```

---

## Next Steps

After completing Phase 3, proceed to:
- **Phase 4**: Data migration and cleanup scripts
