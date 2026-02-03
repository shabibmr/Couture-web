import React, { Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import ProductDetailClient from '../../../../components/product/ProductDetailClient';
import { API_ENDPOINTS } from '../../../../config/api.config';
import api from '../../../../services/api.service';

type Props = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

// Helper for server-side fetching via axios (api service)
// Since api.service might rely on browser env for token, we ensure it fails gracefully or works for public data
async function getProduct(slug: string) {
    try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug || '');
        const endpoint = isUUID
            ? API_ENDPOINTS.PRODUCTS.BY_ID(slug)
            : API_ENDPOINTS.PRODUCTS.BY_SLUG(slug);

        const res = await api.get(endpoint);
        return res.data;
    } catch (error) {
        console.error('Error fetching product for metadata:', error);
        return null;
    }
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const product = await getProduct(params.id);

    if (!product) {
        return {
            title: 'Product Not Found | Ruvéra Couture',
            description: 'The requested product could not be found.',
        };
    }

    const previousImages = (await parent).openGraph?.images || [];
    const productImage = product.image || product.featured_image;

    return {
        title: `${product.name || product.title} | Ruvéra Couture`,
        description: product.description ? product.description.substring(0, 160) : 'Luxury fashion by Ruvéra Couture.',
        openGraph: {
            title: product.name || product.title,
            description: product.description ? product.description.substring(0, 160) : undefined,
            images: productImage ? [productImage, ...previousImages] : previousImages,
        },
    };
}

export default function ProductPage({ params }: Props) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-beige-bg animate-pulse" />}>
            <ProductDetailClient productId={params.id} />
        </Suspense>
    );
}
