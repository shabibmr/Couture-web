import type { Product } from '../types';

export const initialProducts: Product[] = [
    {
        id: "prod_001",
        title: "Structured Wool Blazer",
        price: 1890,
        currency: "USD",
        code: "56-24-001",
        description: "A masterclass in tailoring. This structured blazer features a sharp silhouette, defined shoulders, and a premium wool construction. Designed for the modern avant-garde wardrobe.",
        sizes: ['S', 'M', 'L'],
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: "prod_002",
        title: "Silk Draped Gown",
        price: 2450,
        currency: "USD",
        code: "56-24-005",
        description: "Fluid silk satin tailored into a gravity-defying form. The asymmetrical drape creates a unique silhouette that moves with the wearer.",
        sizes: ['XS', 'S', 'M', 'L'],
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: "prod_003",
        title: "Leather Avant Pant",
        price: 980,
        currency: "USD",
        code: "56-24-012",
        description: "High-waisted leather trousers with a relaxed, tapered fit. Features architectural seaming and concealed hardware.",
        sizes: ['28', '30', '32', '34'],
        status: 'Out of Stock',
        image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=1000&auto=format&fit=crop'
    }
];

// Simulation of async operations
export const getProducts = (): Promise<Product[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve([...initialProducts]), 500);
    });
};

export const getProductById = (id: string): Promise<Product | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(initialProducts.find(p => p.id === id));
        }, 300);
    });
};
