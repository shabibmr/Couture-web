'use client';

import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { ShopProvider } from '../context/ShopContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ShopProvider>
                {children}
            </ShopProvider>
        </AuthProvider>
    );
}
