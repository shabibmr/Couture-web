/**
 * Settings Service
 * Manages system settings with in-memory caching
 */

import Setting from '../../system/settings.model.js';
import { SETTINGS_KEYS, SHIPPING_DEFAULTS } from '../constants/order.constants.js';

class SettingsService {
    constructor() {
        this.cache = null;
        this.cacheTimestamp = null;
        this.CACHE_TTL = 3600000; // 1 hour in milliseconds
    }

    /**
     * Get all settings (with caching)
     * @param {boolean} forceRefresh - Force refresh from database
     * @returns {Object} Settings object with key-value pairs
     */
    async getSettings(forceRefresh = false) {
        const now = Date.now();

        // Return cached settings if valid
        if (!forceRefresh && this.cache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
            return this.cache;
        }

        // Fetch from database
        const settingsData = await Setting.findAll();
        const settings = {};

        settingsData.forEach(s => {
            settings[s.key] = s.value;
        });

        // Update cache
        this.cache = settings;
        this.cacheTimestamp = now;

        return settings;
    }

    /**
     * Get a specific setting value
     * @param {string} key - Setting key
     * @param {*} defaultValue - Default value if setting not found
     * @returns {*} Setting value or default
     */
    async getSetting(key, defaultValue = null) {
        const settings = await this.getSettings();
        return settings[key] !== undefined && settings[key] !== null
            ? settings[key]
            : defaultValue;
    }

    /**
     * Get shipping configuration
     * @returns {Object} { baseFee, freeThreshold }
     */
    async getShippingConfig() {
        const settings = await this.getSettings();

        const baseFee = settings[SETTINGS_KEYS.SHIPPING_FEE] !== undefined &&
                       settings[SETTINGS_KEYS.SHIPPING_FEE] !== null
            ? parseFloat(settings[SETTINGS_KEYS.SHIPPING_FEE])
            : SHIPPING_DEFAULTS.BASE_FEE;

        const freeThreshold = settings[SETTINGS_KEYS.FREE_SHIPPING_THRESHOLD] !== undefined &&
                             settings[SETTINGS_KEYS.FREE_SHIPPING_THRESHOLD] !== null
            ? parseFloat(settings[SETTINGS_KEYS.FREE_SHIPPING_THRESHOLD])
            : SHIPPING_DEFAULTS.FREE_THRESHOLD;

        return {
            baseFee,
            freeThreshold
        };
    }

    /**
     * Calculate shipping amount based on subtotal
     * @param {number} subtotal - Order subtotal
     * @returns {number} Shipping amount
     */
    async calculateShipping(subtotal) {
        const { baseFee, freeThreshold } = await this.getShippingConfig();

        // Free shipping if subtotal exceeds threshold
        if (subtotal >= freeThreshold && freeThreshold > 0) {
            return 0;
        }

        return baseFee;
    }

    /**
     * Clear settings cache
     * Call this after updating settings in the database
     */
    clearCache() {
        this.cache = null;
        this.cacheTimestamp = null;
    }

    /**
     * Update a setting (also clears cache)
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     */
    async updateSetting(key, value) {
        await Setting.upsert({ key, value });
        this.clearCache();
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getCacheStats() {
        const now = Date.now();
        const age = this.cacheTimestamp ? now - this.cacheTimestamp : null;
        const isValid = age !== null && age < this.CACHE_TTL;

        return {
            isCached: this.cache !== null,
            isValid,
            ageMs: age,
            ttlMs: this.CACHE_TTL
        };
    }
}

export default new SettingsService();
