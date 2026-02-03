import express from 'express';
import multer from 'multer';
import { uploadFile, deleteFile } from './upload.controller.js';
import { authenticate, isAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// Single file upload
router.post('/', authenticate, isAdmin, upload.single('file'), uploadFile);

// Delete file
router.delete('/', authenticate, isAdmin, deleteFile);

export default router;
