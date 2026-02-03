import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
    title: 'Checkout | Ruvéra Couture',
    description: 'Securely complete your purchase at Ruvéra Couture.',
};

export default function CheckoutPage() {
    return <CheckoutClient />;
}
