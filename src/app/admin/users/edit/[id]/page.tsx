'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUserById, updateAppUser, AppUser } from '@/lib/users';
import { useToast } from '@/app/admin/components/ToastProvider';
import UserForm from '@/components/UserForm';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getUserById(id);
                if (data) {
                    setUser(data);
                } else {
                    showToast('User not found', 'error');
                    router.push('/admin/users');
                }
            } catch (error) {
                console.error('Failed to load user:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, router]);

    const handleSubmit = async (data: Omit<AppUser, 'id' | 'createdAt'>) => {
        setSaving(true);
        try {
            await updateAppUser(id, data);
            showToast('User updated successfully!', 'success');
            router.push('/admin/users');
            router.refresh();
        } catch (error: any) {
            console.error('Failed to update user:', error);
            showToast(error.message || 'Failed to update user', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading stakeholder data...</div>;

    return (
        <UserForm
            key={user?.id}
            title="Edit User Profile"
            initialData={user}
            onSubmit={handleSubmit}
            loading={saving}
        />
    );
}
