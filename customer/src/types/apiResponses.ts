/**
 * TypeScript interfaces for Backend API Responses
 * Improves type safety by defining expected response structures
 */

// Settings API Response
export interface SettingsResponse {
    site_currency_code?: string;
    site_currency_symbol?: string;
    [key: string]: any; // Allow other settings fields
}

// Cart Item from Backend
export interface BackendCartItem {
    id: number;
    product_id: number;
    variant_id?: number;
    quantity: number;
    size?: string;
    ProductVariant?: {
        Product?: {
            id: number;
            name: string;
            image?: string;
            featured_image?: string;
            sale_price?: number;
            base_price?: number;
            price?: number | string;
            [key: string]: any;
        };
        Size?: {
            name: string;
        };
        [key: string]: any;
    };
    [key: string]: any;
}

// Cart API Response
export interface CartResponse {
    items: BackendCartItem[];
    total?: number;
    [key: string]: any;
}

// Wishlist Item from Backend
export interface BackendWishlistItem {
    id: number;
    product_id: number;
    Product?: {
        id: number;
        name: string;
        image?: string;
        featured_image?: string;
        price?: number | string;
        sale_price?: number;
        base_price?: number;
        [key: string]: any;
    };
    [key: string]: any;
}

// Wishlist API Response
export interface WishlistResponse {
    items: BackendWishlistItem[];
    [key: string]: any;
}

// Order Item from Backend
export interface BackendOrderItem {
    id: number;
    product_name: string;
    variant_sku?: string;
    unit_price: number;
    quantity: number;
    image?: string;
    [key: string]: any;
}

// Order from Backend
export interface BackendOrder {
    id: number;
    order_number?: string;
    order_date: string;
    total_amount: number;
    status: string;
    items?: BackendOrderItem[];
    [key: string]: any;
}

// Orders List API Response
export interface OrdersResponse {
    data: BackendOrder[];
    total?: number;
    page?: number;
    [key: string]: any;
}

// Add to Cart Request
export interface AddToCartRequest {
    product_id: number | string;
    quantity: number;
    size?: string;
    variant_id?: number;
}

// Add to Cart Response
export interface AddToCartResponse {
    item?: {
        id: number;
        [key: string]: any;
    };
    message?: string;
    [key: string]: any;
}

// Update Cart Item Request
export interface UpdateCartItemRequest {
    quantity: number;
    size?: string;
}

// Add to Wishlist Request
export interface AddToWishlistRequest {
    product_id: number | string;
}
