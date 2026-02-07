import express from 'express';
import * as bannerController from './banner.controller.js';

const router = express.Router();

router.get('/', bannerController.getBanners);
router.get('/:id', bannerController.getBannerById);
router.post('/', bannerController.createBanner);
router.put('/:id', bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

export default router;
