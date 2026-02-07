import React, { useEffect } from 'react';

const PrivacyPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pt-32 pb-16 px-6 bg-beige-bg min-h-screen">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-8 text-center">Privacy Policy</h1>

                <div className="prose prose-stone max-w-none text-stone-600 font-light space-y-6">
                    <p>
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <section>
                        <h2 className="text-xl font-medium text-stone-800 mb-3">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
                            This may include your name, email address, shipping address, and payment information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-stone-800 mb-3">2. How We Use Your Information</h2>
                        <p>
                            We use your information to process your orders, communicate with you, improve our services, and detect and prevent fraud.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-stone-800 mb-3">3. Sharing of Information</h2>
                        <p>
                            We do not sell or rent your personal information to third parties. We may share your information with service providers who help us operate our business, such as payment processors and shipping partners.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-stone-800 mb-3">4. Security</h2>
                        <p>
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-stone-800 mb-3">5. Cookies</h2>
                        <p>
                            We use cookies to improve your experience on our website. You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-stone-800 mb-3">6. Your Rights</h2>
                        <p>
                            Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-stone-800 mb-3">7. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at privacy@ruveracouture.com.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
