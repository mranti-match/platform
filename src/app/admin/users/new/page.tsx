'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAppUser, AppUser } from '@/lib/users';
import UserForm from '@/components/UserForm';

export default function NewUserPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (data: Omit<AppUser, 'id' | 'createdAt'>) => {
        setLoading(true);
        try {
            await createAppUser(data);
            router.push('/admin/users');
            router.refresh();
        } catch (error: any) {
            console.error('Failed to create user:', error);
            alert(`Error: ${error.message || 'Unknown error'}`);
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
