# Ruvéra Couture Design System Guide

> A comprehensive analysis of shapes, borders, layouts, and visual design patterns used throughout the Ruvéra Couture application ecosystem.

---

## 🎨 Design Philosophy

The Ruvéra Couture design system embodies **premium, avant-garde elegance** through:
- **Organic shapes** that evoke fluidity and sophistication
- **Minimal, refined layouts** with intentional negative space
- **Editorial typography** combining modern sans-serif with classic serif fonts
- **Warm, neutral palette** anchored by cream backgrounds and burnished gold accents
- **Subtle animations** that enhance without overwhelming

---

## 📐 Shapes & Border Radius

### Organic Blob Shapes

The signature visual element of the design system is **CSS-based organic shapes** created using complex `border-radius` values. These create fluid, asymmetric forms that feel handcrafted and luxurious.

#### Defined Blob Shapes

```css
/* Blob 1 - Smooth Organic */
border-radius: 50% 50% 40% 60% / 60% 50% 60% 40%;

/* Blob 2 - Angular Organic */
border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;

/* Blob 3 - Elongated Organic */
border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;

/* Blob 4 - Balanced Organic */
border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
```

#### Usage Pattern

- **Product images** use rotating blob shapes (cycling through 4 variants based on index)
- **Product detail page** features a large organic shape (Blob 4: `40% 60% 70% 30% / 40% 50% 60% 50%`)
- **Category grid** applies different blob shapes to each product card for visual variety
- **Liquid Gallery** applies organic shapes to all product thumbnails

#### Implementation Example

```jsx
// From CategoryPage.jsx
const organicShapes = [
    "50% 50% 40% 60% / 60% 50% 60% 40%",
    "30% 70% 70% 30% / 30% 30% 70% 70%",
    "60% 40% 30% 70% / 60% 30% 70% 40%",
    "40% 60% 70% 30% / 40% 50% 60% 50%",
];

<div 
  style={{ borderRadius: organicShapes[index % organicShapes.length] }}
  className="w-full h-full bg-stone-200 overflow-hidden shadow-lg"
>
  <img src={product.image} alt={product.title} />
</div>
```

### Standard Border Radius Values

For UI components (cards, buttons, inputs), the system uses standard radius values:

| Element | Border Radius | Purpose |
|---------|---------------|---------|
| Small cards/thumbnails | `rounded-sm` (2px) | Product thumbnails in cart |
| Standard cards | `rounded-lg` (8px) | Input fields, small buttons |
| Medium cards | `rounded-xl` (12px) | Content cards, toolbars |
| Large cards | `rounded-2xl` (16px) | Stat cards, dashboard panels |
| Circular buttons | `rounded-full` (9999px) | Size selectors, badges, close buttons |

---

## 🌈 Color System

### Primary Palette

```css
/* Brand Colors */
--ruvera-gold: #AF9164;      /* Burnished gold - Primary accent */
--midnight: #1A1A1A;         /* Deep editorial black */
--cream-bg: #FDFBF7;         /* Warm cream background */

/* Stone Neutral Scale */
--stone-50:  #fafaf9;
--stone-100: #f5f5f4;
--stone-200: #e7e5e4;
--stone-300: #d6d3d1;
--stone-400: #a8a29e;
--stone-500: #78716c;
--stone-600: #57534e;
--stone-700: #44403c;
--stone-800: #292524;
--stone-900: #1c1917;
--stone-950: #0c0a09;
```

### Color Usage Guidelines

| Context | Color | Usage |
|---------|-------|-------|
| **Customer App Background** | `#FDFBF7` (cream) | Body, main sections |
| **Admin App Background** | `stone-50` | Body background |
| **Primary Actions** | `ruvera-gold` | CTAs, hover states, active nav |
| **Secondary Actions** | `midnight` / `stone-900` | Filled buttons, emphasis |
| **Text - Primary** | `stone-900` / `midnight` | Headings, body text |
| **Text - Secondary** | `stone-600` / `stone-500` | Metadata, captions |
| **Text - Tertiary** | `stone-400` | Placeholders, disabled states |
| **Admin Sidebar** | `midnight` background | Navigation sidebar |
| **Borders** | `stone-100` / `stone-200` | Subtle dividers, card borders |

### Gradient Applications

```css
/* Navigation fade (Customer) */
background: linear-gradient(to bottom, #FDFBF7, transparent);

/* Icon containers (Admin) */
background: linear-gradient(to bottom right, from-midnight to-stone-700);
background: linear-gradient(to bottom right, from-ruvera-gold to-yellow-600);

/* Glossy overlays */
background: linear-gradient(to top right, from-white/10 to-transparent);
```

---

## 📝 Typography System

### Font Families

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

--font-sans: 'Outfit', sans-serif;      /* Body, UI, labels */
--font-serif: 'Playfair Display', serif; /* Headings, brand elements */
```

### Type Scale & Hierarchy

#### Customer-Facing Application

| Element | Font | Size | Weight | Case | Tracking |
|---------|------|------|--------|------|----------|
| Hero Headlines | Serif | `text-6xl` to `text-8xl` | Normal to Light | Mixed | Normal |
| Page Titles | Serif | `text-5xl` to `text-7xl` | Normal | Capitalize, Italic | Normal |
| Product Titles (Detail) | Serif | `text-4xl` to `text-6xl` | Normal | Normal | Normal |
| Product Names (Cards) | Serif | `text-lg` | Normal | Normal | Normal |
| Product Names (Tiny) | Sans | `text-xs` | Bold | Uppercase | `0.3em` |
| Body Text | Sans | `text-sm` to `text-base` | Light (300) | Normal | `relaxed` |
| Price (Large) | Sans | `text-xl` | Medium (500) | Normal | Normal |
| Labels/Meta | Sans | `text-xs` | Bold (700) | Uppercase | `widest` (0.2em) |
| Buttons | Sans | `text-sm` | Medium (500) | Uppercase | `0.2em` |

#### Admin Application

| Element | Font | Size | Weight | Case | Tracking |
|---------|------|------|--------|------|----------|
| Page Titles | Serif | `text-3xl` to `text-4xl` | Normal | Normal | Normal |
| Card Titles | Serif | `text-xl` | Normal | Normal | Normal |
| Body Text | Sans | `text-sm` | Normal | Normal | Normal |
| Table Headers | Sans | `text-xs` | Medium | Uppercase | `wider` |
| Navigation | Sans | Default | Medium | Normal | `wide` |
| Stat Values | Serif | `text-3xl` | Normal | Normal | Normal |

### Typography Best Practices

- **Serif for emotion**: Product names, headlines, brand messaging
- **Sans for function**: Navigation, buttons, labels, metadata
- **Uppercase + tracking** for labels and CTAs creates premium feel
- **Italic serif** for elegant, editorial emphasis
- **Light font weights** (300) for body text enhances readability

---

## 📏 Layout & Spacing System

### Grid Systems

#### Customer Category Grid (Product Listing)

```jsx
// 3-column responsive grid
grid grid-cols-1 md:grid-cols-3 gap-y-20 gap-x-12
```

- **Vertical gap**: `gap-y-20` (5rem / 80px) - Generous breathing room
- **Horizontal gap**: `gap-x-12` (3rem / 48px) - Moderate separation

#### Liquid Gallery (Homepage)

```jsx
// 12-column layout split
grid grid-cols-1 lg:grid-cols-12 gap-12

// Left column (products)
lg:col-span-8
  // 4-column product grid
  grid grid-cols-2 md:grid-cols-4 gap-y-16 gap-x-4

// Right column (featured)
lg:col-span-4
```

- Main content uses **8 columns**, sidebar uses **4 columns**
- Product sub-grid: 4 columns on desktop, 2 on mobile
- Staggered gaps: `gap-y-16` (4rem) vertically, `gap-x-4` (1rem) horizontally

#### Admin Dashboard Grid

```jsx
// Stat cards
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6

// Content panels
grid grid-cols-1 lg:grid-cols-3 gap-8
```

- **Stat cards**: 4-column layout on large screens, responsive collapse
- **Content sections**: 2:1 ratio (main content vs sidebar)

### Container Strategy

| Context | Max Width | Padding |
|---------|-----------|---------|
| Customer main | `1400px` | `px-6` to `px-8` |
| Category page | `container mx-auto` | `px-6` |
| Admin content | `max-w-7xl mx-auto` | `p-8` to `p-12` |

### Spacing Scale (Common Patterns)

```css
gap-2   → 0.5rem  (8px)   - Tight grouping (icon + text)
gap-3   → 0.75rem (12px)  - Standard inline spacing
gap-4   → 1rem    (16px)  - Component internal spacing
gap-6   → 1.5rem  (24px)  - Card group spacing
gap-8   → 2rem    (32px)  - Section spacing
gap-12  → 3rem    (48px)  - Large section spacing
gap-16  → 4rem    (64px)  - Product card vertical spacing
gap-20  → 5rem    (80px)  - Generous product spacing
```

---

## 🧩 Component Patterns

### Cards & Containers

#### Product Card (Customer)

```jsx
<div className="group cursor-pointer">
  {/* Image container with organic shape */}
  <div className="relative aspect-[3/4] mb-6 
                  transition-transform duration-500 
                  group-hover:scale-[1.02]">
    <div style={{ borderRadius: organicShape }}
         className="w-full h-full bg-stone-200 overflow-hidden shadow-lg">
      <img className="group-hover:scale-110 
                     transition-transform duration-700" />
      {/* Dark overlay on hover */}
      <div className="absolute inset-0 bg-black/0 
                     group-hover:bg-black/5 
                     transition-colors duration-500" />
    </div>
  </div>
  
  {/* Text content */}
  <div className="text-center">
    <h3 className="font-serif text-lg text-stone-800 
                  group-hover:text-ruvera-gold transition-colors" />
    <p className="text-sm font-light text-stone-500 mt-1" />
  </div>
</div>
```

**Key patterns:**
- **Aspect ratio**: `aspect-[3/4]` (portrait orientation)
- **Hover scale**: Image container scales to `1.02`, image itself to `1.10`
- **Overlay**: Subtle dark overlay (`bg-black/5`) on hover
- **Text color shift**: Hover changes text to `ruvera-gold`
- **Transition durations**: 500ms for container, 700ms for image (layered motion)

#### Stat Card (Admin)

```jsx
<div className="bg-white p-6 rounded-2xl shadow-sm 
                border border-stone-100 
                hover:shadow-lg transition-shadow duration-300">
  {/* Icon with gradient background */}
  <div className="p-3 rounded-xl 
                 bg-gradient-to-br from-midnight to-stone-700">
    <Icon size={24} className="text-white" />
  </div>
  
  {/* Label: small, uppercase, tracked */}
  <h3 className="text-stone-500 text-sm font-medium 
                uppercase tracking-wider" />
  
  {/* Value: large serif */}
  <p className="text-3xl font-serif text-midnight mt-1" />
</div>
```

**Key patterns:**
- **Border**: `border border-stone-100` (subtle)
- **Shadow progression**: `shadow-sm` → `shadow-lg` on hover
- **Icon container**: Gradient background with `rounded-xl`
- **Spacing**: `p-6` padding, `mt-1` tight stacking

### Buttons

#### Primary Button (Customer CTA)

```jsx
<button className="w-full md:w-auto px-12 py-5 
                  bg-ruvera-gold text-white 
                  font-medium tracking-[0.2em] uppercase 
                  hover:bg-stone-900 
                  transition-colors duration-500 
                  shadow-lg hover:shadow-xl">
  Add to Cart
</button>
```

**Specifications:**
- **Padding**: `px-12 py-5` (horizontal: 3rem, vertical: 1.25rem)
- **Typography**: Medium weight, uppercase, `0.2em` letter-spacing
- **Color shift**: Gold → Midnight on hover
- **Shadow**: `shadow-lg` → `shadow-xl` on hover
- **Transition**: 500ms color transition

#### Size Selector (Circular Buttons)

```jsx
<button className={`w-12 h-12 flex items-center justify-center 
                    border rounded-full text-sm 
                    transition-all duration-300
                    ${selected 
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-300 text-stone-600 hover:border-stone-900'
                    }`}>
  M
</button>
```

**Specifications:**
- **Size**: Fixed `w-12 h-12` (3rem / 48px)
- **Shape**: `rounded-full` (perfect circle)
- **States**: 
  - Unselected: `border-stone-300`, hover shows `border-stone-900`
  - Selected: `bg-stone-900` with white text

### Overlays & Modals

#### Cart Drawer

```jsx
{/* Backdrop */}
<div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" />

{/* Drawer Panel */}
<div className="fixed top-0 right-0 h-full 
               w-full md:w-[450px] 
               bg-[#FDFBF7] shadow-2xl z-[70] 
               flex flex-col 
               border-l border-stone-200">
  
  {/* Header */}
  <div className="p-6 border-b border-stone-100">
    <h2 className="text-2xl font-serif text-stone-800 italic" />
  </div>
  
  {/* Scrollable content */}
  <div className="flex-1 overflow-y-auto p-6 space-y-6" />
  
  {/* Footer */}
  <div className="p-6 border-t border-stone-100 bg-white/50" />
</div>
```

**Key patterns:**
- **Backdrop**: `bg-black/20` with `backdrop-blur-sm`
- **Z-index layering**: Backdrop at `z-[60]`, drawer at `z-[70]`
- **Width**: Full width on mobile, fixed `450px` on desktop
- **Borders**: `border-l` for depth, `border-b` and `border-t` for sections
- **Footer**: Semi-transparent white background (`bg-white/50`)

### Navigation

#### Customer Header

```jsx
<nav className="fixed top-0 left-0 w-full p-8 md:px-12 
               flex justify-between items-start z-40 
               bg-gradient-to-b from-[#FDFBF7] to-transparent 
               pointer-events-none">
  
  {/* Logo (clickable) */}
  <div className="pointer-events-auto">
    <img className="w-32 md:w-40 h-auto mix-blend-multiply" />
  </div>
  
  {/* Nav items (clickable) */}
  <div className="pointer-events-auto flex items-center gap-8 
                 text-xs font-medium tracking-widest 
                 text-stone-900 uppercase">
    <Link className="hover:text-ruvera-gold transition-colors" />
  </div>
</nav>
```

**Key patterns:**
- **Position**: `fixed` at top with gradient fade
- **Pointer events**: Base is `pointer-events-none`, children restore with `pointer-events-auto`
- **Logo size**: `w-32` (mobile) → `w-40` (desktop)
- **Nav typography**: `text-xs`, `font-medium`, `tracking-widest`, `uppercase`
- **Spacing**: `gap-8` (2rem) between nav items

#### Admin Sidebar

```jsx
<aside className="w-72 bg-midnight text-white 
                 flex flex-col shadow-2xl z-20">
  
  {/* Brand header */}
  <div className="p-8 border-b border-white/10">
    <h1 className="font-serif text-2xl text-ruvera-gold" />
    <p className="text-xs text-stone-500 uppercase tracking-widest mt-1" />
  </div>
  
  {/* Navigation */}
  <nav className="flex-1 p-4 space-y-2 mt-4">
    <Link className={`flex items-center gap-3 px-4 py-3 
                     rounded-lg transition-all duration-300
                     ${active 
                       ? 'bg-ruvera-gold/10 text-ruvera-gold'
                       : 'text-stone-400 hover:text-stone-100 hover:bg-white/5'
                     }`}>
      <Icon className="group-hover:scale-110" />
      <span className="font-medium tracking-wide" />
    </Link>
  </nav>
</aside>
```

**Key patterns:**
- **Width**: Fixed `w-72` (18rem / 288px)
- **Background**: `midnight` (#1A1A1A)
- **Borders**: Semi-transparent white (`border-white/10`)
- **Active state**: Gold tint background (`bg-ruvera-gold/10`) with gold text
- **Hover**: Icon scales to `1.10`, background shows `bg-white/5`

---

## 🎭 Shadow & Depth System

### Shadow Scale

```css
shadow-sm   → Subtle lift for cards
shadow-lg   → Standard depth for buttons, product cards
shadow-xl   → Hover state for buttons
shadow-2xl  → Maximum depth for overlays, drawers, admin sidebar
shadow-inner → Internal depth for organic shapes
```

### Drop Shadows (for organic shapes)

```jsx
className="filter drop-shadow-xl"
```

Applied to organic shape containers to lift them from background

---

## ⚡ Animation & Transitions

### Transition Durations

| Element | Duration | Timing |
|---------|----------|--------|
| Color changes | `300ms` | Default |
| Component hover | `500ms` | Slower, refined |
| Image transforms | `700ms` | Smooth, luxurious |
| Page entrance | `800ms` to `1000ms` | Dramatic |

### Common Animation Patterns

#### Fade + Slide In

```jsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8 }}
```

#### Scale on View

```jsx
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.8 }}
```

#### Staggered Grid Items

```jsx
initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ delay: index * 0.1 }}
```

#### Hover Transforms

```jsx
// Container
className="transition-transform duration-500 group-hover:scale-[1.02]"

// Image inside
className="group-hover:scale-110 transition-transform duration-700"
```

**Pattern**: Nested scaling creates depth (outer scales 1.02×, inner 1.10×)

---

## 🔍 Scrollbar Customization

```css
/* Thin, premium scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d6d3d1; /* stone-300 */
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a29e; /* stone-400 */
}
```

---

## 📱 Responsive Breakpoints

Tailwind default breakpoints are used:

```css
sm:  640px   → @media (min-width: 640px)
md:  768px   → @media (min-width: 768px)
lg:  1024px  → @media (min-width: 1024px)
xl:  1280px  → @media (min-width: 1280px)
2xl: 1536px  → @media (min-width: 1536px)
```

### Common Responsive Patterns

```jsx
// Typography
className="text-4xl md:text-6xl"

// Spacing
className="px-6 md:px-12"

// Grid columns
className="grid-cols-1 md:grid-cols-3"

// Visibility
className="hidden md:block"

// Width
className="w-full md:w-auto"
```

---

## 🎯 Design Principles Summary

### 1. **Organic Over Geometric**
Use blob shapes for images and featured content; save sharp rectangles for UI controls

### 2. **Generous Negative Space**
Heavy vertical spacing (`gap-y-16`, `gap-y-20`) creates luxury and breathability

### 3. **Layered Motion**
Nested hover effects with different durations create depth (e.g., container: 500ms, image: 700ms)

### 4. **Typography Hierarchy**
- Serif = Emotion, brand, products
- Sans = Function, navigation, labels
- Uppercase + tracking = Premium labels

### 5. **Subtle Interactions**
Avoid jarring effects; prefer gentle color shifts, subtle scales, and soft shadows

### 6. **Warm Neutrals**
Stone palette + cream background + burnished gold = sophisticated, inviting warmth

### 7. **Shadow for Depth**
Use shadow progression to indicate interactivity and hierarchy

### 8. **Fixed Aspect Ratios**
Product images maintain `aspect-[3/4]` for consistency; thumbnails use `aspect-[3/5]`

---

## 📦 Component Checklist

When creating new components, ensure:

- [ ] **Colors** use palette variables (`ruvera-gold`, `midnight`, `stone-*`)
- [ ] **Fonts** use `font-serif` for emotion, `font-sans` for function
- [ ] **Border radius** uses standard values or organic shapes appropriately
- [ ] **Spacing** follows the established scale (multiples of 4px)
- [ ] **Shadows** progress logically (sm → lg → xl)
- [ ] **Transitions** use appropriate durations (300ms standard, 500ms refined, 700ms+ for images)
- [ ] **Hover states** include color, scale, or shadow changes
- [ ] **Typography** includes tracking for uppercase labels
- [ ] **Responsive** adapts gracefully using `md:` and `lg:` breakpoints
- [ ] **Accessibility** maintains contrast ratios and interactive states

---

## 🛠️ Tailwind Configuration Reference

```js
// From tailwind.config.js
{
  fontFamily: {
    sans: ['Outfit', 'sans-serif'],
    serif: ['Playfair Display', 'serif'],
  },
  colors: {
    stone: { /* 50-950 scale */ },
    'ruvera-gold': '#AF9164',
    'midnight': '#1A1A1A',
  },
  borderRadius: {
    'blob-1': '50% 50% 40% 60% / 60% 50% 60% 40%',
    'blob-2': '30% 70% 70% 30% / 30% 30% 70% 70%',
    'blob-3': '60% 40% 30% 70% / 60% 30% 70% 40%',
    'blob-4': '40% 60% 70% 30% / 40% 50% 60% 50%',
  }
}
```

---

This design system guide serves as the foundation for maintaining visual consistency and premium aesthetics across the entire Ruvéra Couture platform. All new components and pages should adhere to these established patterns to ensure a cohesive, luxurious user experience.
