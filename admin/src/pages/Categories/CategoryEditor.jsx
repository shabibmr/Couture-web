import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Tag } from 'lucide-react';
import api from '../../services/api';

export default function CategoryEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;
    const [loading, setLoading] = useState(isEditing);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        status: 'Active'
    });

    useEffect(() => {
        const loadCategory = async () => {
            if (isEditing) {
                try {
                    const response = await api.get('/products/categories');
                    const category = response.data.find(c => c.id === id);
                    if (category) {
                        setFormData({
                            name: category.name,
                            slug: category.slug,
                            description: category.description || '',
                            status: category.is_active ? 'Active' : 'Inactive'
                        });
                    }
                } catch (error) {
                    console.error('Error loading category:', error);
                }
            }
            setLoading(false);
        };

        loadCategory();
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updates = { [name]: value };
            if (name === 'name' && !isEditing) {
                updates.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            }
            return { ...prev, ...updates };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/products/categories/${id}`, formData);
            } else {
                await api.post('/products/categories', formData);
            }
            navigate('/categories');
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        }
    };

    if (loading) return <div className="p-12 text-center text-stone-400">Loading editor...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/categories" className="p-2 border border-stone-200 rounded-full text-stone-400 hover:text-midnight hover:border-midnight transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="text-3xl font-serif text-midnight">{isEditing ? 'Edit Category' : 'New Category'}</h2>
                        <p className="text-stone-500 mt-1">{isEditing ? `Refining ${formData.name}` : 'Create a new collection group.'}</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-midnight text-white px-8 py-3 rounded-lg hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl"
                >
                    <Save size={20} />
                    <span className="font-medium tracking-wide">Save Category</span>
                </button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Category Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all font-serif text-lg"
                            placeholder="e.g. Coats & Jackets"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Slug</label>
                        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 text-stone-500">
                            <Tag size={16} />
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                className="w-full bg-transparent outline-none font-mono text-sm"
                                placeholder="coats-jackets"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all resize-none"
                            placeholder="Describe this category..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 focus:border-ruvera-gold outline-none"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
