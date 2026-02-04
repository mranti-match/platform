'use client';

import { useState } from 'react';
import { AppUser, UserRole, requestPasswordReset } from '@/lib/users';
import styles from './PostForm.module.css'; // Reusing base form styles

interface UserFormProps {
    initialData?: AppUser | null;
    onSubmit: (data: Omit<AppUser, 'id' | 'createdAt'>) => Promise<void>;
    loading: boolean;
    title: string;
}

export default function UserForm({ initialData, onSubmit, loading, title }: UserFormProps) {
    const [formData, setFormData] = useState({
        email: initialData?.email || '',
        displayName: initialData?.displayName || '',
        role: initialData?.role || 'User' as UserRole,
        organization: initialData?.organization || '',
        active: initialData?.active ?? true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'active' ? (value === 'true') : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handlePasswordReset = async () => {
        if (!initialData?.email) return;
        try {
            await requestPasswordReset(initialData.email);
            alert('Password reset email sent successfully to ' + initialData.email);
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={styles.header}>
                <h1>{title}</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className={styles.btnPublish} disabled={loading}>
                        {loading ? 'Saving...' : 'Save User'}
                    </button>
                </div>
            </div>

            <div className={styles.formContainer}>
                <div className={styles.mainCol}>
                    <div className={styles.widget} style={{ marginBottom: '2rem' }}>
                        <div className={styles.widgetHeader}>Account Information</div>
                        <div className={styles.widgetBody}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Full Name / Username</label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                        placeholder="e.g. Alex Johnson"
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                        placeholder="e.g. alex@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Organization</label>
                                    <input
                                        type="text"
                                        name="organization"
                                        value={formData.organization}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                        placeholder="e.g. Universiti Tekno"
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Status</label>
                                    <select
                                        name="active"
                                        value={formData.active.toString()}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    >
                                        <option value="true">Active Account</option>
                                        <option value="false">Suspended</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.widget}>
                        <div className={styles.widgetHeader}>Access Control</div>
                        <div className={styles.widgetBody}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Assign Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: '1rem' }}
                                >
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Super Admin">Super Admin</option>
                                </select>
                            </div>
                            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Role Descriptions</div>
                                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>
                                    <li><strong>User</strong>: Regular stakeholder access.</li>
                                    <li><strong>Admin</strong>: Can manage content and products.</li>
                                    <li><strong>Super Admin</strong>: Full access to system and users.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {initialData && (
                        <div className={styles.widget}>
                            <div className={styles.widgetHeader}>Security</div>
                            <div className={styles.widgetBody}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '1rem' }}>
                                    For security reasons, passwords cannot be viewed. You can trigger a secure password reset link for the user.
                                </p>
                                <button
                                    type="button"
                                    onClick={handlePasswordReset}
                                    className={styles.btnSaveDraft}
                                    style={{ width: '100%', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                >
                                    Send Reset Email
                                </button>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </form>
    );
}
