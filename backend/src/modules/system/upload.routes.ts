import { Router } from 'express';
import { upload } from '../../middleware/upload.middleware.js';
import { uploadSingleImage, uploadImages, deleteImageController } from './upload.controller.js';

const router = Router();

// Upload single image
router.post('/image', upload.single('file'), uploadSingleImage);

// Upload multiple images
router.post('/images', upload.array('files', 10), uploadImages);

// Delete image
router.delete('/image', deleteImageController);

export default router;
