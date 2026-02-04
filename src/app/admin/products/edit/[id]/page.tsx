'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProductById, updateProduct, RDProduct } from '@/lib/rd-products';
import RDProductForm from '@/components/RDProductForm';

export default function EditRDProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState<RDProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

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
            await updateProduct(id, data);
            router.push('/admin/products');
        } catch (error: any) {
            console.error('Failed to update product:', error);
            alert(`Error: ${error.message || 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading product data...</div>;

    return (
        <RDProductForm
            key={product?.id}
            title="Update Product Information"
            initialData={product}
            onSubmit={handleSubmit}
            loading={saving}
        />
    );
}
