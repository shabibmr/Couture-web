import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem } from './cart.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { addToCartSchema, updateCartItemSchema, cartItemIdSchema } from './cart.validation.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/items', validate(addToCartSchema), addToCart);
router.put('/items/:id', validate(cartItemIdSchema, 'params'), validate(updateCartItemSchema), updateCartItem);
router.delete('/items/:id', validate(cartItemIdSchema, 'params'), removeCartItem);

export default router;
