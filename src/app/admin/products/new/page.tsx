'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/lib/rd-products';
import { useAdmin } from '@/app/admin/components/AdminProvider';
import { useToast } from '@/app/admin/components/ToastProvider';
import RDProductForm from '@/components/RDProductForm';

export default function NewRDProductPage() {
    const { user } = useAdmin();
    const { showToast } = useToast();
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
            showToast('Product registered successfully!', 'success');
            router.push('/admin/products');
        } catch (error: any) {
            console.error('Failed to register product:', error);
            showToast(error.message || 'Failed to register product', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div style={{ padding: '2rem' }}>Loading permissions...</div>;

    return (
        <RDProductForm
            title="Register Your R&D Product"
            userId={user.uid}
            onSubmit={handleSubmit}
            loading={loading}
        />
    );
}
