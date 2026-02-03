import React, { useState, useRef } from 'react';
import api from '../../services/api';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
    label?: string;
    currentImageUrl?: string;
    onImageUploaded: (url: string, fileName: string) => void;
    onRemove?: () => void;
    onError?: (error: string) => void;
    aspectRatio?: string; // e.g. "3/4" or "video"
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    label = 'Upload Image',
    currentImageUrl,
    onImageUploaded,
    onRemove,
    onError,
    aspectRatio = '3/4',
}) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync with prop changes (e.g. when loading existing data)
    React.useEffect(() => {
        setPreviewUrl(currentImageUrl || '');
    }, [currentImageUrl]);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            const errorMsg = 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.';
            setError(errorMsg);
            if (onError) onError(errorMsg);
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 10 * 1024 * 1024; // Increased to 10MB to match backend if possible
        if (file.size > maxSize) {
            const errorMsg = 'File too large. Maximum size is 10MB.';
            setError(errorMsg);
            if (onError) onError(errorMsg);
            return;
        }

        // Clear previous errors
        setError('');

        // Show local preview immediately
        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);

        // Upload to backend
        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            setProgress(0);

            const response = await api.post(
                '/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / (progressEvent.total || 100)
                        );
                        setProgress(percentCompleted);
                    },
                }
            );

            // Upload successful
            const { url, fileName } = response.data;
            setPreviewUrl(url);
            onImageUploaded(url, fileName);
            setUploading(false);

        } catch (err: any) {
            console.error('Upload failed:', err);
            const errorMsg = err.response?.data?.message || 'Upload failed. Please try again.';
            setError(errorMsg);
            if (onError) onError(errorMsg);
            setUploading(false);
            setPreviewUrl(currentImageUrl || ''); // Revert to previous image
        }
    };

    const handleClick = () => {
        if (!uploading) {
            fileInputRef.current?.click();
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreviewUrl('');
        setError('');
        if (onRemove) onRemove();
    };

    return (
        <div className="image-upload-wrapper w-full">
            {label && (
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                    {label}
                </label>
            )}

            <div
                className={`w-full relative rounded-xl border-2 border-dashed transition-all overflow-hidden group 
                    ${error ? 'border-red-300' : 'border-stone-200 hover:border-ruvera-gold/50'}
                    ${uploading ? 'bg-stone-50' : 'bg-stone-50 cursor-pointer'}
                `}
                style={{ aspectRatio }}
                onClick={handleClick}
            >
                {previewUrl ? (
                    <>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity ${uploading ? 'opacity-30' : 'opacity-100'}`}
                        />
                        {!uploading && (
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <p className="text-white font-medium mb-2">Change Image</p>
                                {onRemove && (
                                    <button
                                        type="button"
                                        onClick={handleRemove}
                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                        title="Remove Image"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 p-4">
                        <Upload size={32} className="mb-2" />
                        <span className="text-sm font-medium text-center">Click to upload image</span>
                        <span className="text-xs text-stone-400 mt-1">JPEG, PNG, WEBP (Max 10MB)</span>
                    </div>
                )}

                {/* Loading/Progress Overlay */}
                {uploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 z-20">
                        <Loader2 className="animate-spin text-ruvera-gold mb-2" size={32} />
                        <span className="text-sm font-serif text-midnight">Uploading {progress}%</span>
                        <div className="mt-2 w-32 bg-stone-200 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-ruvera-gold h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {error && (
                <p className="mt-2 text-xs text-red-500 font-medium">
                    {error}
                </p>
            )}
        </div>
    );
};
