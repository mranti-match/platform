'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '../components/AdminProvider';
import { useToast } from '../components/ToastProvider';
import { updateAppUser, requestPasswordReset } from '@/lib/users';
import { updatePassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { uploadFile } from '@/lib/storage';
import styles from '../admin.module.css';

export default function ProfilePage() {
    const { user, role, profile, loading, refreshProfile } = useAdmin();
    const { showToast } = useToast();
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Detect if user is a Google Auth user
    const isGoogleUser = user?.providerData.some(p => p.providerId === 'google.com');

    // User Info State
    const [displayName, setDisplayName] = useState('');
    const [organization, setOrganization] = useState('');
    const [designation, setDesignation] = useState('');
    const [position, setPosition] = useState('');
    const [department, setDepartment] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bio, setBio] = useState('');
    const [photoURL, setPhotoURL] = useState('');

    // Password Change State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showRescueConfirm, setShowRescueConfirm] = useState(false);

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.fullName || profile.displayName || '');
            setOrganization(profile.organization || '');
            setDesignation(profile.designation || '');
            setPosition(profile.position || '');
            setDepartment(profile.department || '');
            setPhoneNumber(profile.phoneNumber || '');
            setBio(profile.bio || '');
            setPhotoURL(profile.photoURL || '');
        }
    }, [profile]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.id) return;

        setSaving(true);
        try {
            // 1. Update Password if fields are filled
            if (newPassword || confirmPassword) {
                if (newPassword !== confirmPassword) {
                    showToast('Passwords do not match', 'error');
                    setSaving(false);
                    return;
                }
                if (newPassword.length < 6) {
                    showToast('Password must be at least 6 characters', 'error');
                    setSaving(false);
                    return;
                }
                if (auth.currentUser) {
                    try {
                        await updatePassword(auth.currentUser, newPassword);
                        showToast('Password updated successfully', 'success');
                    } catch (err: any) {
                        if (err.code === 'auth/requires-recent-login') {
                            showToast('Session expired. Please re-login to update your password.', 'error', 'Security Check');
                            setSaving(false);
                            return;
                        }
                        throw err;
                    }
                }
            }

            // 2. Update Firestore
            await updateAppUser(profile.id, {
                displayName,
                fullName: displayName,
                organization,
                designation,
                position,
                department,
                phoneNumber,
                bio,
                photoURL
            });

            // 3. Update Auth Profile
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: displayName,
                    photoURL: photoURL
                });
            }

            // 4. Refresh Global State
            await refreshProfile();

            setEditMode(false);
            setNewPassword('');
            setConfirmPassword('');
            showToast('Profile updated successfully!', 'success');
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            showToast(error.message || 'Failed to update profile', 'error', 'Update Error');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.uid) return;

        // 10MB limit
        if (file.size > 10 * 1024 * 1024) {
            showToast('Photo exceeds 10MB limit.', 'error');
            return;
        }

        setUploading(true);
        try {
            const path = `users/${user.uid}/profiles`;
            const downloadUrl = await uploadFile(file, path);
            setPhotoURL(downloadUrl);
            showToast('Photo uploaded successfully! Save changes to finalize.', 'info');
        } catch (error) {
            console.error('Photo upload failed:', error);
            showToast('Failed to upload photo.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleResetViaEmail = async () => {
        if (!user?.email) return;
        try {
            await requestPasswordReset(user.email);
            showToast(`A password reset link has been sent to ${user.email}`, 'success', 'Email Sent');
            setShowRescueConfirm(false);
        } catch (err: any) {
            showToast(err.message || 'Failed to send reset link', 'error');
        }
    };


    if (loading) return <div style={{ padding: '2rem' }}>Loading profile...</div>;

    return (
        <div className={styles.mainCol}>
            <section className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                background: 'var(--surface)',
                                border: '2px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {photoURL ? (
                                    <img src={photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                )}
                            </div>
                            {editMode && (
                                <label style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: '2px solid var(--background)',
                                    color: 'white'
                                }}>
                                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} disabled={uploading} />
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                </label>
                            )}
                        </div>
                        <div>
                            <h1>{profile?.fullName || profile?.displayName || 'My Profile'}</h1>
                            <p>{isGoogleUser ? 'Authenticated via Google' : 'Account settings & personal information'}</p>
                        </div>
                    </div>
                </div>
                {!editMode && (
                    <button onClick={() => setEditMode(true)} className={styles.btnNewPost}>
                        Edit Profile
                    </button>
                )}
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: editMode ? '1.5fr 1fr' : '1fr', gap: '2rem' }}>
                {/* Information Card */}
                <div className={styles.contentCard}>
                    <div className={styles.cardHeader}>
                        <h2>Account Information</h2>
                    </div>
                    <div style={{ padding: '2rem' }}>
                        <form onSubmit={handleSaveProfile}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Designation / Title</label>
                                    {editMode ? (
                                        <select
                                            value={designation}
                                            onChange={(e) => setDesignation(e.target.value)}
                                            className={styles.input}
                                            style={{ width: '100%', background: 'var(--surface)' }}
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
                                    ) : (
                                        <div style={{ fontSize: '1rem', fontWeight: 600 }}>{profile?.designation || 'Not set'}</div>
                                    )}
                                </div>
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
                                        <div style={{ fontSize: '1rem', fontWeight: 600 }}>{profile?.fullName || profile?.displayName || 'Not set'}</div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Email Address</label>
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground-muted)' }}>{profile?.email}</div>
                                    <p style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Email cannot be changed.</p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Phone Number</label>
                                    {editMode ? (
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className={styles.input}
                                            style={{ width: '100%', background: 'var(--surface)' }}
                                            placeholder="e.g. +60123456789"
                                        />
                                    ) : (
                                        <div style={{ fontSize: '1rem', fontWeight: 600 }}>{profile?.phoneNumber || 'Not set'}</div>
                                    )}
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
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Job Position</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                            className={styles.input}
                                            style={{ width: '100%', background: 'var(--surface)' }}
                                            placeholder="e.g. Senior Researcher"
                                        />
                                    ) : (
                                        <div style={{ fontSize: '1rem', fontWeight: 600 }}>{profile?.position || 'Not set'}</div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Department</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className={styles.input}
                                            style={{ width: '100%', background: 'var(--surface)' }}
                                            placeholder="e.g. Faculty of Engineering"
                                        />
                                    ) : (
                                        <div style={{ fontSize: '1rem', fontWeight: 600 }}>{profile?.department || 'Not set'}</div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Access Level</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: 'rgba(14, 165, 233, 0.1)',
                                            color: 'var(--primary)',
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

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Short Description / Portfolio</label>
                                {editMode ? (
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className={styles.input}
                                        style={{ width: '100%', background: 'var(--surface)', minHeight: '120px', resize: 'vertical' }}
                                        placeholder="Tell us about yourself, your research interests, or your professional background..."
                                    />
                                ) : (
                                    <div style={{
                                        fontSize: '0.9rem',
                                        lineHeight: '1.6',
                                        color: profile?.bio ? 'var(--foreground)' : 'var(--foreground-muted)',
                                        whiteSpace: 'pre-wrap',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)'
                                    }}>
                                        {profile?.bio || 'No description provided.'}
                                    </div>
                                )}
                            </div>

                            {!isGoogleUser && editMode && (
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--primary)' }}>SECURITY UPDATE (OPTIONAL)</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>New Password</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className={styles.input}
                                                style={{ width: '100%', background: 'var(--surface)' }}
                                                placeholder="Min. 6 characters"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Confirm Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={styles.input}
                                                style={{ width: '100%', background: 'var(--surface)' }}
                                                placeholder="Repeat matching password"
                                            />
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', marginTop: '0.75rem' }}>Leave these blank if you do not wish to change your password.</p>
                                </div>
                            )}

                            {editMode && (
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                    <button type="submit" className={styles.btnPrimary} disabled={saving}>
                                        {saving ? (
                                            <>
                                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>
                                                Saving...
                                            </>
                                        ) : 'Save Changes'}
                                    </button>
                                    <button type="button" onClick={() => setEditMode(false)} className={styles.btnSecondary}>
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Sidebar Cards */}
                {editMode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className={styles.contentCard}>
                            <div className={styles.cardHeader}>
                                <h2>Security Status</h2>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                {isGoogleUser ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '1rem',
                                        background: 'rgba(14, 165, 233, 0.05)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(14, 165, 233, 0.1)'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'rgba(14, 165, 233, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 1rem',
                                            color: 'var(--primary)'
                                        }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                        </div>
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Google Account Sync</h4>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', lineHeight: '1.5' }}>
                                            Credentials managed via Google Security Settings.
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                                            To update your email or if you've lost access, you can trigger a rescue link.
                                        </p>

                                        {!showRescueConfirm ? (
                                            <button
                                                onClick={() => setShowRescueConfirm(true)}
                                                className={styles.btnSecondary}
                                                style={{ width: '100%', fontSize: '0.8rem' }}
                                            >
                                                Send Rescue Email
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
                                                        onClick={handleResetViaEmail}
                                                        className={styles.btnPrimary}
                                                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', background: '#ef4444' }}
                                                    >
                                                        Yes, Send
                                                    </button>
                                                    <button
                                                        onClick={() => setShowRescueConfirm(false)}
                                                        className={styles.btnSecondary}
                                                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
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
                )}
            </div >
        </div >
    );
}
