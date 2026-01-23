import express from 'express';
import * as wishlistController from './wishlist.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, wishlistController.getWishlist);
router.post('/items', authenticate, wishlistController.addToWishlist);
router.delete('/items/:id', authenticate, wishlistController.removeFromWishlist);
router.delete('/clear', authenticate, wishlistController.clearWishlist);

export default router;
