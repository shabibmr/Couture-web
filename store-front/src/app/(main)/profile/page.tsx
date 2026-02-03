import { Metadata } from 'next';
import ProfileClient from './ProfileClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'My Profile | Ruvéra Couture',
    description: 'View and manage your profile, addresses, and account settings.',
};

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-beige-bg animate-pulse" />}>
            <ProfileClient />
        </Suspense>
    );
}
