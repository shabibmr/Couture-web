import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';
import ImageUpload from '../../components/ImageUpload';
import { getMinioUrl } from '../../utils/minio-url';

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
        additionalImages: [],
        is_active: true,
        is_new_arrival: false,
        is_featured: false,
        sort_order: 0
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
                            code: product.slug,
                            description: product.description || '',
                            sizes: product.variants?.map(v => v.Size?.name).filter(Boolean) || [],
                            category: product.category_id || '',
                            // Backend sends full URLs, but if object keys are sent, construct URLs
                            mainImage: product.featured_image ? getMinioUrl(product.featured_image, 'products') : '',
                            additionalImages: product.images && product.images.length > 0
                                ? product.images.map(img => getMinioUrl(img.image_url, 'products'))
                                : [],
                            is_active: product.is_active !== undefined ? product.is_active : true,
                            is_new_arrival: product.is_new_arrival || false,
                            is_featured: product.is_featured || false,
                            sort_order: product.sort_order || 0
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



    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.category) {
            alert('Please select a category');
            return;
        }

        try {
            // Prepare data to send - extract object keys from URLs for storage
            const extractObjectKey = (url) => {
                if (!url) return '';
                // If already an object key (no http/https), return as-is
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    return url;
                }
                // Extract object key from full URL
                try {
                    const urlObj = new URL(url);
                    const pathParts = urlObj.pathname.split('/').filter(Boolean);
                    // Remove bucket name (first part after domain)
                    if (pathParts[0] === 'products') {
                        pathParts.shift();
                    }
                    return pathParts.join('/');
                } catch {
                    return url;
                }
            };

            const dataToSend = {
                name: formData.title,
                slug: formData.code,
                description: formData.description,
                base_price: parseFloat(formData.price),
                category_id: formData.category,
                mainImage: extractObjectKey(formData.mainImage),
                additionalImages: formData.additionalImages.map(url => extractObjectKey(url)),
                sizes: formData.sizes,
                is_active: formData.is_active,
                is_new_arrival: formData.is_new_arrival,
                is_featured: formData.is_featured,
                sort_order: parseInt(formData.sort_order) || 0
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
                        <ImageUpload
                            value={formData.mainImage}
                            onChange={(url) => setFormData(prev => ({ ...prev, mainImage: url }))}
                            bucket="products"
                            folder="main"
                            label="MAIN PRODUCT IMAGE (OPTIONAL)"
                        />

                        {/* Additional Images */}
                        <ImageUpload
                            value={formData.additionalImages}
                            onChange={(urls) => setFormData(prev => ({ ...prev, additionalImages: urls }))}
                            bucket="products"
                            folder="additional"
                            label="ADDITIONAL IMAGES (OPTIONAL)"
                            multiple
                            maxFiles={3}
                        />
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
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Sort Order</label>
                            <input
                                type="number"
                                name="sort_order"
                                value={formData.sort_order}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 focus:border-ruvera-gold outline-none"
                                placeholder="0"
                            />
                            <p className="text-xs text-stone-400 mt-1">Higher numbers appear first.</p>
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
