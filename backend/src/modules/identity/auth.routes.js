import express from 'express';
import {
    registerCustomer,
    loginCustomer,
    loginAdmin,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    updateCurrentUser,
    syncFirebaseUser,
    checkPhoneUser
} from './auth.controller.js';


// Address Routes
import { getAddresses, createAddress, updateAddress, deleteAddress } from './address.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
    registerSchema,
    loginSchema,
    syncFirebaseUserSchema,
    requestPasswordResetSchema,
    resetPasswordSchema
} from './auth.validation.js';

const router = express.Router();

// Auth Routes
router.post('/register', validate(registerSchema), registerCustomer);
router.post('/login', validate(loginSchema), loginCustomer);
router.post('/admin/login', validate(loginSchema), loginAdmin);
router.post('/forgot-password', validate(requestPasswordResetSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/firebase-sync', validate(syncFirebaseUserSchema), syncFirebaseUser);
router.post('/check-phone', checkPhoneUser);
router.get('/me', authenticate, getCurrentUser);
router.put('/me', authenticate, updateCurrentUser);

// Address Routes
router.get('/addresses', authenticate, getAddresses);
router.post('/addresses', authenticate, createAddress);
router.put('/addresses/:id', authenticate, updateAddress);
router.delete('/addresses/:id', authenticate, deleteAddress);

export default router;
