import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-beige-bg text-stone-800 p-6 text-center">
                    <h1 className="text-3xl font-serif mb-4 text-ruvera-gold">Something went wrong</h1>
                    <p className="mb-6 font-sans text-stone-600 max-w-md">
                        We apologize for the inconvenience. Please try refreshing the page.
                    </p>
                    <div className="bg-white p-4 rounded shadow-sm overflow-auto max-w-lg w-full text-left border border-stone-200">
                        <p className="font-mono text-xs text-red-500 break-words">
                            {this.state.error?.message}
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-2 bg-ruvera-gold text-white rounded hover:bg-opacity-90 transition-colors"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
