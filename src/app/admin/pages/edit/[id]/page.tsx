'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getPageById, updatePage, StaticPage } from '@/lib/pages';
import PageForm from '@/components/PageForm';

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [page, setPage] = useState<StaticPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function loadPage() {
            try {
                const data = await getPageById(id);
                if (data) {
                    setPage(data);
                } else {
                    alert('Page not found');
                    router.push('/admin/pages');
                }
            } catch (error) {
                console.error('Failed to load page:', error);
            } finally {
                setLoading(false);
            }
        }
        loadPage();
    }, [id, router]);

    const handleSubmit = async (data: Omit<StaticPage, 'id' | 'createdAt'>) => {
        setSaving(true);
        try {
            await updatePage(id, data);
            router.push('/admin/pages');
            router.refresh();
        } catch (error) {
            console.error('Failed to update page:', error);
            alert('Error updating page.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading page data...</div>;

    return (
        <PageForm
            key={page?.id}
            title="Edit Page"
            initialData={page}
            onSubmit={handleSubmit}
            loading={saving}
        />
    );
}
