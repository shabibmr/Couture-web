// Category types
export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    productsCount: number;
    status: 'Active' | 'Inactive';
}

// Product types
export interface Product {
    id: string;
    title: string;
    price: number;
    currency: string;
    code: string;
    description: string;
    sizes: string[];
    status: 'Active' | 'Out of Stock' | 'Inactive';
    image: string;
}

// Customer types
export interface Order {
    id: string;
    date: string;
    total: number;
    status: 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled';
    items: number;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    joinedDate: string;
    totalSpent: number;
    ordersCount: number;
    status: 'Active' | 'VIP' | 'Inactive';
    avatar: string | null;
    recentOrders: Order[];
}

// Settings types
export interface Settings {
    currencyCode: string;
    currencySymbol: string;
    locale: string;
}
