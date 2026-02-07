import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

import api from '../../services/api';

export default function BannerEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;
    const [loading, setLoading] = useState(!isNew);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        link: '',
        image: '',
        start: '',
        end: '',
        order: 0,
        isActive: true
    });

    useEffect(() => {
        if (!isNew) {
            const fetchBanner = async () => {
                try {
                    const response = await api.get(`/banners/${id}`);
                    const banner = response.data;

                    // Format dates for date inputs (YYYY-MM-DD)
                    const formattedBanner = {
                        title: banner.title || '',
                        description: banner.description || '',
                        link: banner.link || '',
                        image: banner.image || '',
                        start: banner.start ? new Date(banner.start).toISOString().split('T')[0] : '',
                        end: banner.end ? new Date(banner.end).toISOString().split('T')[0] : '',
                        order: banner.order || 0,
                        isActive: banner.isActive !== undefined ? banner.isActive : true
                    };
                    setFormData(formattedBanner);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching banner:', error);
                    alert('Failed to load banner');
                    setLoading(false);
                }
            };
            fetchBanner();
        }
    }, [id, isNew]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Prepare data for submission - convert empty strings to null for dates
            const submitData = {
                ...formData,
                start: formData.start || null,
                end: formData.end || null,
                order: parseInt(formData.order) || 0
            };

            if (isNew) {
                await api.post('/banners', submitData);
            } else {
                await api.put(`/banners/${id}`, submitData);
            }
            navigate('/banners');
        } catch (error) {
            console.error('Error saving banner:', error);
            alert('Failed to save banner. Please check the console for details.');
        }
    };

    if (loading) return <div className="p-12 text-center text-stone-400">Loading editor...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/banners" className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-2xl font-serif text-midnight">{isNew ? 'New Banner' : 'Edit Banner'}</h2>
                    <p className="text-stone-500 text-sm mt-1">Configure homepage visuals.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-full">
                        <ImageUpload
                            value={formData.image}
                            onChange={(url) => {
                                console.log('🎯 BannerEditor: Image changed to:', url);
                                setFormData({ ...formData, image: url });
                            }}
                            bucket="banners"
                            label="Banner Image"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600">Title (Internal Name)</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2 col-span-full">
                        <label className="text-sm font-medium text-stone-600">Description</label>
                        <textarea
                            rows="3"
                            placeholder="Enter banner description..."
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all resize-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600">Link URL</label>
                        <input
                            type="text"
                            placeholder="/collections/..."
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                            value={formData.link}
                            onChange={e => setFormData({ ...formData, link: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600">Start Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                            value={formData.start}
                            onChange={e => setFormData({ ...formData, start: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600">End Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                            value={formData.end}
                            onChange={e => setFormData({ ...formData, end: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600">Sort Order</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-ruvera-gold focus:ring-1 focus:ring-ruvera-gold outline-none transition-all"
                            value={formData.order}
                            onChange={e => setFormData({ ...formData, order: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2 flex items-center h-full pt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-stone-300 text-ruvera-gold focus:ring-ruvera-gold"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <span className="font-medium text-midnight">Active</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-stone-100 flex justify-end gap-3">
                    <Link to="/banners" className="px-6 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">
                        Cancel
                    </Link>
                    <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-midnight text-white rounded-lg hover:bg-stone-800 transition-colors shadow-lg">
                        <Save size={18} />
                        <span>Save Banner</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
