---
name: State Management & Hydration Safety
description: Patterns for managing shared state (Providers, Context) and preventing hydration mismatch errors.
---

# State Management & Hydration Safety Skill

This skill addresses the complexities of React Context and browser-only APIs in a server-side rendering framework.

## 1. Context Providers in Layouts

- **Pattern**: Create a designated "Client Component Wrapper" for providers.
- **Example**: `src/providers/AppProviders.tsx`
  ```tsx
  'use client';
  
  import { AuthProvider } from '@/context/AuthContext';
  import { ShopProvider } from '@/context/ShopContext';
  
  export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
      <AuthProvider>
        <ShopProvider>
          {children}
        </ShopProvider>
      </AuthProvider>
    );
  }
  ```
- **Usage**: Import and wrap `children` in `src/app/layout.tsx`.

## 2. Preventing Hydration Errors

- **Problem**: Accessing `localStorage` or `window` during the initial render causes HTML mismatch.
- **Solution A: useEffect Initialization**
  - Initialize state with a default value (e.g., empty array or null).
  - hydration only happens after mount.
  ```tsx
  const [cart, setCart] = useState([]);
  
  useEffect(() => {
    // Access localStorage here
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);
  ```

- **Solution B: Mounted Hook**
  - Render specific client-only UI sections only after mount.
  ```tsx
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  
  if (!isMounted) return null; // or a skeleton
  ```

## 3. Global State Handling

- Move large global state logic (reducers, complex effects) into the custom hooks accessed via Context.
- Avoid passing massive objects; expose specific selectors or actions.
