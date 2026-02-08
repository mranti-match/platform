'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProductById, updateProduct, RDProduct } from '@/lib/rd-products';
import RDProductForm from '@/components/RDProductForm';
import { useAdmin } from '@/app/admin/components/AdminProvider';
import { useToast } from '@/app/admin/components/ToastProvider';

export default function EditRDProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAdmin();
    const [product, setProduct] = useState<RDProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getProductById(id);
                if (data) {
                    setProduct(data);
                } else {
                    alert('Product not found');
                    router.push('/admin/products');
                }
            } catch (error) {
                console.error('Failed to load product:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, router]);

    const handleSubmit = async (data: any) => {
        setSaving(true);
        try {
            await updateProduct(id, {
                ...data,
                owner_id: product?.owner_id // Preserve ownership
            });
            showToast('Product updated successfully!', 'success');
            router.push('/admin/products');
        } catch (error: any) {
            console.error('Failed to update product:', error);
            showToast(error.message || 'Failed to update product', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading product data...</div>;

    return (
        <RDProductForm
            key={product?.id}
            title="Update Product Information"
            userId={user?.uid || ''}
            initialData={product}
            onSubmit={handleSubmit}
            loading={saving}
        />
    );
}
