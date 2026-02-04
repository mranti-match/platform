'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPage, StaticPage } from '@/lib/pages';
import PageForm from '@/components/PageForm';

export default function NewPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (data: Omit<StaticPage, 'id' | 'createdAt'>) => {
        setLoading(true);
        try {
            await createPage(data);
            router.push('/admin/pages');
            router.refresh();
        } catch (error) {
            console.error('Failed to create page:', error);
            alert('Error creating page.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageForm
            title="Add New Page"
            onSubmit={handleSubmit}
            loading={loading}
        />
    );
}
