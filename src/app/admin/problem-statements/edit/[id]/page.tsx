'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProblemStatementById, updateProblemStatement, ProblemStatement } from '@/lib/problem-statements';
import ProblemStatementForm from '@/components/ProblemStatementForm';
import { useToast } from '@/app/admin/components/ToastProvider';

export default function EditProblemStatementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [item, setItem] = useState<ProblemStatement | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getProblemStatementById(id);
                if (data) {
                    setItem(data);
                } else {
                    showToast('Problem statement not found', 'error');
                    router.push('/admin/problem-statements');
                }
            } catch (error) {
                console.error('Failed to load data:', error);
                showToast('Failed to load problem statement', 'error');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, router]);

    const handleSubmit = async (data: Omit<ProblemStatement, 'id' | 'createdAt'>) => {
        setSaving(true);
        try {
            await updateProblemStatement(id, {
                ...data,
                owner_id: item?.owner_id // Preserve the owner
            });
            showToast('Problem statement updated successfully!', 'success');
            router.push('/admin/problem-statements');
            router.refresh();
        } catch (error: any) {
            console.error('Failed to update:', error);
            showToast(error.message || 'Failed to update problem statement', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

    return (
        <ProblemStatementForm
            key={item?.id}
            title="Edit Problem Statement"
            initialData={item}
            onSubmit={handleSubmit}
            loading={saving}
        />
    );
}
