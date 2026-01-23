export const initialCategories = [
    {
        id: "cat_001",
        name: "Coats & Jackets",
        slug: "coats-jackets",
        description: "Outerwear for the modern avant-garde.",
        productsCount: 12,
        status: "Active"
    },
    {
        id: "cat_002",
        name: "Dresses",
        slug: "dresses",
        description: "Evening wear and structured silhouettes.",
        productsCount: 8,
        status: "Active"
    },
    {
        id: "cat_003",
        name: "Trousers",
        slug: "trousers",
        description: "Tailored pants and architectural bottoms.",
        productsCount: 15,
        status: "Active"
    },
    {
        id: "cat_004",
        name: "Accessories",
        slug: "accessories",
        description: "Fine goods and leather accents.",
        productsCount: 6,
        status: "Inactive"
    }
];

export const getCategories = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve([...initialCategories]), 400);
    });
};

export const getCategoryById = (id) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(initialCategories.find(c => c.id === id));
        }, 300);
    });
};
