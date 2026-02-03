import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wide">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
                        w-full bg-stone-100 border border-stone-300 text-stone-800 px-4 py-3 rounded-none 
                        focus:outline-none focus:border-ruvera-gold transition-colors text-xs placeholder:text-stone-400
                        disabled:bg-stone-50 disabled:text-stone-500
                        ${error ? 'border-red-500 focus:border-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-[10px] text-red-500">{error}</p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export default Input;
