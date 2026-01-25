import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import logger from '../utils/logger';

interface SuccessState {
    orderId: string;
}

const OrderSuccessPage: React.FC = () => {
    const location = useLocation();
    const orderId = (location.state as SuccessState)?.orderId || "RUV-0000";

    React.useEffect(() => {
        logger.info('Page Mounted: OrderSuccessPage', { orderId });
    }, [orderId]);

    return (
        <div className="bg-beige-bg min-h-screen flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-12 rounded-2xl shadow-xl max-w-lg w-full text-center border border-stone-100"
            >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-green-600" />
                </div>

                <h1 className="font-serif text-3xl text-midnight mb-4">Order Confirmed!</h1>
                <p className="text-stone-500 mb-8">
                    Thank you for your purchase. Your order <span className="font-bold text-stone-800">{orderId}</span> has been received.
                </p>

                <div className="space-y-4">
                    <p className="text-xs text-stone-400 uppercase tracking-widest">A confirmation email has been sent.</p>

                    <Link
                        to="/shop"
                        className="inline-flex items-center justify-center gap-2 w-full bg-ruvera-gold text-white py-4 rounded font-medium tracking-widest uppercase hover:bg-midnight transition-colors mt-6"
                    >
                        <ShoppingBag size={18} />
                        Continue Shopping
                    </Link>

                    <Link
                        to={`/orders/${orderId}`}
                        className="inline-block w-full text-center text-xs uppercase tracking-widest text-stone-400 hover:text-midnight transition-colors mt-4"
                    >
                        Track Order Status
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSuccessPage;
