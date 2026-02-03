import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    safelist: [
        'text-ruvera-gold',
        'bg-ruvera-gold',
        'border-ruvera-gold',
        'hover:text-ruvera-gold',
        'hover:bg-ruvera-gold',
        'bg-beige-bg',
        'text-midnight',
        'bg-midnight',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
                serif: ['"Playfair Display"', 'serif'],
            },
            colors: {
                stone: {
                    50: '#fafaf9',
                    100: '#f5f5f4',
                    200: '#e7e5e4',
                    300: '#d6d3d1',
                    400: '#a8a29e',
                    500: '#78716c',
                    600: '#57534e',
                    700: '#44403c',
                    800: '#292524',
                    900: '#1c1917',
                    950: '#0c0a09',
                },
                'ruvera-gold': '#AF9164', // Burnished Gold
                'midnight': '#1A1A1A', // Deep Editorial Black
                'beige-bg': '#FDFBF7', // Rich Cream Background (Updated)
            },
            borderRadius: {
                'blob-1': '50% 50% 40% 60% / 60% 50% 60% 40%',
                'blob-2': '30% 70% 70% 30% / 30% 30% 70% 70%',
                'blob-3': '60% 40% 30% 70% / 60% 30% 70% 40%',
                'blob-4': '40% 60% 70% 30% / 40% 50% 60% 50%',
            }
        },
    },
    plugins: [],
};
export default config;
