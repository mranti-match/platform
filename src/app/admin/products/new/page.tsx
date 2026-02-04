'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/lib/rd-products';
import { useAdmin } from '../../components/AdminProvider';
import RDProductForm from '@/components/RDProductForm';

export default function NewRDProductPage() {
    const { user } = useAdmin();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        if (!user) return;
        setLoading(true);
        try {
            await createProduct({
                ...data,
                owner_id: user.uid
            });
            router.push('/admin/products');
        } catch (error: any) {
            console.error('Failed to register product:', error);
            alert(`Error: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <RDProductForm
            title="Register R&D Product"
            onSubmit={handleSubmit}
            loading={loading}
        />
    );
}
