import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ToastContainer, { useToast } from '../../components/Toast';
import { useSettings } from '../../contexts/SettingsContext';

const Settings = () => {
    const [settings, setSettings] = useState({
        // General
        currency_code: 'INR',
        currency_symbol: '₹',

        // Company Information
        company_name: '',
        address_line: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        email: '',

        // Shipping & Tax
        shipping_fee: '',
        free_shipping_threshold: '',
        tax_rate: '',

        // Social
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toasts, removeToast, showSuccess, showError } = useToast();
    const { refreshSettings } = useSettings();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            setSettings(prev => ({ ...prev, ...response.data }));
        } catch (error) {
            console.error('Error fetching settings:', error);
            const errorMessage = error.response?.data?.message || 'Failed to load settings. Please try again.';
            showError(errorMessage, 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put('/settings', settings);
            showSuccess('Settings saved successfully!', 3000);
            refreshSettings();
        } catch (error) {
            console.error('Error saving settings:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save settings. Please try again.';
            showError(errorMessage, 5000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Store Settings</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* General Settings */}
                    <section className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">General</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Currency Code</label>
                                <input
                                    type="text"
                                    name="currency_code"
                                    value={settings.currency_code}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="INR"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Currency Symbol</label>
                                <input
                                    type="text"
                                    name="currency_symbol"
                                    value={settings.currency_symbol}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="₹"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Company Information */}
                    <section className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Company Information</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Company Name</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={settings.company_name}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Ruvéra Couture"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <input
                                    type="text"
                                    name="address_line"
                                    value={settings.address_line}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="123 Fashion Street"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={settings.city}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded"
                                        placeholder="Mumbai"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={settings.state}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded"
                                        placeholder="Maharashtra"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">ZIP Code</label>
                                    <input
                                        type="text"
                                        name="zip"
                                        value={settings.zip}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded"
                                        placeholder="400001"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={settings.phone}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded"
                                        placeholder="+91 1234567890"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={settings.email}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded"
                                        placeholder="contact@ruvera.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Shipping & Tax */}
                    <section className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Shipping & Tax</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Shipping Fee ({settings.currency_symbol})</label>
                                <input
                                    type="number"
                                    name="shipping_fee"
                                    value={settings.shipping_fee}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Free Shipping Threshold ({settings.currency_symbol})</label>
                                <input
                                    type="number"
                                    name="free_shipping_threshold"
                                    value={settings.free_shipping_threshold}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="2000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="tax_rate"
                                    value={settings.tax_rate}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="18"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Social Links */}
                    <section className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Social Media</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Facebook URL</label>
                                <input
                                    type="url"
                                    name="facebook_url"
                                    value={settings.facebook_url}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="https://facebook.com/ruvera"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Instagram URL</label>
                                <input
                                    type="url"
                                    name="instagram_url"
                                    value={settings.instagram_url}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="https://instagram.com/ruvera"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Twitter URL</label>
                                <input
                                    type="url"
                                    name="twitter_url"
                                    value={settings.twitter_url}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="https://twitter.com/ruvera"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Settings;
