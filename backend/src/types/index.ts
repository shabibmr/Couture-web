import { Request } from 'express';

// ============================================================================
// Database Model Attributes
// ============================================================================

export interface CustomerAttributes {
    id: string;
    email: string;
    password_hash?: string;
    first_name: string;
    last_name: string;
    phone?: string;
    avatar_url?: string;
    email_verified: boolean;
    oauth_provider?: string;
    oauth_provider_id?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ProductAttributes {
    id: string;
    name: string;
    slug: string;
    code: string;
    description?: string;
    base_price: number;
    sale_price?: number;
    featured_image?: string;
    is_featured: boolean;
    category_id?: string;
    brand_id?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ProductVariantAttributes {
    id: string;
    product_id: string;
    sku: string;
    size_id?: string;
    color_id?: string;
    variant_price?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface OrderAttributes {
    id: string;
    order_number: string;
    customer_id: string;
    status: OrderStatus;
    subtotal: number;
    shipping_cost: number;
    tax: number;
    discount: number;
    total: number;
    payment_status: PaymentStatus;
    payment_method?: string;
    shipping_address_id?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface CartAttributes {
    id: string;
    customer_id: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface CartItemAttributes {
    id: string;
    cart_id: string;
    product_id: string;
    variant_id?: string;
    quantity: number;
    price: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface CategoryAttributes {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parent_id?: string;
    image_url?: string;
    is_active: boolean;
    display_order?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface BrandAttributes {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo_url?: string;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface InventoryAttributes {
    id: string;
    variant_id: string;
    quantity: number;
    reserved_quantity: number;
    warehouse_location?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface CouponAttributes {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_purchase_amount?: number;
    max_discount_amount?: number;
    usage_limit?: number;
    used_count: number;
    valid_from?: Date;
    valid_until?: Date;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface WishlistAttributes {
    id: string;
    customer_id: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface WishlistItemAttributes {
    id: string;
    wishlist_id: string;
    product_id: string;
    created_at?: Date;
    updated_at?: Date;
}

// ============================================================================
// Enums and Constants
// ============================================================================

export type OrderStatus =
    | 'pending'
    | 'processing'
    | 'confirmed'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export type PaymentStatus =
    | 'pending'
    | 'paid'
    | 'failed'
    | 'refunded'
    | 'partially_refunded';

export type PaymentMethod =
    | 'razorpay'
    | 'card'
    | 'upi'
    | 'netbanking'
    | 'wallet'
    | 'cod';

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface AuthRequest<
    P = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
    customerId?: string;
    user?: CustomerAttributes;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface SearchParams extends PaginationParams {
    search?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total: number;
    pages: number;
    currentPage: number;
}

// ============================================================================
// Request Body Types
// ============================================================================

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
}

export interface FirebaseSyncRequest {
    idToken: string;
}

export interface CreateProductRequest {
    name: string;
    code: string;
    description?: string;
    base_price: number;
    sale_price?: number;
    category_id?: string;
    brand_id?: string;
    featured_image?: string;
    is_featured?: boolean;
}

export interface CreateOrderRequest {
    shipping_address_id: string;
    payment_method: PaymentMethod;
    coupon_code?: string;
}

export interface AddToCartRequest {
    product_id: string;
    variant_id?: string;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export interface ApplyCouponRequest {
    code: string;
    order_total: number;
}

// ============================================================================
// Response Types
// ============================================================================

export interface AuthResponse {
    token: string;
    user: Omit<CustomerAttributes, 'password_hash'>;
}

export interface ProductResponse extends ProductAttributes {
    Category?: CategoryAttributes;
    Brand?: BrandAttributes;
    variants?: ProductVariantAttributes[];
    images?: { url: string }[];
}

export interface OrderResponse extends OrderAttributes {
    items?: OrderItemResponse[];
    Customer?: Omit<CustomerAttributes, 'password_hash'>;
}

export interface OrderItemResponse {
    id: string;
    product_id: string;
    variant_id?: string;
    quantity: number;
    price: number;
    Product?: ProductAttributes;
}

export interface CartResponse extends CartAttributes {
    items?: CartItemResponse[];
}

export interface CartItemResponse extends CartItemAttributes {
    Product?: ProductAttributes;
    ProductVariant?: ProductVariantAttributes;
}

// ============================================================================
// Utility Types
// ============================================================================

export type CreateAttributes<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type UpdateAttributes<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;

// ============================================================================
// JWT Payload
// ============================================================================

export interface JWTPayload {
    customerId: string;
    email: string;
    iat?: number;
    exp?: number;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ValidationError {
    field: string;
    message: string;
}

export interface ErrorResponse {
    success: false;
    error: string;
    details?: ValidationError[];
}
