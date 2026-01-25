import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface SettingsState {
    currency_code: string;
    currency_symbol: string;
    company_name: string;
    address_line: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    shipping_fee: string;
    free_shipping_threshold: string;
    tax_rate: string;
    facebook_url: string;
    instagram_url: string;
    twitter_url: string;
}

interface SettingsContextValue {
    settings: SettingsState;
    loading: boolean;
    refreshSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [settings, setSettings] = useState<SettingsState>({
        currency_code: 'INR',
        currency_symbol: '₹',
        company_name: '',
        address_line: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        email: '',
        shipping_fee: '',
        free_shipping_threshold: '',
        tax_rate: '',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await api.get('/settings');
            setSettings(prev => ({ ...prev, ...response.data }));
        } catch (error) {
            console.error('Error loading settings:', error);
            // Keep defaults on error
        } finally {
            setLoading(false);
        }
    };

    const refreshSettings = () => {
        loadSettings();
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
}
