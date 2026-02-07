import api from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export interface UserProfileData {
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar_url?: string;
    email?: string;
}

export interface BackendAddress {
    id: string;
    customer_id: string;
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default_shipping: boolean;
    is_default_billing: boolean;
}

export interface CreateAddressData {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country?: string;
    is_default_shipping?: boolean;
    is_default_billing?: boolean;
}

const userService = {
    // User Profile
    getProfile: async () => {
        const response = await api.get(API_ENDPOINTS.AUTH.ME);
        return response.data;
    },

    updateProfile: async (data: UserProfileData) => {
        const response = await api.put(API_ENDPOINTS.AUTH.UPDATE_ME, data);
        return response.data;
    },

    // Addresses
    getAddresses: async () => {
        const response = await api.get<BackendAddress[]>(API_ENDPOINTS.AUTH.ADDRESSES);
        return response.data;
    },

    addAddress: async (data: CreateAddressData) => {
        const response = await api.post<BackendAddress>(API_ENDPOINTS.AUTH.ADDRESSES, data);
        return response.data;
    },

    updateAddress: async (id: string, data: Partial<CreateAddressData>) => {
        const response = await api.put<BackendAddress>(API_ENDPOINTS.AUTH.ADDRESS_BY_ID(id), data);
        return response.data;
    },

    deleteAddress: async (id: string) => {
        const response = await api.delete(API_ENDPOINTS.AUTH.ADDRESS_BY_ID(id));
        return response.data;
    }
};

export default userService;
