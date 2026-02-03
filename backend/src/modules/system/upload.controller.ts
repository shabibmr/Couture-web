import { Request, Response } from 'express';
import { minioService } from '../../services/minio.service.js';
import path from 'path';

export const uploadFile = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = req.file;

        // Validate file type (images only)
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return res.status(400).json({
                message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
            });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return res.status(400).json({
                message: 'File too large. Maximum size is 5MB.'
            });
        }

        const fileName = `uploads/${Date.now()}-${path.basename(file.originalname)}`;
        const mimeType = file.mimetype;

        const fileUrl = await minioService.uploadFile(file.buffer, fileName, mimeType);

        return res.status(200).json({
            message: 'File uploaded successfully',
            url: fileUrl,
            fileName: fileName,
        });
    } catch (error: any) {
        console.error('Upload controller error:', error);
        return res.status(500).json({ message: 'File upload failed', error: error.message });
    }
};

export const deleteFile = async (req: Request, res: Response) => {
    try {
        const { fileName } = req.body;
        if (!fileName) {
            return res.status(400).json({ message: 'fileName is required' });
        }

        await minioService.deleteFile(fileName);
        return res.status(200).json({ message: 'File deleted successfully' });
    } catch (error: any) {
        console.error('Delete controller error:', error);
        return res.status(500).json({ message: 'File deletion failed', error: error.message });
    }
}
