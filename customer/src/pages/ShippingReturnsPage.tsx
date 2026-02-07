import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Clock } from 'lucide-react';

const ShippingReturnsPage: React.FC = () => {
    return (
        <div className="pt-24 pb-16 px-6 md:px-12 max-w-[1000px] mx-auto min-h-screen">
            {/* Header */}
            <header className="mb-16 text-center">
                <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6">Shipping & Returns</h1>
                <p className="text-stone-500 font-light max-w-2xl mx-auto">
                    We are committed to ensuring your Ruvéra Couture pieces arrive in pristine condition.
                    Please review our shipping policies and return guidelines below.
                </p>
            </header>

            {/* Main Content Grid */}
            <div className="grid gap-12">

                {/* Shipping Section */}
                <section className="bg-white p-8 md:p-10 shadow-sm border border-stone-100 rounded-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-stone-50 rounded-full">
                            <Truck className="text-ruvera-gold" size={24} strokeWidth={1.5} />
                        </div>
                        <h2 className="font-serif text-2xl text-stone-800">Shipping Policy</h2>
                    </div>

                    <div className="space-y-8 text-stone-600 font-light leading-relaxed">

                        {/* Courier Partners */}
                        <div>
                            <h3 className="font-medium text-stone-900 mb-2 uppercase tracking-wide text-xs">Courier Partners</h3>
                            <p>
                                We have partnered with trusted courier services to ensure reliable delivery of your luxury items.
                                All domestic shipments are handled by <span className="font-medium text-stone-800">DTDC</span> and <span className="font-medium text-stone-800">India Post</span>.
                            </p>
                        </div>

                        {/* Shipping Charges */}
                        <div>
                            <h3 className="font-medium text-stone-900 mb-2 uppercase tracking-wide text-xs">Shipping Charges</h3>
                            <p>
                                A standard shipping fee of <span className="font-medium text-stone-800">Rs. 80.00 per piece</span> applies to all orders.
                                This ensures your garment is carefully packaged and insured during transit.
                            </p>
                        </div>

                        {/* Delivery Timeline */}
                        <div>
                            <h3 className="font-medium text-stone-900 mb-2 uppercase tracking-wide text-xs">Estimated Delivery</h3>
                            <div className="flex gap-4">
                                <Clock size={18} className="text-stone-400 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="mb-2">Your order will be processed within 1-2 business days.</p>
                                    <ul className="list-disc list-inside space-y-1 pl-1">
                                        <li>Metros: 3-5 business days</li>
                                        <li>Rest of India: 5-7 business days</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Returns Section */}
                <section className="bg-white p-8 md:p-10 shadow-sm border border-stone-100 rounded-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-stone-50 rounded-full">
                            <RotateCcw className="text-ruvera-gold" size={24} strokeWidth={1.5} />
                        </div>
                        <h2 className="font-serif text-2xl text-stone-800">Returns & Exchanges</h2>
                    </div>

                    <div className="space-y-6 text-stone-600 font-light leading-relaxed">
                        <p>
                            At Ruvéra Couture, we take great pride in the quality and craftsmanship of our products.
                            However, if you are not completely satisfied with your purchase, we are here to help.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                            <div className="bg-stone-50 p-6 rounded-sm">
                                <h3 className="font-medium text-stone-900 mb-2 text-sm">Return Eligibility</h3>
                                <ul className="list-disc list-inside space-y-2 text-sm">
                                    <li>Items must be returned within 7 days of delivery.</li>
                                    <li>Products must be unused, unwashed, and with original tags attached.</li>
                                    <li>Custom-made or altered items are not eligible for return.</li>
                                </ul>
                            </div>
                            <div className="bg-stone-50 p-6 rounded-sm">
                                <h3 className="font-medium text-stone-900 mb-2 text-sm">Exchange Process</h3>
                                <p className="text-sm">
                                    To initiate an exchange, please contact our concierge team. We will arrange a reverse pickup
                                    from your address. Exchange is subject to availability of the desired size/item.
                                </p>
                            </div>
                        </div>
                        <p className="text-sm italic text-stone-500 mt-4">
                            * Please note that shipping charges are non-refundable.
                        </p>

                    </div>
                </section>

                {/* Guarantee Section */}
                <section className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="p-6">
                        <ShieldCheck className="mx-auto text-stone-400 mb-4" size={32} strokeWidth={1} />
                        <h3 className="font-serif text-lg text-stone-800 mb-2">Secure Shipping</h3>
                        <p className="text-xs text-stone-500">Every package is insured and tracked.</p>
                    </div>
                    <div className="p-6">
                        <RotateCcw className="mx-auto text-stone-400 mb-4" size={32} strokeWidth={1} />
                        <h3 className="font-serif text-lg text-stone-800 mb-2">Easy Returns</h3>
                        <p className="text-xs text-stone-500">Hassle-free return policy for your peace of mind.</p>
                    </div>
                    <div className="p-6">
                        <Clock className="mx-auto text-stone-400 mb-4" size={32} strokeWidth={1} />
                        <h3 className="font-serif text-lg text-stone-800 mb-2">Timely Delivery</h3>
                        <p className="text-xs text-stone-500">Committed to delivering your luxury on time.</p>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default ShippingReturnsPage;
