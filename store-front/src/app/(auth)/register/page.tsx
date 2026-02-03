import { Metadata } from 'next';
import RegisterClient from './RegisterClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Register | Ruvéra Couture',
    description: 'Join the Ruvéra Couture family to manage your orders and profile.',
};

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-beige-bg animate-pulse" />}>
            <RegisterClient />
        </Suspense>
    );
}
