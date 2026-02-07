import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Plus, Edit2, Trash2, Check, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import logger from '../utils/logger';
import {
    sendEmailVerification,
    updateProfile,
    updateEmail,
    RecaptchaVerifier,
    PhoneAuthProvider,
    linkWithCredential
} from 'firebase/auth';
import userService, { CreateAddressData } from '../services/userService';

interface Address {
    id: string;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}

const UserProfilePage: React.FC = () => {
    // ... (keep all state and useEffects)
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');

    // Profile editing state
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');

    // Phone verification state
    const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

    // Address management state
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState<Partial<Address>>({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    // Initialize reCAPTCHA on mount
    useEffect(() => {
        logger.info('Page Mounted: UserProfilePage');
        if (!recaptchaVerifier) {
            const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {
                    logger.info('reCAPTCHA solved');
                }
            });
            setRecaptchaVerifier(verifier);
        }

        return () => {
            recaptchaVerifier?.clear();
        };
    }, []);

    // Fetch backend data
    useEffect(() => {
        const fetchBackendData = async () => {
            if (!user) return;
            try {
                // 1. Profile
                const profile = await userService.getProfile();
                if (profile) {
                    if (profile.phone) setPhone(profile.phone);
                }

                // 2. Addresses
                const backendAddresses = await userService.getAddresses();
                const mappedAddresses: Address[] = backendAddresses.map(addr => ({
                    id: addr.id,
                    name: addr.full_name,
                    phone: addr.phone,
                    addressLine1: addr.address_line1,
                    addressLine2: addr.address_line2,
                    city: addr.city,
                    state: addr.state,
                    pincode: addr.postal_code,
                    isDefault: addr.is_default_shipping
                }));
                setAddresses(mappedAddresses);
            } catch (error) {
                logger.error('Error fetching backend data', { error });
            }
        };

        fetchBackendData();
    }, [user]);

    const handleSendEmailVerification = async () => {
        if (auth.currentUser) {
            try {
                await sendEmailVerification(auth.currentUser);
                alert('Verification email sent! Please check your inbox.');
            } catch (error: any) {
                logger.error('Email verification error', { error });
                alert(`Error: ${error.message}`);
            }
        }
    };

    const handleUpdateProfile = async () => {
        if (!auth.currentUser) return;

        try {
            // Update display name
            if (displayName !== user?.displayName) {
                await updateProfile(auth.currentUser, { displayName });
            }

            // Update email if changed (requires verification)
            if (email !== user?.email && email) {
                await updateEmail(auth.currentUser, email);
                await handleSendEmailVerification();
            }

            // Update backend profile
            const nameParts = displayName.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            await userService.updateProfile({
                first_name: firstName,
                last_name: lastName,
                phone: phone
            });

            alert('Profile updated successfully!');
            setIsEditingProfile(false);
        } catch (error: any) {
            logger.error('Profile update error', { error });
            alert(`Error: ${error.message}`);
        }
    };

    const handleSendPhoneVerification = async () => {
        if (!phone || !recaptchaVerifier) {
            alert('Please enter a phone number');
            return;
        }

        try {
            setIsVerifyingPhone(true);
            const phoneProvider = new PhoneAuthProvider(auth);
            const verificationId = await phoneProvider.verifyPhoneNumber(
                phone,
                recaptchaVerifier
            );
            setVerificationId(verificationId);
            alert('Verification code sent to your phone!');
        } catch (error: any) {
            logger.error('Phone verification error', { error });
            alert(`Error: ${error.message}`);
            setIsVerifyingPhone(false);
        }
    };

    const handleVerifyPhoneCode = async () => {
        if (!verificationId || !verificationCode || !auth.currentUser) {
            alert('Invalid verification code');
            return;
        }

        try {
            const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
            await linkWithCredential(auth.currentUser, credential);
            alert('Phone number verified and linked successfully!');
            setIsVerifyingPhone(false);
            setVerificationCode('');
            setVerificationId(null);
        } catch (error: any) {
            logger.error('Phone verification code error', { error });
            alert(`Error: ${error.message}`);
        }
    };

    // Address management functions
    const handleAddAddress = async () => {
        if (!newAddress.name || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
            alert('Please fill all required fields');
            return;
        }

        try {
            const payload: CreateAddressData = {
                full_name: newAddress.name,
                phone: newAddress.phone,
                address_line1: newAddress.addressLine1,
                address_line2: newAddress.addressLine2,
                city: newAddress.city,
                state: newAddress.state,
                postal_code: newAddress.pincode,
                is_default_shipping: newAddress.isDefault,
                is_default_billing: newAddress.isDefault
            };

            const savedAddress = await userService.addAddress(payload);

            const address: Address = {
                id: savedAddress.id,
                name: savedAddress.full_name,
                phone: savedAddress.phone,
                addressLine1: savedAddress.address_line1,
                addressLine2: savedAddress.address_line2,
                city: savedAddress.city,
                state: savedAddress.state,
                pincode: savedAddress.postal_code,
                isDefault: savedAddress.is_default_shipping
            };

            setAddresses([address, ...addresses]);
            setIsAddingAddress(false);
            setNewAddress({
                name: '',
                phone: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                pincode: '',
                isDefault: false
            });
        } catch (error: any) {
            logger.error('Error adding address', { error });
            alert(`Failed to save address: ${error.message}`);
        }
    };


    const handleDeleteAddress = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            await userService.deleteAddress(id);
            setAddresses(addresses.filter(addr => addr.id !== id));
        } catch (error: any) {
            alert(`Failed to delete address: ${error.message}`);
        }
    };

    const handleSetDefaultAddress = async (id: string) => {
        try {
            await userService.updateAddress(id, {
                is_default_shipping: true,
                is_default_billing: true
            });
            setAddresses(addresses.map(addr => ({
                ...addr,
                isDefault: addr.id === id
            })));
        } catch (error: any) {
            alert(`Failed to update default address: ${error.message}`);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            logger.error('Logout error', { error });
        }
    };

    return (
        <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6">
            <SEO
                title="My Profile"
                description="Manage your Ruvera Couture profile, addresses, and account settings."
                keywords="profile, account, settings, address book"
            />
            <div id="recaptcha-container"></div>

            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="font-serif text-4xl text-midnight mb-2">My Account</h1>
                    <p className="text-stone-500 font-light">Manage your profile and preferences</p>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-stone-200 mb-8">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-4 text-sm uppercase tracking-widest transition-colors ${activeTab === 'profile'
                            ? 'text-ruvera-gold border-b-2 border-ruvera-gold font-medium'
                            : 'text-stone-500 hover:text-midnight'
                            }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('addresses')}
                        className={`pb-4 text-sm uppercase tracking-widest transition-colors ${activeTab === 'addresses'
                            ? 'text-ruvera-gold border-b-2 border-ruvera-gold font-medium'
                            : 'text-stone-500 hover:text-midnight'
                            }`}
                    >
                        Addresses
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-serif text-midnight">Personal Information</h2>
                            {!isEditingProfile && (
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => setIsEditingProfile(true)}
                                        className="flex items-center gap-2 text-sm text-ruvera-gold hover:text-midnight transition-colors"
                                    >
                                        <Edit2 size={16} />
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Display Name */}
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                                    <User size={14} className="inline mr-2" />
                                    Full Name
                                </label>
                                {isEditingProfile ? (
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold"
                                    />
                                ) : (
                                    <p className="text-midnight">{user?.displayName || 'Not set'}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                                    <Mail size={14} className="inline mr-2" />
                                    Email Address
                                    {auth.currentUser?.emailVerified && (
                                        <span className="ml-2 text-green-600 text-xs">(Verified ✓)</span>
                                    )}
                                </label>
                                {isEditingProfile ? (
                                    <div className="space-y-2">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold"
                                        />
                                        {!auth.currentUser?.emailVerified && (
                                            <button
                                                onClick={handleSendEmailVerification}
                                                className="text-xs text-ruvera-gold hover:text-midnight transition-colors"
                                            >
                                                Send Verification Email
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-midnight">{user?.email || 'Not set'}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                                    <Phone size={14} className="inline mr-2" />
                                    Phone Number
                                </label>
                                {isEditingProfile ? (
                                    <div className="space-y-3">
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold"
                                        />
                                        {!isVerifyingPhone ? (
                                            <button
                                                onClick={handleSendPhoneVerification}
                                                className="text-xs text-ruvera-gold hover:text-midnight transition-colors"
                                            >
                                                Verify Phone Number
                                            </button>
                                        ) : (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    placeholder="Enter 6-digit code"
                                                    className="w-full bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold"
                                                />
                                                <button
                                                    onClick={handleVerifyPhoneCode}
                                                    className="text-xs bg-ruvera-gold text-white px-4 py-2 rounded hover:bg-midnight transition-colors"
                                                >
                                                    Verify Code
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-midnight">{phone || 'Not set'}</p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {isEditingProfile && (
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={handleUpdateProfile}
                                        className="flex items-center gap-2 px-6 py-3 bg-ruvera-gold text-white rounded hover:bg-midnight transition-colors"
                                    >
                                        <Check size={18} />
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingProfile(false);
                                            setDisplayName(user?.displayName || '');
                                            setEmail(user?.email || '');
                                        }}
                                        className="flex items-center gap-2 px-6 py-3 border border-stone-300 text-stone-700 rounded hover:border-stone-400 transition-colors"
                                    >
                                        <X size={18} />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-serif text-midnight">Saved Addresses</h2>
                            <button
                                onClick={() => setIsAddingAddress(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-ruvera-gold text-white rounded hover:bg-midnight transition-colors text-sm"
                            >
                                <Plus size={16} />
                                Add New Address
                            </button>
                        </div>

                        {/* Add/Edit Address Form */}
                        {isAddingAddress && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                                <h3 className="font-serif text-lg mb-4">New Address</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={newAddress.name}
                                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                                        className="bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={newAddress.phone}
                                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                        className="bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Address Line 1"
                                        value={newAddress.addressLine1}
                                        onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                                        className="md:col-span-2 bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Address Line 2 (Optional)"
                                        value={newAddress.addressLine2}
                                        onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                                        className="md:col-span-2 bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold"
                                    />
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        className="bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold"
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                        className="bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Pincode"
                                        value={newAddress.pincode}
                                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                        className="bg-stone-50 border border-stone-200 p-3 rounded focus:outline-none focus:border-ruvera-gold"
                                    />
                                    <label className="flex items-center gap-2 text-sm text-stone-600">
                                        <input
                                            type="checkbox"
                                            checked={newAddress.isDefault}
                                            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                            className="rounded text-ruvera-gold focus:ring-ruvera-gold"
                                        />
                                        Set as default address
                                    </label>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={handleAddAddress}
                                        className="px-6 py-3 bg-ruvera-gold text-white rounded hover:bg-midnight transition-colors"
                                    >
                                        Save Address
                                    </button>
                                    <button
                                        onClick={() => setIsAddingAddress(false)}
                                        className="px-6 py-3 border border-stone-300 text-stone-700 rounded hover:border-stone-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Address List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className={`bg-white p-6 rounded-xl shadow-sm transition-all ${address.isDefault
                                        ? 'border-2 border-ruvera-gold'
                                        : 'border border-stone-100'
                                        }`}
                                >
                                    {address.isDefault && (
                                        <span className="inline-block px-3 py-1 bg-ruvera-gold/10 text-ruvera-gold text-xs font-medium rounded-full mb-3">
                                            Default
                                        </span>
                                    )}
                                    <h4 className="font-medium text-midnight mb-1">{address.name}</h4>
                                    <p className="text-sm text-stone-600 mb-1">{address.phone}</p>
                                    <p className="text-sm text-stone-600">
                                        {address.addressLine1}
                                        {address.addressLine2 && `, ${address.addressLine2}`}
                                    </p>
                                    <p className="text-sm text-stone-600">
                                        {address.city}, {address.state} - {address.pincode}
                                    </p>
                                    <div className="flex gap-4 mt-4">
                                        {!address.isDefault && (
                                            <button
                                                onClick={() => handleSetDefaultAddress(address.id)}
                                                className="text-xs text-ruvera-gold hover:text-midnight transition-colors"
                                            >
                                                Set as Default
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteAddress(address.id)}
                                            className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 size={12} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {addresses.length === 0 && !isAddingAddress && (
                            <div className="text-center py-12 text-stone-500">
                                <MapPin size={48} className="mx-auto mb-4 text-stone-300" />
                                <p>No saved addresses yet.</p>
                                <p className="text-sm">Add an address to make checkout faster.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;
