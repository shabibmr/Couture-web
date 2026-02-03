'use client';

import { Search } from 'lucide-react';

interface Category {
    name: string;
    slug: string;
}

interface ShopFiltersProps {
    categories: Category[];
    selectedCategory: string | null;
    isNewArrival: boolean;
    searchQuery: string;
    onCategoryClick: (slug: string | null) => void;
    onNewArrivalClick: () => void;
    onSearchChange: (query: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
}

const ShopFilters: React.FC<ShopFiltersProps> = ({
    categories,
    selectedCategory,
    isNewArrival,
    searchQuery,
    onCategoryClick,
    onNewArrivalClick,
    onSearchChange,
    onSearchSubmit,
}) => {
    return (
        <div className="flex flex-col gap-8 mb-16 border-b border-stone-200 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-6">
                    <button
                        onClick={() => onCategoryClick(null)}
                        className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${!selectedCategory && !isNewArrival ? 'text-ruvera-gold' : 'text-stone-400 hover:text-stone-900'}`}
                    >
                        All Pieces
                    </button>
                    <button
                        onClick={onNewArrivalClick}
                        className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${isNewArrival ? 'text-ruvera-gold' : 'text-stone-400 hover:text-stone-900'}`}
                    >
                        New Arrivals
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.slug}
                            onClick={() => onCategoryClick(category.slug)}
                            className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${selectedCategory === category.slug ? 'text-ruvera-gold' : 'text-stone-400 hover:text-stone-900'}`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-end items-center gap-8 w-full">
                <form onSubmit={onSearchSubmit} className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Find a masterpiece..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-white/50 border border-stone-200 py-3 pl-10 pr-4 rounded-full text-xs focus:outline-none focus:border-ruvera-gold transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                </form>
            </div>
        </div>
    );
};

export default ShopFilters;
