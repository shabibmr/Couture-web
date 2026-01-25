// Type definitions for database models and API interfaces
import { Request } from 'express';

// Database Model Interfaces - based on actual schema

export interface Admin {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    role: 'super_admin' | 'admin' | 'staff';
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Customer {
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
    created_at: Date;
    updated_at: Date;
}

export interface Product {
    id: string;
    category_id: string;
    brand_id?: string;
    name: string;
    slug: string;
    description?: string;
    base_price: number;
    sale_price?: number;
    featured_image?: string;
    is_active: boolean;
    is_featured: boolean;
    is_new_arrival: boolean;
    view_count: number;
    created_at: Date;
    updated_at: Date;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    sku: string;
    size_id?: string;
    color_id?: string;
    variant_price?: number;
    variant_image?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Category {
    id: string;
    parent_id?: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    sort_order: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Order {
    id: string;
    order_number: string;
    customer_id: string;
    status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    subtotal: number;
    tax_amount: number;
    shipping_amount: number;
    discount_amount: number;
    total_amount: number;
    coupon_id?: string;
    shipping_method_id?: string;
    shipping_address: string;
    billing_address: string;
    customer_notes?: string;
    order_date: Date;
    created_at: Date;
    updated_at: Date;
}

export interface OrderItem {
    id: string;
    order_id: string;
    variant_id: string;
    product_name: string;
    variant_sku: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: Date;
}

export interface Cart {
    id: string;
    customer_id: string;
    expires_at?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface CartItem {
    id: string;
    cart_id: string;
    variant_id: string;
    quantity: number;
    added_at: Date;
}

export interface PaymentTransaction {
    id: string;
    order_id: string;
    transaction_id: string;
    payment_gateway_id: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    gateway_response?: string;
    payment_date?: Date;
    created_at: Date;
}

export interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed' | 'bogo';
    discount_value: number;
    min_order_value: number;
    usage_limit?: number;
    used_count: number;
    valid_from?: Date;
    valid_until?: Date;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Banner {
    id: string;
    title: string;
    description?: string;
    image_url: string;
    link_url?: string;
    sort_order: number;
    is_active: boolean;
    start_date?: Date;
    end_date?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface Wishlist {
    id: string;
    customer_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface WishlistItem {
    id: string;
    wishlist_id: string;
    product_id: string;
    added_at: Date;
}

// JWT Token Payload
export interface JWTPayload {
    id: string;
    email: string;
    role?: 'admin' | 'customer';
    iat?: number;
    exp?: number;
}

// Express Request with authenticated user
export interface AuthenticatedRequest extends Request {
    user?: JWTPayload;
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
