'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProblemStatement, ProblemStatement } from '@/lib/problem-statements';
import ProblemStatementForm from '@/components/ProblemStatementForm';

export default function NewProblemStatementPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (data: Omit<ProblemStatement, 'id' | 'createdAt'>) => {
        setLoading(true);
        try {
            await createProblemStatement(data);
            router.push('/admin/problem-statements');
            router.refresh();
        } catch (error: any) {
            console.error('Failed to create problem statement:', error);
            alert(`Error: ${error.message || 'Unknown error'}`);
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
