import api from './api';

export interface UploadResult {
    url: string;
    objectName: string;
}

export interface UploadMultipleResult {
    images: UploadResult[];
}

/**
 * Upload a single image to MinIO
 */
export async function uploadImage(
    file: File,
    bucket: string,
    folder?: string
): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    if (folder) {
        formData.append('folder', folder);
    }

    const response = await api.post<UploadResult>('/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
}

/**
 * Upload multiple images to MinIO
 */
export async function uploadMultipleImages(
    files: File[],
    bucket: string,
    folder?: string
): Promise<UploadResult[]> {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });
    formData.append('bucket', bucket);
    if (folder) {
        formData.append('folder', folder);
    }

    const response = await api.post<UploadMultipleResult>('/upload/images', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data.images;
}

/**
 * Delete an image from MinIO
 */
export async function deleteImage(url: string): Promise<void> {
    await api.delete('/upload/image', {
        data: { url },
    });
}
