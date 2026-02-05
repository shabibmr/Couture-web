import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    image,
    url,
    type = 'website'
}) => {
    const siteTitle = 'Ruvera Couture';
    const siteUrl = 'https://ruveracouture.com';
    const defaultImage = `${siteUrl}/logo.webp`;

    // Convert relative image URLs to absolute URLs
    const seoImage = image
        ? (image.startsWith('http') ? image : `${siteUrl}${image.startsWith('/') ? image : '/' + image}`)
        : defaultImage;

    // Get current URL if not provided
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : siteUrl);

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{`${title} | ${siteTitle}`}</title>
            <meta name='description' content={description} />
            {keywords && <meta name='keywords' content={keywords} />}

            {/* Facebook/Open Graph tags */}
            <meta property='og:site_name' content={siteTitle} />
            <meta property='og:type' content={type} />
            <meta property='og:title' content={`${title} | ${siteTitle}`} />
            <meta property='og:description' content={description} />
            <meta property='og:image' content={seoImage} />
            <meta property='og:image:secure_url' content={seoImage} />
            <meta property='og:image:alt' content={title} />
            <meta property='og:url' content={currentUrl} />

            {/* Twitter tags */}
            <meta name='twitter:site' content='@ruveracouture' />
            <meta name='twitter:creator' content='@ruveracouture' />
            <meta name='twitter:card' content={type === 'article' || image ? 'summary_large_image' : 'summary'} />
            <meta name='twitter:title' content={`${title} | ${siteTitle}`} />
            <meta name='twitter:description' content={description} />
            <meta name='twitter:image' content={seoImage} />
            <meta name='twitter:image:alt' content={title} />
        </Helmet>
    );
};

export default SEO;
