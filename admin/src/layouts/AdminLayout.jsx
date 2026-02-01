import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Settings, LogOut, Tag, Archive, PercentCircle, DollarSign, Image, Menu, X } from 'lucide-react';
import logo from '../assets/ruvera_logo.png';

const SidebarItem = ({ to, icon, label, onClick }) => {
    const LocationIcon = icon;
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            onClick={onClick}
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex h-screen bg-stone-50 overflow-hidden font-sans">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-40
                w-72 bg-midnight text-white flex flex-col shadow-2xl
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Mobile Close Button */}
                <button
                    onClick={closeSidebar}
                    className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white md:hidden"
                >
                    <X size={24} />
                </button>

                <div className="p-8 border-b border-white/10 flex justify-center">
                    <img src={logo} alt="Ruvera Couture" className="h-12 w-auto object-contain" />
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" onClick={closeSidebar} />
                    <SidebarItem to="/orders" icon={ShoppingBag} label="Orders" onClick={closeSidebar} />
                    <SidebarItem to="/payments" icon={DollarSign} label="Payments" onClick={closeSidebar} />
                    <SidebarItem to="/stock" icon={Archive} label="Stock" onClick={closeSidebar} />
                    <SidebarItem to="/products" icon={ShoppingBag} label="Products" onClick={closeSidebar} />
                    <SidebarItem to="/coupons" icon={PercentCircle} label="Coupons" onClick={closeSidebar} />
                    <SidebarItem to="/banners" icon={Image} label="Banners" onClick={closeSidebar} />
                    <SidebarItem to="/categories" icon={Tag} label="Categories" onClick={closeSidebar} />
                    <SidebarItem to="/customers" icon={Users} label="Customers" onClick={closeSidebar} />
                    <SidebarItem to="/settings" icon={Settings} label="Settings" onClick={closeSidebar} />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-stone-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative">
                {/* Mobile Header with Hamburger */}
                <div className="md:hidden sticky top-0 z-20 bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 text-midnight hover:bg-stone-100 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="font-serif text-lg text-midnight">Ruvera Couture</h1>
                </div>

                <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 p-8 md:p-12 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
