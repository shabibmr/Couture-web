import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Package, Truck, Home, ArrowLeft, LucideIcon } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Order } from '../types';

interface TrackingStep {
    status: string;
    icon: LucideIcon;
    date: string;
}

const OrderTrackingPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { orders } = useShop();
    const [order, setOrder] = useState<Order | null | undefined>(null);

    useEffect(() => {
        const foundOrder = orders.find(o => o.id === id);
        setOrder(foundOrder);
    }, [id, orders]);

    if (order === null) return <div className="pt-40 text-center">Loading Order...</div>;
    if (order === undefined) return <div className="pt-40 text-center">Order not found</div>;

    // Timeline Steps
    const steps: TrackingStep[] = [
        { status: 'Placed', icon: Package, date: order.date },
        { status: 'Processing', icon: Package, date: order.date },
        { status: 'Shipped', icon: Truck, date: 'Estimated: 2 days' },
        { status: 'Delivered', icon: Home, date: 'Estimated: 5 days' }
    ];

    const getCurrentStep = (status: string): number => {
        if (status === 'Delivered') return 4;
        if (status === 'Shipped') return 3;
        if (status === 'Processing') return 2;
        return 1; // Placed
    };

    const currentStep = getCurrentStep(order.status);

    return (
        <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <Link to="/orders" className="flex items-center text-stone-500 mb-8 hover:text-midnight transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Back to Orders
                </Link>

                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-100">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h1 className="font-serif text-3xl text-midnight mb-2">Order {order.id}</h1>
                            <p className="text-stone-500 text-sm">Placed on {order.date}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-ruvera-gold/10 text-ruvera-gold'
                            }`}>
                            {order.status}
                        </div>
                    </div>

                    <div className="relative mb-16">
                        <div className="absolute left-0 top-1/2 w-full h-1 bg-stone-100 -translate-y-1/2 z-0 hidden md:block" />
                        <div className="absolute left-6 top-0 w-1 h-full bg-stone-100 -translate-x-1/2 z-0 md:hidden" />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                            {steps.map((step, index) => {
                                const isCompleted = index < currentStep;
                                const isCurrent = index === currentStep - 1;

                                return (
                                    <div key={index} className="flex md:flex-col items-center gap-6 md:gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted
                                            ? 'bg-ruvera-gold border-ruvera-gold text-white'
                                            : isCurrent
                                                ? 'bg-white border-ruvera-gold text-ruvera-gold'
                                                : 'bg-white border-stone-200 text-stone-300'
                                            }`}>
                                            {isCompleted ? <Check size={18} /> : <step.icon size={18} />}
                                        </div>
                                        <div className="md:text-center">
                                            <p className={`font-medium text-sm ${isCompleted || isCurrent ? 'text-midnight' : 'text-stone-400'}`}>
                                                {step.status}
                                            </p>
                                            <p className="text-xs text-stone-400 mt-1">{step.date}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-serif text-xl border-b border-stone-100 pb-4 mb-6">Items in Shipment</h3>
                        <div className="space-y-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-center">
                                    <img src={item.image} alt="item" className="w-16 h-20 object-cover bg-stone-200 rounded" />
                                    <div>
                                        <p className="font-medium text-midnight">{item.title}</p>
                                        <p className="text-sm text-stone-500">{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;
