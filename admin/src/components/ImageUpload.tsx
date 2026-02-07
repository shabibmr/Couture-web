import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage, uploadMultipleImages, deleteImage } from '../services/upload';
import { getMinioUrl } from '../utils/minio-url';

interface ImageUploadProps {
    value: string | string[];
    onChange: (value: string | string[]) => void;
    bucket: string;
    folder?: string;
    multiple?: boolean;
    maxFiles?: number;
    label?: string;
    required?: boolean;
    className?: string;
}

export default function ImageUpload({
    value,
    onChange,
    bucket,
    folder,
    multiple = false,
    maxFiles = 5,
    label,
    required = false,
    className = '',
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const images = Array.isArray(value) ? value : value ? [value] : [];

    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);

        // Check max files limit
        if (multiple && images.length + fileArray.length > maxFiles) {
            alert(`Maximum ${maxFiles} images allowed`);
            return;
        }

        // Validate file types
        const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
        if (validFiles.length !== fileArray.length) {
            alert('Only image files are allowed');
            return;
        }

        setUploading(true);
        try {
            if (multiple) {
                const results = await uploadMultipleImages(validFiles, bucket, folder);
                const newUrls = results.map(r => r.url);
                console.log('📤 Multiple upload result:', { results, newUrls });
                onChange([...images, ...newUrls]);
            } else {
                const result = await uploadImage(validFiles[0], bucket, folder);
                console.log('📤 Single upload result:', result);
                console.log('🖼️ Calling onChange with:', result.url);
                onChange(result.url);
            }
        } catch (error) {
            console.error('❌ Upload error:', error);
            alert('Failed to upload image(s)');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async (index: number) => {
        const imageToRemove = images[index];

        try {
            await deleteImage(imageToRemove);

            if (multiple) {
                const newImages = images.filter((_, i) => i !== index);
                onChange(newImages);
            } else {
                onChange('');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete image');
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const renderSingleImage = () => {
        const hasImage = images.length > 0;

        if (hasImage) {
            const imageUrl = getMinioUrl(images[0], bucket);
            console.log('🖼️ Displaying image:', { objectKey: images[0], bucket, fullUrl: imageUrl });
        }

        return (
            <div
                onClick={!hasImage ? handleClick : undefined}
                className={`
                    relative w-full aspect-[3/4] rounded-3xl border-2 border-dashed
                    transition-all duration-200 group overflow-hidden
                    ${hasImage
                        ? 'border-transparent'
                        : `cursor-pointer hover:bg-stone-50 ${dragActive ? 'border-ruvera-gold bg-amber-50' : 'border-stone-200'}`
                    }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {hasImage ? (
                    <>
                        <img
                            src={getMinioUrl(images[0], bucket)}
                            alt="Main product"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={handleClick}
                                className="p-3 bg-white text-midnight rounded-full hover:scale-110 transition-transform shadow-lg"
                                title="Change Image"
                            >
                                <Upload size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemove(0); }}
                                className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                                title="Remove Image"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        {uploading ? (
                            <Loader2 size={48} className="text-ruvera-gold animate-spin mb-4" />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-stone-400">
                                <ImageIcon size={32} />
                            </div>
                        )}
                        <p className="text-sm font-medium text-stone-500">
                            {uploading ? 'Uploading...' : 'Click to upload main image'}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const renderMultipleSlots = () => {
        return (
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: maxFiles }).map((_, index) => {
                    const url = images[index];
                    const isNext = index === images.length;

                    return (
                        <div
                            key={index}
                            onClick={isNext && !uploading ? handleClick : undefined}
                            className={`
                                relative aspect-square rounded-2xl border-2 border-dashed
                                flex flex-col items-center justify-center text-center p-2
                                transition-all duration-200
                                ${url
                                    ? 'border-transparent'
                                    : isNext
                                        ? 'border-stone-200 cursor-pointer hover:border-ruvera-gold hover:bg-stone-50'
                                        : 'border-stone-100 bg-stone-50/50 cursor-not-allowed'
                                }
                            `}
                        >
                            {url ? (
                                <div className="group relative w-full h-full">
                                    <img
                                        src={getMinioUrl(url, bucket)}
                                        alt={`Product ${index + 1}`}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className={`flex flex-col items-center gap-2 ${!isNext && 'opacity-30'}`}>
                                    {isNext && uploading ? (
                                        <Loader2 size={24} className="text-ruvera-gold animate-spin" />
                                    ) : (
                                        <Upload size={20} className="text-stone-300" />
                                    )}
                                    <span className="text-xs font-medium text-stone-400">
                                        Image {index + 1}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {label && (
                <div className="flex items-baseline justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {multiple && (
                        <span className="text-xs text-stone-400 font-medium">
                            {images.length} of {maxFiles}
                        </span>
                    )}
                </div>
            )}

            {multiple ? renderMultipleSlots() : renderSingleImage()}

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                multiple={multiple}
                onChange={(e) => handleFileSelect(e.target.files)}
            />
        </div>
    );
}
