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
    featured_image?: string; // Backend uses featured_image - DEPRECATED: use image
    variants?: ProductVariant[]; // Include variants with inventory info
}

export interface ProductVariant {
    id: string;
    sku: string;
    size_id?: string;
    color_id?: string;
    variant_price?: number;
    Size?: { name: string; code: string };
    Color?: { name: string; hex_code: string };
    Inventory?: {
        quantity: number;
        reserved_quantity: number;
    };
}

export interface CartItem extends Product {
    quantity?: number;
    selectedSize?: string;
    variant_id?: string;
    cartItemId?: string;
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

export interface Currency {
    code: string;
    symbol: string;
}

export interface ShopContextType {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    updateCartItemQuantity: (index: number, newQuantity: number) => void;
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
    currency: Currency;
    formatPrice: (amount: number) => string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithPhone: (phoneNumber: string, appVerifier: any) => Promise<void>;
    verifyOtp: (otp: string) => Promise<void>;
    logout: () => Promise<void>;
}

