import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Package, CreditCard, RefreshCw, Truck, HelpCircle } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    category: string;
    icon: React.ElementType;
    faqs: FAQItem[];
}

const FAQPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const faqData: FAQCategory[] = [
        {
            category: 'Orders & Shipping',
            icon: Truck,
            faqs: [
                {
                    question: 'How long does shipping take?',
                    answer: 'Standard shipping typically takes 5-7 business days within India. Express shipping is available for 2-3 business days delivery. International shipping varies by location (10-15 business days).'
                },
                {
                    question: 'Do you offer international shipping?',
                    answer: 'Yes! We ship to most countries worldwide. Shipping costs and delivery times vary by destination. All customs duties and taxes are the responsibility of the recipient.'
                },
                {
                    question: 'How can I track my order?',
                    answer: 'Once your order ships, you'll receive a tracking number via email.You can also track your order by logging into your account and viewing your order history.'
                },
                {
                    question: 'Can I change my shipping address after placing an order?',
                    answer: 'If your order hasn't been shipped yet, contact us immediately at info@ruveracouture.com and we'll update your address. Once shipped, we cannot modify the delivery address.'
                }
    ]
},
    {
        category: 'Returns & Exchanges',
        icon: RefreshCw,
        faqs: [
            {
                question: 'What is your return policy?',
                answer: 'We accept returns within 14 days of delivery for unworn, unwashed items with original tags attached. The item must be in its original condition and packaging.'
                },
            {
                question: 'How do I initiate a return?',
                answer: 'Log into your account, go to Order History, select the item you wish to return, and follow the return instructions. You'll receive a prepaid return label via email.'
                },
            {
                question: 'When will I receive my refund?',
                answer: 'Refunds are processed within 5-7 business days after we receive and inspect your returned item. The refund will be credited to your original payment method.'
                },
            {
                question: 'Can I exchange an item?',
                answer: 'Yes! If you need a different size or color, please initiate a return and place a new order for the item you want. This ensures faster processing.'
                }
        ]
    },
    {
        category: 'Payments',
        icon: CreditCard,
        faqs: [
            {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit/debit cards (Visa, Mastercard, American Express), UPI, net banking, and digital wallets through our secure Razorpay payment gateway.'
                },
            {
                question: 'Is it safe to use my credit card on your site?',
                answer: 'Absolutely! All transactions are encrypted using industry-standard SSL technology. We never store your payment information on our servers.'
                },
            {
                question: 'Do you offer Cash on Delivery (COD)?',
                answer: 'Currently, we do not offer Cash on Delivery. All orders must be prepaid through our secure payment gateway.'
                },
            {
                question: 'Can I use multiple payment methods for one order?',
                answer: 'At this time, we only support one payment method per order. You cannot split payment across different methods.'
                }
        ]
    },
    {
        category: 'Products',
        icon: Package,
        faqs: [
            {
                question: 'How do I choose the right size?',
                answer: 'Each product page has a detailed size chart. We recommend measuring yourself and comparing with our size guide. If you're between sizes, we suggest sizing up for a more comfortable fit.'
                },
            {
                question: 'Are your products handmade?',
                answer: 'Yes! Many of our pieces feature hand-embroidered details and are crafted by skilled artisans. This means each piece is unique and may have slight variations.'
                },
            {
                question: 'How should I care for my garments?',
                answer: 'Care instructions are provided on the product label. Generally, we recommend dry cleaning for embellished items and gentle hand washing for delicate fabrics. Avoid direct sunlight when drying.'
                },
            {
                question: 'When will out-of-stock items be restocked?',
                answer: 'Restock dates vary by product. You can sign up for email notifications on the product page to be alerted when an item is back in stock.'
                }
        ]
    },
    {
        category: 'Account & General',
        icon: HelpCircle,
        faqs: [
            {
                question: 'Do I need an account to place an order?',
                answer: 'While you can browse our collection without an account, creating one makes checkout faster and allows you to track orders, save addresses, and manage your wishlist.'
                },
            {
                question: 'How do I reset my password?',
                answer: 'Click on "Forgot Password" on the login page, enter your email address, and we'll send you instructions to reset your password.'
                },
            {
                question: 'Can I cancel my order?',
                answer: 'Orders can be cancelled within 24 hours of placement if they haven't been shipped.Contact us immediately at info@ruveracouture.com to request cancellation.'
                },
{
    question: 'How can I contact customer support?',
        answer: 'You can reach us via email at info@ruveracouture.com, call us at +91 98765 43210, or use the contact form on our Contact page. We typically respond within 24 hours.'
}
            ]
        }
    ];

const toggleFAQ = (categoryIndex: number, faqIndex: number) => {
    const key = `${categoryIndex}-${faqIndex}`;
    setOpenIndex(openIndex === key ? null : key);
};

return (
    <div className="bg-beige-bg min-h-screen pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <h1 className="font-serif text-5xl text-midnight mb-4">Frequently Asked Questions</h1>
                <p className="text-stone-500 font-light max-w-2xl mx-auto">
                    Find answers to common questions about orders, shipping, returns, and more.
                </p>
            </motion.div>

            {/* FAQ Categories */}
            <div className="space-y-8">
                {faqData.map((category, catIndex) => (
                    <motion.div
                        key={catIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: catIndex * 0.1 }}
                        className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden"
                    >
                        {/* Category Header */}
                        <div className="bg-stone-50 p-6 border-b border-stone-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-ruvera-gold/10 rounded-full flex items-center justify-center">
                                    <category.icon className="text-ruvera-gold" size={20} />
                                </div>
                                <h2 className="font-serif text-2xl text-midnight">{category.category}</h2>
                            </div>
                        </div>

                        {/* FAQ Items */}
                        <div className="divide-y divide-stone-100">
                            {category.faqs.map((faq, faqIndex) => {
                                const key = `${catIndex}-${faqIndex}`;
                                const isOpen = openIndex === key;

                                return (
                                    <div key={faqIndex}>
                                        <button
                                            onClick={() => toggleFAQ(catIndex, faqIndex)}
                                            className="w-full px-6 py-5 flex justify-between items-center hover:bg-stone-50 transition-colors text-left"
                                        >
                                            <span className="font-medium text-midnight pr-4">
                                                {faq.question}
                                            </span>
                                            <ChevronDown
                                                className={`flex-shrink-0 text-stone-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                                                    }`}
                                                size={20}
                                            />
                                        </button>
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-6 pb-5 text-stone-600 font-light leading-relaxed">
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Still have questions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-16 bg-gradient-to-br from-ruvera-gold/5 to-stone-100 p-10 rounded-xl text-center"
            >
                <h3 className="font-serif text-2xl text-midnight mb-3">Still have questions?</h3>
                <p className="text-stone-600 font-light mb-6">
                    Can't find the answer you're looking for? Please chat with our friendly team.
                </p>
                <a
                    href="/contact"
                    className="inline-block px-8 py-3 bg-ruvera-gold text-white rounded-lg font-medium uppercase tracking-widest hover:bg-midnight transition-colors"
                >
                    Contact Support
                </a>
            </motion.div>
        </div>
    </div>
);
};

export default FAQPage;
