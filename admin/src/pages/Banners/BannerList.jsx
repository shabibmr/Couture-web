import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Image, GripVertical } from 'lucide-react';

import api from '../../services/api';
import { getMinioUrl } from '../../utils/minio-url';

export default function BannerList() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await api.get('/banners');
            setBanners(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching banners:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this banner?')) {
            try {
                await api.delete(`/banners/${id}`);
                setBanners(prev => prev.filter(b => b.id !== id));
            } catch (error) {
                console.error('Error deleting banner:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-serif text-midnight">Banners</h2>
                    <p className="text-stone-500 mt-1">Manage marketing visuals and sliders.</p>
                </div>
                <Link
                    to="/banners/new"
                    className="inline-flex items-center justify-center gap-2 bg-midnight text-white px-6 py-3 rounded-lg hover:bg-stone-800 transition-colors shadow-lg hover:shadow-xl group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-medium tracking-wide">Add Banner</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-12 text-center text-stone-400">Loading banners...</div>
                ) : (
                    banners.map((banner, index) => (
                        <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-stone-100 p-4 flex gap-6 items-center group hover:bg-stone-50/50 transition-colors">
                            <div className="text-stone-300 cursor-move hover:text-stone-500">
                                <GripVertical size={20} />
                            </div>

                            <div className="w-48 h-24 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                <img src={getMinioUrl(banner.image, 'banners')} alt={banner.title} className="w-full h-full object-cover" />
                                {!banner.isActive && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                        <span className="text-xs font-bold uppercase tracking-wider text-stone-600 bg-white px-2 py-1 rounded shadow-sm">Inactive</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-serif text-midnight">{banner.title}</h3>
                                <div className="text-sm text-stone-500 mt-1 flex gap-4">
                                    <span>#{banner.order}</span>
                                    <span>{banner.start ? new Date(banner.start).toLocaleDateString() : 'Immediate'} - {banner.end ? new Date(banner.end).toLocaleDateString() : 'Indefinite'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link to={`/banners/${banner.id}`} className="p-2 text-stone-400 hover:text-ruvera-gold hover:bg-white rounded-full transition-colors">
                                    <Edit2 size={18} />
                                </Link>
                                <button onClick={() => handleDelete(banner.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
