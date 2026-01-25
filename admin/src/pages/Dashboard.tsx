import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, ShoppingBag, Users, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import api from '../services/api';

import { formatCurrency } from '../utils/currency';

interface StatCardProps {
    label: string;
    value: string | number;
    trend?: number;
    icon: React.ElementType;
    colorClass: string;
}

const StatCard = ({ label, value, trend, icon, colorClass }: StatCardProps) => {
    const Icon = icon;
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon size={24} className="text-white" />
                </div>
                {/* Trend is hidden if not passed or hardcoded for now */}
                {trend !== undefined && (
                    <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'} bg-stone-50 px-2 py-1 rounded-full`}>
                        {trend >= 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <h3 className="text-stone-500 text-sm font-medium uppercase tracking-wider">{label}</h3>
            <p className="text-3xl font-serif text-midnight mt-1">{value}</p>
        </div>
    );
};

export default function Dashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        customers: 0,
        growth: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };
        fetchStats();
    }, []);
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-serif text-midnight mb-2">Dashboard</h2>
                    <p className="text-stone-500">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-stone-400 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Quick Access */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/products" className="group bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-stone-50 text-midnight rounded-xl group-hover:bg-midnight group-hover:text-white transition-colors">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-serif text-midnight">Manage Products</h3>
                            <p className="text-stone-500 text-sm">Add or edit catalog items</p>
                        </div>
                    </div>
                    <ArrowRight size={20} className="text-stone-300 group-hover:text-ruvera-gold transition-colors" />
                </Link>

                <Link to="/orders" state={{ filter: 'pending' }} className="group bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-stone-50 text-midnight rounded-xl group-hover:bg-midnight group-hover:text-white transition-colors">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-serif text-midnight">Pending Orders</h3>
                            <p className="text-stone-500 text-sm">Review processing orders</p>
                        </div>
                    </div>
                    <ArrowRight size={20} className="text-stone-300 group-hover:text-ruvera-gold transition-colors" />
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Revenue"
                    value={formatCurrency(stats.revenue)}
                    trend={stats.growth}
                    icon={IndianRupee}
                    colorClass="bg-gradient-to-br from-midnight to-stone-700"
                />
                <StatCard
                    label="New Orders"
                    value={stats.orders}
                    trend={8.2}
                    icon={ShoppingBag}
                    colorClass="bg-gradient-to-br from-ruvera-gold to-yellow-600"
                />
                <StatCard
                    label="Total Customers"
                    value={stats.customers}
                    trend={-2.4}
                    icon={Users}
                    colorClass="bg-gradient-to-br from-stone-500 to-stone-700"
                />
                <StatCard
                    label="Growth"
                    value={`${stats.growth}%`}
                    trend={5.1}
                    icon={TrendingUp}
                    colorClass="bg-gradient-to-br from-emerald-500 to-emerald-700"
                />
            </div>

            {/* Content Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
                    <h3 className="text-xl font-serif text-midnight mb-6">Recent Orders</h3>
                    <div className="h-64 flex items-center justify-center text-stone-400 bg-stone-50 rounded-xl border-dashed border-2 border-stone-200">
                        Chart / Table Placeholder
                    </div>
                </div>

                <div className="bg-midnight text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-ruvera-gold opacity-10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                    <h3 className="text-xl font-serif text-ruvera-gold mb-6 relative z-10">Concierge Intel</h3>
                    <div className="space-y-4 relative z-10">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                            <p className="text-sm text-stone-300">"Customer #8291 explicitly asked for the silk scarf in 'Emerald' during chat."</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                            <p className="text-sm text-stone-300">"Concierge detected high interest in 'Sunset' collection from User 'Anna'."</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
