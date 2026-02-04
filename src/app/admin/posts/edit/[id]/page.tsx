'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getPostById, updatePost, BlogPost } from '@/lib/posts';
import PostForm from '@/components/PostForm';
import { useAdmin } from '../../../components/AdminProvider';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { role, loading: authLoading } = useAdmin();
    const { id } = use(params);
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && role !== 'Super Admin') {
            router.push('/admin');
            return;
        }

        async function loadPost() {
            if (authLoading) return;
            try {
                const data = await getPostById(id);
                if (data) {
                    setPost(data);
                } else {
                    alert('Insight not found');
                    router.push('/admin/posts');
                }
            } catch (error) {
                console.error('Failed to load insight:', error);
            } finally {
                setLoading(false);
            }
        }
        loadPost();
    }, [id, router]);

    const handleSubmit = async (data: Omit<BlogPost, 'id' | 'createdAt'>) => {
        setSaving(true);
        try {
            await updatePost(id, data);
            router.push('/admin/posts');
            router.refresh();
        } catch (error: any) {
            console.error('Failed to update insight:', error);
            alert(`Error updating insight: ${error.message || 'Unknown error'}. Check browser console for details.`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading insight data...</div>;

    // Use the 'key' prop to force PostForm to re-initialize its internal state
    // when the 'post' data changes (i.e., after it's fetched).
    // This is a common pattern when a child component's internal state
    // needs to be reset based on asynchronously loaded props.
    return (
        <PostForm
            key={post?.id}
            title="Edit Insight"
            initialData={post}
            onSubmit={handleSubmit}
            loading={saving}
        />
    );
}
