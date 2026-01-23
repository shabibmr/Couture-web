import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShoppingBag, Code } from 'lucide-react';

export default function PaymentDetail() {
    const { id } = useParams();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPaymentDetails();
    }, [id]);

    const fetchPaymentDetails = () => {
        setLoading(true);
        setTimeout(() => {
            setPayment({
                id: id,
                orderId: 'ORD-1715432001',
                amount: 1250.00,
                currency: 'USD',
                gateway: 'Razorpay',
                status: 'completed',
                date: '2024-05-11T14:35:00Z',
                response: {
                    id: "pay_Opn232n32",
                    entity: "payment",
                    amount: 125000,
                    currency: "INR",
                    status: "captured",
                    order_id: "order_DBJOWzybf0sJbb",
                    method: "card",
                    description: "Order #123456 payment",
                    captured: true
                }
            });
            setLoading(false);
        }, 500);
    };

    if (loading) return <div className="p-12 text-center text-stone-400">Loading transaction details...</div>;
    if (!payment) return <div className="p-12 text-center text-red-400">Transaction not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/payments" className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-2xl font-serif text-midnight">Transaction {payment.id}</h2>
                    <p className="text-stone-500 text-sm mt-1">Processed via {payment.gateway} on {new Date(payment.date).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 space-y-6">
                    <h3 className="font-medium text-midnight flex items-center gap-2">
                        <CreditCard size={20} className="text-ruvera-gold" />
                        Transaction Summary
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-stone-50 pb-2">
                            <span className="text-stone-500">Amount</span>
                            <span className="font-medium text-xl text-midnight">${payment.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-50 pb-2">
                            <span className="text-stone-500">Status</span>
                            <span className="font-medium text-emerald-600 capitalize">{payment.status}</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-50 pb-2">
                            <span className="text-stone-500">Currency</span>
                            <span>{payment.currency}</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-50 pb-2">
                            <span className="text-stone-500">Date</span>
                            <span>{new Date(payment.date).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 space-y-6">
                    <h3 className="font-medium text-midnight flex items-center gap-2">
                        <ShoppingBag size={20} className="text-ruvera-gold" />
                        Related Order
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-midnight">Order #{payment.orderId}</p>
                            <p className="text-sm text-stone-500">View order details for items and shipping.</p>
                        </div>
                        <Link
                            to={`/orders/${payment.orderId}`}
                            className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors"
                        >
                            View Order
                        </Link>
                    </div>
                </div>

                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-stone-100 space-y-4">
                    <h3 className="font-medium text-midnight flex items-center gap-2">
                        <Code size={20} className="text-ruvera-gold" />
                        Gateway Response
                    </h3>
                    <div className="bg-stone-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-xs text-green-400 font-mono">
                            {JSON.stringify(payment.response, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
