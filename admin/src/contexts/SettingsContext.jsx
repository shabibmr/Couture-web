import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import logRocketService from '../utils/logrocketService';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({
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
            logRocketService.logStateChange({
                context: 'SettingsContext',
                action: 'load_settings_attempt',
            });

            const response = await api.get('/settings');
            setSettings(prev => ({ ...prev, ...response.data }));

            logRocketService.logStateChange({
                context: 'SettingsContext',
                action: 'load_settings_success',
                newValue: response.data,
            });
        } catch (error) {
            console.error('Error loading settings:', error);
            logRocketService.logError('Failed to load settings', error);
            // Keep defaults on error
        } finally {
            setLoading(false);
        }
    };

    const refreshSettings = () => {
        logRocketService.logStateChange({
            context: 'SettingsContext',
            action: 'refresh_settings',
        });
        loadSettings();
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
}
