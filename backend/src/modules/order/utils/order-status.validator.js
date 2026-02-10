/**
 * Order Status Validator
 * Manages order status transitions and validation
 */

import { ORDER_STATUS, ORDER_STATUS_TRANSITIONS } from '../constants/order.constants.js';

/**
 * Check if a status transition is valid
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Desired new status
 * @returns {boolean} True if transition is valid
 */
export const isValidStatusTransition = (currentStatus, newStatus) => {
    // Same status is always valid (no-op)
    if (currentStatus === newStatus) {
        return true;
    }

    const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
};

/**
 * Get all allowed transitions for a given status
 * @param {string} currentStatus - Current order status
 * @returns {Array} Array of allowed next statuses
 */
export const getAllowedTransitions = (currentStatus) => {
    return ORDER_STATUS_TRANSITIONS[currentStatus] || [];
};

/**
 * Validate status transition and throw error if invalid
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Desired new status
 * @throws {Error} If transition is invalid
 */
export const validateStatusTransition = (currentStatus, newStatus) => {
    if (!isValidStatusTransition(currentStatus, newStatus)) {
        const allowed = getAllowedTransitions(currentStatus);
        throw new Error(
            `Invalid status transition from '${currentStatus}' to '${newStatus}'. ` +
            `Allowed transitions: ${allowed.length > 0 ? allowed.join(', ') : 'none'}`
        );
    }
};

/**
 * Check if a status is valid
 * @param {string} status - Status to check
 * @returns {boolean} True if status is valid
 */
export const isValidStatus = (status) => {
    return Object.values(ORDER_STATUS).includes(status);
};

/**
 * Check if order status is final (no more transitions allowed)
 * @param {string} status - Order status
 * @returns {boolean} True if status is final
 */
export const isFinalStatus = (status) => {
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[status] || [];
    return allowedTransitions.length === 0;
};

/**
 * Check if order can be cancelled
 * @param {string} currentStatus - Current order status
 * @returns {boolean} True if order can be cancelled
 */
export const canCancelOrder = (currentStatus) => {
    return isValidStatusTransition(currentStatus, ORDER_STATUS.CANCELLED);
};

/**
 * Check if order can be refunded
 * @param {string} currentStatus - Current order status
 * @returns {boolean} True if order can be refunded
 */
export const canRefundOrder = (currentStatus) => {
    return isValidStatusTransition(currentStatus, ORDER_STATUS.REFUNDED);
};

/**
 * Determine inventory operation based on status transition
 * @param {string} oldStatus - Old order status
 * @param {string} newStatus - New order status
 * @returns {string|null} Inventory operation or null if no operation needed
 */
export const getInventoryOperation = (oldStatus, newStatus) => {
    // Release reserved stock when cancelling
    if (newStatus === ORDER_STATUS.CANCELLED && oldStatus !== ORDER_STATUS.CANCELLED) {
        return 'release';
    }

    // Finalize stock (deduct from quantity) when shipping
    if (newStatus === ORDER_STATUS.SHIPPED && oldStatus === ORDER_STATUS.PENDING) {
        return 'finalize';
    }

    // No inventory operation needed
    return null;
};

export default {
    isValidStatusTransition,
    getAllowedTransitions,
    validateStatusTransition,
    isValidStatus,
    isFinalStatus,
    canCancelOrder,
    canRefundOrder,
    getInventoryOperation
};
