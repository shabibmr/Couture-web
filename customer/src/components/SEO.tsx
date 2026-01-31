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
    const defaultImage = '/logo.png'; // Assuming there is a default logo or we can use a placeholder if not
    const siteUrl = 'https://ruvera-couture.web.app'; // Replace with actual domain when known, or dynamic

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{`${title} | ${siteTitle}`}</title>
            <meta name='description' content={description} />
            {keywords && <meta name='keywords' content={keywords} />}

            {/* Facebook tags */}
            <meta property='og:type' content={type} />
            <meta property='og:title' content={title} />
            <meta property='og:description' content={description} />
            {image && <meta property='og:image' content={image} />}
            {/* <meta property='og:image' content={image || defaultImage} /> */}
            {url && <meta property='og:url' content={url} />}

            {/* Twitter tags */}
            <meta name='twitter:creator' content={siteTitle} />
            <meta name='twitter:card' content={type === 'article' ? 'summary_large_image' : 'summary'} />
            <meta name='twitter:title' content={title} />
            <meta name='twitter:description' content={description} />
            {image && <meta name='twitter:image' content={image} />}
        </Helmet>
    );
};

export default SEO;
