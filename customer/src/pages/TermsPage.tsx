import React, { useEffect } from 'react';

const TermsPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pt-32 pb-16 px-6 bg-beige-bg min-h-screen">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-8 text-center">Terms of Service</h1>

                <div className="prose prose-stone max-w-none text-stone-600 font-light space-y-6">
                    <p>
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <section>
                        <h2 className="text-xl font-medium text-stone-800 mb-3">1. Introduction</h2>
                        <p>
                            Welcome to Ruvéra Couture. These Terms of Service ("Terms") govern your use of our website and services.
                            By accessing or using our website, you agree to be bound by these Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-stone-800 mb-3">2. Use of Our Service</h2>
                        <p>
                            You must be at least 18 years old to use our service. You agree not to use our service for any illegal or unauthorized purpose.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-stone-800 mb-3">3. Products and Pricing</h2>
                        <p>
                            We aim to describe our products as accurately as possible. However, we do not warrant that product descriptions or other content are accurate, complete, reliable, current, or error-free.
                            Prices for our products are subject to change without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-stone-800 mb-3">4. Intellectual Property</h2>
                        <p>
                            All content included on this site, such as text, graphics, logos, images, and software, is the property of Ruvéra Couture or its content suppliers and protected by international copyright laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-stone-800 mb-3">5. Limitation of Liability</h2>
                        <p>
                            Ruvéra Couture shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-stone-800 mb-3">6. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-stone-800 mb-3">7. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at support@ruveracouture.com.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
