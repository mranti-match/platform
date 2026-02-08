'use client';

import { useState } from 'react';
import { AppUser, UserRole, requestPasswordReset } from '@/lib/users';
import { useToast } from '@/app/admin/components/ToastProvider';
import styles from './PostForm.module.css'; // Reusing base form styles

interface UserFormProps {
    initialData?: AppUser | null;
    onSubmit: (data: Omit<AppUser, 'id' | 'createdAt'>) => Promise<void>;
    loading: boolean;
    title: string;
}

export default function UserForm({ initialData, onSubmit, loading, title }: UserFormProps) {
    const { showToast } = useToast();
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [formData, setFormData] = useState({
        ...initialData,
        email: initialData?.email || '',
        displayName: initialData?.displayName || '',
        fullName: initialData?.fullName || initialData?.displayName || '',
        role: initialData?.role || 'User' as UserRole,
        organization: initialData?.organization || '',
        designation: initialData?.designation || '',
        position: initialData?.position || '',
        department: initialData?.department || '',
        phoneNumber: initialData?.phoneNumber || '',
        bio: initialData?.bio || '',
        active: initialData?.active ?? true,
    } as Omit<AppUser, 'id' | 'createdAt'>);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = {
                ...prev,
                [name]: name === 'active' ? (value === 'true') : value
            };
            // Sync fullName with displayName if it's the displayName being edited
            if (name === 'displayName') {
                next.fullName = value;
            }
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handlePasswordReset = async () => {
        if (!initialData?.email) return;
        try {
            await requestPasswordReset(initialData.email);
            showToast('Password reset email sent successfully!', 'success');
            setShowResetConfirm(false);
        } catch (error: any) {
            showToast(error.message || 'Failed to send reset email', 'error');
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Designation / Title</label>
                                    <select
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    >
                                        <option value="">None</option>
                                        <optgroup label="Royal/Honorable Titles">
                                            <option value="Tun">Tun</option>
                                            <option value="Tan Sri">Tan Sri</option>
                                            <option value="Puan Sri">Puan Sri</option>
                                            <option value="Dato' Sri">Dato' Sri</option>
                                            <option value="Datin Sri">Datin Sri</option>
                                            <option value="Dato'">Dato'</option>
                                            <option value="Datin">Datin</option>
                                            <option value="Datuk">Datuk</option>
                                        </optgroup>
                                        <optgroup label="Professional Titles">
                                            <option value="Prof.">Prof.</option>
                                            <option value="Prof. Madya">Prof. Madya</option>
                                            <option value="Associate Prof.">Associate Prof.</option>
                                            <option value="Dr.">Dr.</option>
                                            <option value="Ir.">Ir. (Engineer)</option>
                                            <option value="Ts.">Ts. (Technologist)</option>
                                            <option value="Ar.">Ar. (Architect)</option>
                                            <option value="Sr.">Sr. (Surveyor)</option>
                                        </optgroup>
                                        <optgroup label="Standard">
                                            <option value="Encik">Encik</option>
                                            <option value="Puan">Puan</option>
                                            <option value="Cik">Cik</option>
                                            <option value="Mr.">Mr.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="Ms.">Ms.</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                        placeholder="e.g. +60123456789"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Job Position</label>
                                    <input
                                        type="text"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                        placeholder="e.g. Senior Researcher"
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                        placeholder="e.g. Faculty of Engineering"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Short Description / Portfolio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', minHeight: '100px', resize: 'vertical' }}
                                    placeholder="Tell us about this user's research interests or professional background..."
                                />
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

                                {!showResetConfirm ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowResetConfirm(true)}
                                        className={styles.btnSaveDraft}
                                        style={{ width: '100%', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                    >
                                        Send Reset Email
                                    </button>
                                ) : (
                                    <div style={{
                                        padding: '1rem',
                                        background: 'rgba(239, 68, 68, 0.05)',
                                        border: '1px solid rgba(239, 68, 68, 0.15)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem'
                                    }}>
                                        <p style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>Confirm sending reset link?</p>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                type="button"
                                                onClick={handlePasswordReset}
                                                className={styles.btnPublish}
                                                style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', background: '#ef4444' }}
                                            >
                                                Yes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowResetConfirm(false)}
                                                className={styles.btnSaveDraft}
                                                style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </form>
    );
}
