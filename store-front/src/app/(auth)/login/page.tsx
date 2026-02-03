import { Metadata } from 'next';
import LoginClient from './LoginClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Login | Ruvéra Couture',
    description: 'Sign in to your Ruvéra Couture account to manage your orders and profile.',
};

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-beige-bg animate-pulse" />}>
            <LoginClient />
        </Suspense>
    );
}
