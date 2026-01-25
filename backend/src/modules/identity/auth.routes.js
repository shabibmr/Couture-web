import express from 'express';
import {
    registerCustomer,
    loginCustomer,
    loginAdmin,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    updateCurrentUser,
    syncFirebaseUser
} from './auth.controller.js';


// Address Routes
import { getAddresses, createAddress, updateAddress, deleteAddress } from './address.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Auth Routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/admin/login', loginAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/firebase-sync', syncFirebaseUser);
router.get('/me', authenticate, getCurrentUser);
router.put('/me', authenticate, updateCurrentUser);

// Address Routes
router.get('/addresses', authenticate, getAddresses);
router.post('/addresses', authenticate, createAddress);
router.put('/addresses/:id', authenticate, updateAddress);
router.delete('/addresses/:id', authenticate, deleteAddress);

export default router;
