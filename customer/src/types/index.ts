export interface Product {
    id: string | number;
    title: string;
    name?: string; // Backend uses name
    slug?: string; // Backend uses slug
    code?: string;
    price: string | number;
    base_price?: number; // Backend uses base_price
    sale_price?: number; // Backend uses sale_price
    description: string;
    image: string;
    featured_image?: string; // Backend uses featured_image
    sizes: string[];
}

export interface CartItem extends Product {
    quantity?: number;
    selectedSize?: string;
}

export interface OrderItem {
    title: string;
    price: string | number;
    image: string;
    quantity: number;
}

export interface Order {
    id: string | number;
    date: string;
    total: number;
    status: string;
    items: OrderItem[];
}

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    db_id?: string;
    backendToken?: string;
}

export interface Banner {
    image_url: string;
    title: string;
    description: string;
    link_url: string;
}

export interface ShopContextType {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (index: number) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    isSearchOpen: boolean;
    setIsSearchOpen: (open: boolean) => void;
    wishlist: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string | number) => void;
    isInWishlist: (productId: string | number) => boolean;
    toggleWishlist: (product: Product) => void;
    orders: Order[];
    addOrder: (order: Order) => void;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}
