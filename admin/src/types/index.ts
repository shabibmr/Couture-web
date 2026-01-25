// Core domain types for the admin application

export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    category_id?: number;
    image_url?: string;
    stock_quantity?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
    parent_id?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Order {
    id: number;
    customer_id: number;
    total_amount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    created_at?: string;
    updated_at?: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
}

export interface Banner {
    id: number;
    title: string;
    image_url: string;
    link_url?: string;
    active: boolean;
    display_order?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Coupon {
    id: number;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    valid_from?: string;
    valid_to?: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Payment {
    id: number;
    order_id: number;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    payment_method?: string;
    transaction_id?: string;
    created_at?: string;
    updated_at?: string;
}

// API Response types
export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
    success?: boolean;
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
