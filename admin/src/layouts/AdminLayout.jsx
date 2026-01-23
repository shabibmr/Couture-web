import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Settings, LogOut, Tag, Archive, PercentCircle, DollarSign, Image } from 'lucide-react';
import logo from '../assets/ruvera_logo.png';

const SidebarItem = ({ to, icon, label }) => {
    const LocationIcon = icon;
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group
        ${isActive
                    ? 'bg-ruvera-gold/10 text-ruvera-gold'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-white/5'
                }`}
        >
            <LocationIcon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-medium tracking-wide">{label}</span>
        </Link>
    );
};

export default function AdminLayout() {
    return (
        <div className="flex h-screen bg-stone-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-midnight text-white flex flex-col shadow-2xl z-20">
                <div className="p-8 border-b border-white/10 flex justify-center">
                    <img src={logo} alt="Ruvera Couture" className="h-12 w-auto object-contain" />
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem to="/orders" icon={ShoppingBag} label="Orders" />
                    <SidebarItem to="/payments" icon={DollarSign} label="Payments" />
                    <SidebarItem to="/stock" icon={Archive} label="Stock" />
                    <SidebarItem to="/products" icon={ShoppingBag} label="Products" />
                    <SidebarItem to="/coupons" icon={PercentCircle} label="Coupons" />
                    <SidebarItem to="/banners" icon={Image} label="Banners" />
                    <SidebarItem to="/categories" icon={Tag} label="Categories" />
                    <SidebarItem to="/customers" icon={Users} label="Customers" />
                    <SidebarItem to="/settings" icon={Settings} label="Settings" />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-stone-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors">
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative">
                <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 p-8 md:p-12 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
