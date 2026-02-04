'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '../components/AdminProvider';
import { updateAppUser, requestPasswordReset } from '@/lib/users';
import { updatePassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import styles from '../admin.module.css';

export default function ProfilePage() {
    const { user, role, profile, loading } = useAdmin();
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

    // User Info State
    const [displayName, setDisplayName] = useState('');
    const [organization, setOrganization] = useState('');

    // Password Change State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passLoading, setPassLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.displayName || '');
            setOrganization(profile.organization || '');
        }
    }, [profile]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.id) return;

        setSaving(true);
        try {
            // 1. Update Firestore
            await updateAppUser(profile.id, {
                displayName,
                organization
            });

            // 2. Update Auth (if possible)
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: displayName
                });
            }

            setEditMode(false);
            alert('Profile updated successfully!');
            window.location.reload(); // Refresh to sync profile
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            alert('Error: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        setPassLoading(true);
        try {
            if (auth.currentUser) {
                await updatePassword(auth.currentUser, newPassword);
                alert('Password changed successfully!');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error: any) {
            console.error('Failed to change password:', error);
            if (error.code === 'auth/requires-recent-login') {
                alert('For security, please log out and log in again before changing your password.');
            } else {
                alert('Error: ' + error.message);
            }
        } finally {
            setPassLoading(false);
        }
    };

    const handleResetViaEmail = async () => {
        if (!user?.email) return;
        try {
            await requestPasswordReset(user.email);
            alert('A password reset link has been sent to ' + user.email);
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading profile...</div>;

    return (
        <div className={styles.mainCol}>
            <section className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <h1>My Profile</h1>
                    <p>Manage your account settings and personal information.</p>
                </div>
                {!editMode && (
                    <button onClick={() => setEditMode(true)} className={styles.btnNewPost}>
                        Edit Profile
                    </button>
                )}
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Information Card */}
                <div className={styles.contentCard}>
                    <div className={styles.cardHeader}>
                        <h2>Account Information</h2>
                    </div>
                    <div style={{ padding: '2rem' }}>
                        <form onSubmit={handleSaveProfile}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Full Name</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className={styles.input}
                                            style={{ width: '100%', background: 'var(--surface)' }}
                                            required
                                        />
                                    ) : (
                                        <div style={{ fontSize: '1rem', fontWeight: 600 }}>{profile?.displayName || 'Not set'}</div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Email Address</label>
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground-muted)' }}>{profile?.email}</div>
                                    <p style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Email cannot be changed.</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Organization</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={organization}
                                            onChange={(e) => setOrganization(e.target.value)}
                                            className={styles.input}
                                            style={{ width: '100%', background: 'var(--surface)' }}
                                            placeholder="Company or University"
                                        />
                                    ) : (
                                        <div style={{ fontSize: '1rem', fontWeight: 600 }}>{profile?.organization || 'Not set'}</div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Access Level</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: 'rgba(34, 197, 94, 0.1)',
                                            color: '#22c55e',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700
                                        }}>
                                            {role}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Role updates require admin approval.</p>
                                </div>
                            </div>

                            {editMode && (
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="submit" className={styles.btnPublish} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button type="button" onClick={() => setEditMode(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--foreground)', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className={styles.contentCard}>
                        <div className={styles.cardHeader}>
                            <h2>Security</h2>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            {editMode ? (
                                <form onSubmit={handleChangePassword}>
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className={styles.input}
                                            style={{ width: '100%', background: 'var(--surface)' }}
                                            placeholder="Min. 6 characters"
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Confirm Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={styles.input}
                                            style={{ width: '100%', background: 'var(--surface)' }}
                                            placeholder="Re-enter password"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className={styles.btnPublish}
                                        style={{ width: '100%', borderRadius: '8px', padding: '0.875rem' }}
                                        disabled={passLoading}
                                    >
                                        {passLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: 'rgba(217, 70, 239, 0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem',
                                        color: 'var(--primary)',
                                        opacity: 0.6
                                    }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', lineHeight: '1.5' }}>
                                        Password controls are locked. Click <strong>Edit Profile</strong> to change your credentials.
                                    </p>
                                </div>
                            )}

                            <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: 600 }}>OR</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                            </div>

                            <button
                                onClick={handleResetViaEmail}
                                style={{
                                    width: '100%',
                                    background: 'none',
                                    border: '1px solid var(--border)',
                                    color: 'var(--foreground)',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                                onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                            >
                                Send Reset Link to Email
                            </button>
                        </div>
                    </div>

                    <div className={styles.contentCard} style={{ background: 'rgba(59, 130, 246, 0.03)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3b82f6', marginBottom: '0.75rem' }}>Security Tip</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', lineHeight: '1.5' }}>
                                Use a strong, unique password to protect your account and the data you've registered on the portal. Change it every few months for better security.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
