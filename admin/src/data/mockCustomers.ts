import type { Customer } from '../types';

export const initialCustomers: Customer[] = [
    {
        id: "cust_001",
        name: "Isabella Venthoma",
        email: "isabella.v@example.com",
        phone: "+1 (555) 0123-4567",
        location: "New York, NY",
        joinedDate: "2024-01-15",
        totalSpent: 4340,
        ordersCount: 3,
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        recentOrders: [
            { id: "ord_7829", date: "2024-03-10", total: 1890, status: "Delivered", items: 2 },
            { id: "ord_6521", date: "2024-02-14", total: 2450, status: "Delivered", items: 1 }
        ]
    },
    {
        id: "cust_002",
        name: "Marcus Thorne",
        email: "m.thorne@design.studio",
        phone: "+44 20 7123 4567",
        location: "London, UK",
        joinedDate: "2024-02-01",
        totalSpent: 980,
        ordersCount: 1,
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        recentOrders: [
            { id: "ord_8102", date: "2024-03-05", total: 980, status: "Processing", items: 1 }
        ]
    },
    {
        id: "cust_003",
        name: "Elena Kovic",
        email: "elena.k@gallery.art",
        phone: "+33 1 23 45 67 89",
        location: "Paris, FR",
        joinedDate: "2023-11-20",
        totalSpent: 12500,
        ordersCount: 8,
        status: 'VIP',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        recentOrders: [
            { id: "ord_9001", date: "2024-03-12", total: 3200, status: "Shipped", items: 3 },
            { id: "ord_8854", date: "2024-01-20", total: 4100, status: "Delivered", items: 2 }
        ]
    },
    {
        id: "cust_004",
        name: "Sarah Jenkins",
        email: "sarah.j@tech.io",
        phone: "+1 (415) 555-0199",
        location: "San Francisco, CA",
        joinedDate: "2024-03-01",
        totalSpent: 0,
        ordersCount: 0,
        status: 'Active',
        avatar: null, // No avatar
        recentOrders: []
    }
];

// Simulation of async operations
export const getCustomers = (): Promise<Customer[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve([...initialCustomers]), 600);
    });
};

export const getCustomerById = (id: string): Promise<Customer | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(initialCustomers.find(c => c.id === id));
        }, 400);
    });
};
