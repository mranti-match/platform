'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProblemStatement, ProblemStatement } from '@/lib/problem-statements';
import ProblemStatementForm from '@/components/ProblemStatementForm';
import { useAdmin } from '@/app/admin/components/AdminProvider';
import { useToast } from '@/app/admin/components/ToastProvider';

export default function NewProblemStatementPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user } = useAdmin();
    const { showToast } = useToast();

    const handleSubmit = async (data: Omit<ProblemStatement, 'id' | 'createdAt'>) => {
        if (!user) return;
        setLoading(true);
        try {
            await createProblemStatement({
                ...data,
                owner_id: user.uid
            });
            showToast('Problem statement created successfully!', 'success');
            router.push('/admin/problem-statements');
            router.refresh();
        } catch (error: any) {
            console.error('Failed to create problem statement:', error);
            showToast(error.message || 'Failed to create problem statement', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProblemStatementForm
            title="Add New Problem Statement"
            onSubmit={handleSubmit}
            loading={loading}
        />
    );
}
