import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastData {
    id: number;
    message: string;
    type: ToastType;
    duration: number;
}

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

interface ToastContainerProps {
    toasts: ToastData[];
    removeToast: (id: number) => void;
}

let toastId = 0;

const Toast = ({ message, type = 'info', duration = 3000, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getTypeStyles = (): string => {
        switch (type) {
            case 'success':
                return 'bg-green-500 text-white';
            case 'error':
                return 'bg-red-500 text-white';
            case 'warning':
                return 'bg-yellow-500 text-white';
            case 'info':
            default:
                return 'bg-blue-500 text-white';
        }
    };

    return (
        <div
            className={`${getTypeStyles()} px-6 py-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] max-w-md animate-slide-in`}
        >
            <span className="mr-4">{message}</span>
            <button
                onClick={onClose}
                className="text-white hover:text-gray-200 font-bold text-xl leading-none"
            >
                ×
            </button>
        </div>
    );
};

const ToastContainer = ({ toasts, removeToast }: ToastContainerProps) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

// Hook to use toast notifications
export const useToast = () => {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const addToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
        const id = toastId++;
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const showSuccess = (message: string, duration?: number) => addToast(message, 'success', duration);
    const showError = (message: string, duration?: number) => addToast(message, 'error', duration);
    const showWarning = (message: string, duration?: number) => addToast(message, 'warning', duration);
    const showInfo = (message: string, duration?: number) => addToast(message, 'info', duration);

    return {
        toasts,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };
};

export default ToastContainer;
