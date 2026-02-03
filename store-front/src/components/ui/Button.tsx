import React from 'react';
// import { cn } from '@/utils/cn'; // Assuming utils/cn exists or we use inline classes

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-none font-medium uppercase tracking-widest transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2";

        const variants = {
            primary: "bg-ruvera-gold text-white hover:bg-stone-800 focus:ring-ruvera-gold",
            secondary: "bg-stone-800 text-white hover:bg-stone-700 focus:ring-stone-800",
            outline: "border border-stone-300 bg-transparent hover:bg-stone-100 text-stone-800 focus:ring-stone-300",
            ghost: "bg-transparent text-stone-800 hover:text-ruvera-gold hover:bg-stone-50"
        };

        const sizes = {
            sm: "h-8 px-4 text-[10px]",
            md: "h-11 px-6 text-xs",
            lg: "h-14 px-8 text-sm"
        };

        const variantStyles = variants[variant];
        const sizeStyles = sizes[size];

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <span className="mr-2">Loading...</span>
                ) : null}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export default Button;
