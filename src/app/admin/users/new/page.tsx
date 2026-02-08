'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAppUser, AppUser } from '@/lib/users';
import { useToast } from '@/app/admin/components/ToastProvider';
import UserForm from '@/components/UserForm';

export default function NewUserPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    const handleSubmit = async (data: Omit<AppUser, 'id' | 'createdAt'>) => {
        setLoading(true);
        try {
            await createAppUser(data);
            showToast('User registered successfully!', 'success');
            router.push('/admin/users');
            router.refresh();
        } catch (error: any) {
            console.error('Failed to create user:', error);
            showToast(error.message || 'Failed to create user', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserForm
            title="Register New User"
            onSubmit={handleSubmit}
            loading={loading}
        />
    );
}
