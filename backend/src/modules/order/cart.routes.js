import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem } from './cart.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItem);

export default router;
