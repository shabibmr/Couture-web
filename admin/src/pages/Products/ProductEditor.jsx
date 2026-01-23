import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import api from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';

export default function ProductEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const isEditing = !!id;
    const [loading, setLoading] = useState(isEditing);

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        code: '',
        description: '',
        sizes: [],
        category: '',
        mainImage: '',
        additionalImages: ['', '', ''], // Array for 3 additional images
        is_active: true,
        is_new_arrival: false,
        is_featured: false
    });

    const [categories, setCategories] = useState([]);
    const [availableSizes, setAvailableSizes] = useState([]);

    useEffect(() => {
        const loadCommonData = async () => {
            try {
                const [categoriesResponse, sizesResponse] = await Promise.all([
                    api.get('/products/categories'),
                    api.get('/products/sizes')
                ]);
                setCategories(categoriesResponse.data);
                setAvailableSizes(sizesResponse.data);
            } catch (error) {
                console.error('Error loading common data:', error);
            }
        };
        loadCommonData();
    }, []);

    useEffect(() => {
        const loadProduct = async () => {
            if (isEditing) {
                try {
                    const response = await api.get(`/products/id/${id}`);
                    const product = response.data;

                    if (product) {
                        setFormData({
                            title: product.name,
                            price: product.base_price,
                            code: product.slug, // Using slug as code for now
                            description: product.description || '',
                            sizes: product.variants?.map(v => v.Size?.name).filter(Boolean) || [],
                            category: product.category_id || '',
                            mainImage: product.featured_image || '',
                            additionalImages: product.images && product.images.length > 0
                                ? product.images.map(img => img.image_url)
                                : ['', '', ''],
                            is_active: product.is_active !== undefined ? product.is_active : true,
                            is_new_arrival: product.is_new_arrival || false,
                            is_featured: product.is_featured || false
                        });

                        // Fill remaining slots if less than 3 images
                        setFormData(prev => {
                            const currentImages = prev.additionalImages;
                            const filledImages = [...currentImages];
                            while (filledImages.length < 3) {
                                filledImages.push('');
                            }
                            return { ...prev, additionalImages: filledImages };
                        });
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error loading product:', error);
                    setLoading(false);
                }
            }
        };

        loadProduct();
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const toggleSize = (size) => {
        setFormData(prev => {
            const sizes = prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size];
            return { ...prev, sizes };
        });
    };

    const handleImageUpload = (e, type, index = null) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        // Convert to base64 for preview (in production, upload to server/cloud)
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;

            if (type === 'main') {
                setFormData(prev => ({ ...prev, mainImage: base64String }));
            } else if (type === 'additional' && index !== null) {
                setFormData(prev => {
                    const newAdditionalImages = [...prev.additionalImages];
                    newAdditionalImages[index] = base64String;
                    return { ...prev, additionalImages: newAdditionalImages };
                });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAdditionalImage = (index) => {
        setFormData(prev => {
            const newAdditionalImages = [...prev.additionalImages];
            newAdditionalImages[index] = '';
            return { ...prev, additionalImages: newAdditionalImages };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.category) {
            alert('Please select a category');
            return;
        }

        try {
            // Prepare data to send
            const dataToSend = {
                ...formData,
                name: formData.title, // Backend expects 'name' field
                base_price: parseFloat(formData.price),
                category_id: formData.category,
                is_active: formData.is_active,
                is_new_arrival: formData.is_new_arrival,
                is_featured: formData.is_featured
            };

            if (isEditing) {
                await api.put(`/products/${id}`, dataToSend);
            } else {
                await api.post('/products', dataToSend);
            }
            navigate('/products');
        } catch (error) {
            console.error('Error saving product:', error);
            alert(`Error saving product: ${error.response?.data?.message || error.message}`);
        }
    };

    if (loading) return <div className="p-12 text-center text-stone-400">Loading editor...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/products" className="p-2 border border-stone-200 rounded-full text-stone-400 hover:text-midnight hover:border-midnight transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="text-3xl font-serif text-midnight">{isEditing ? 'Edit Product' : 'New Product'}</h2>
                        <p className="text-stone-500 mt-1">{isEditing ? `Refining ${formData.code}` : 'Add a new masterpiece to the catalogue.'}</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-midnight text-white px-8 py-3 rounded-lg hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl"
                >
                    <Save size={20} />
                    <span className="font-medium tracking-wide">Save Product</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
                        <h3 className="font-serif text-xl text-midnight">Basic Information</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Product Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all font-serif text-lg"
                                    placeholder="e.g. Structured Wool Blazer"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Price ({settings.currency_code})</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">SKU Code</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all font-mono text-sm"
                                        placeholder="e.g. 56-24-001"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all resize-none"
                                    placeholder="Describe the silhouette, fabric, and details..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
                        <h3 className="font-serif text-xl text-midnight">Variants</h3>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Available Sizes</label>
                            <div className="flex flex-wrap gap-3">
                                {availableSizes.map(size => (
                                    <button
                                        key={size.id}
                                        type="button"
                                        onClick={() => toggleSize(size.name)}
                                        className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-all ${formData.sizes.includes(size.name)
                                            ? 'bg-midnight text-white border-midnight shadow-md'
                                            : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                                            }`}
                                    >
                                        {size.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 space-y-6">
                        <h3 className="font-serif text-xl text-midnight">Product Images</h3>

                        {/* Main Image */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
                                Main Product Image (Optional)
                            </label>
                            <div className="w-full aspect-[3/4] bg-stone-100 rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 hover:border-ruvera-gold/50 cursor-pointer transition-colors relative overflow-hidden group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'main')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {formData.mainImage ? (
                                    <>
                                        <img src={formData.mainImage} alt="Main Preview" className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-0">
                                            <p className="text-white font-medium mb-2">Change Image</p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormData(prev => ({ ...prev, mainImage: '' }));
                                                }}
                                                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={32} className="mb-2" />
                                        <span className="text-sm font-medium">Upload Main Image</span>
                                        <span className="text-xs text-stone-400 mt-1">Click or drag to upload</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Additional Images */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
                                Additional Images (Optional)
                                <span className="ml-2 text-stone-300 normal-case font-normal">
                                    {formData.additionalImages.filter(img => img).length} of 3
                                </span>
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {formData.additionalImages.map((img, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square bg-stone-100 rounded-lg border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 hover:border-ruvera-gold/50 cursor-pointer transition-colors relative overflow-hidden group"
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'additional', index)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        {img ? (
                                            <>
                                                <img src={img} alt={`Additional ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-0">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveAdditionalImage(index);
                                                        }}
                                                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={20} className="mb-1" />
                                                <span className="text-xs">Image {index + 1}</span>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 space-y-4">
                        <h3 className="font-serif text-xl text-midnight">Organization</h3>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 focus:border-ruvera-gold outline-none"
                            >
                                <option value="">Select Category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Settings</label>
                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-3 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50 transition-colors">
                                    <span className="font-medium text-midnight">Active Status</span>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-midnight"></div>
                                    </div>
                                </label>

                                <label className="flex items-center justify-between p-3 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50 transition-colors">
                                    <span className="font-medium text-midnight">New Arrival</span>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_new_arrival"
                                            checked={formData.is_new_arrival}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-midnight"></div>
                                    </div>
                                </label>

                                <label className="flex items-center justify-between p-3 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50 transition-colors">
                                    <span className="font-medium text-midnight">Featured Product</span>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_featured"
                                            checked={formData.is_featured}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-midnight"></div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
