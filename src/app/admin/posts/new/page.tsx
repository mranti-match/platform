'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPost, BlogPost } from '@/lib/posts';
import PostForm from '@/components/PostForm';
import { useAdmin } from '../../components/AdminProvider';

export default function NewPostPage() {
    const { role, loading: authLoading } = useAdmin();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && role !== 'Super Admin') {
            router.push('/admin');
        }
    }, [authLoading, role]);

    const handleSubmit = async (data: Omit<BlogPost, 'id' | 'createdAt'>) => {
        setLoading(true);
        try {
            await createPost(data);
            router.push('/admin/posts');
            router.refresh();
        } catch (error: any) {
            console.error('Failed to create insight:', error);
            alert(`Error creating insight: ${error.message || 'Unknown error'}. Check browser console for details.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PostForm
            title="Create New Insight"
            onSubmit={handleSubmit}
            loading={loading}
        />
    );
}
