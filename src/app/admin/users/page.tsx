'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllUsers, deleteAppUser, AppUser } from '@/lib/users';
import { useToast } from '@/app/admin/components/ToastProvider';
import styles from '../admin.module.css';
import Modal from '@/components/Modal';
import modalStyles from '@/components/Modal.module.css';

export default function UsersPage() {
    const { showToast } = useToast();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; userId: string; userName: string }>({
        isOpen: false,
        userId: '',
        userName: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();

            // Role-based sorting
            const roleOrder = { 'Super Admin': 0, 'Admin': 1, 'User': 2 };
            const sortedData = [...data].sort((a, b) => {
                const orderA = roleOrder[a.role as keyof typeof roleOrder] ?? 99;
                const orderB = roleOrder[b.role as keyof typeof roleOrder] ?? 99;
                return orderA - orderB;
            });

            setUsers(sortedData);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const { userId } = confirmDelete;
        if (!userId) return;

        try {
            await deleteAppUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            showToast('Stakeholder and all related data removed', 'info');
            setConfirmDelete({ isOpen: false, userId: '', userName: '' });
        } catch (error) {
            showToast('Failed to delete user', 'error');
        }
    };

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.mainCol}>
            <section className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <h1>Users</h1>
                    <p>Manage system stakeholders, researchers, and administrators.</p>
                </div>
                <Link href="/admin/users/new" className={styles.btnNewPost}>
                    <span>+</span> New User
                </Link>
            </section>

            <section className={styles.contentCard}>
                <div className={styles.cardHeader} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <h2 style={{ margin: 0 }}>Registered Stakeholders</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.6rem 1rem 0.6rem 2.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                background: 'var(--surface-highlight)',
                                color: 'white',
                                fontSize: '0.875rem'
                            }}
                        />
                        <svg
                            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                </div>
                <div className={styles.tableContainer}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>USER / EMAIL</th>
                                    <th>ORGANIZATION</th>
                                    <th>ROLE</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className={styles.postTitleCell}>
                                            <div style={{ fontWeight: 600 }}>{user.displayName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{user.email}</div>
                                        </td>
                                        <td style={{ fontSize: '0.875rem' }}>{user.organization || '—'}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                background: user.role === 'Super Admin' ? 'var(--primary-glow)' : (user.role === 'Admin' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)'),
                                                color: user.role === 'Super Admin' ? 'white' : (user.role === 'Admin' ? '#3b82f6' : 'var(--foreground-muted)'),
                                                border: user.role === 'Super Admin' ? 'none' : '1px solid currentColor'
                                            }}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: user.active ? '#22c55e' : '#ef4444',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.3rem'
                                            }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                                                {user.active ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Link href={`/admin/users/edit/${user.id}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>Edit</Link>
                                                <span style={{ color: 'var(--border)' }}>|</span>
                                                <button
                                                    onClick={() => setConfirmDelete({ isOpen: true, userId: user.id, userName: user.displayName })}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                                            {searchQuery ? `No users matching "${searchQuery}"` : 'No stakeholders found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            <Modal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, userId: '', userName: '' })}
                title="Confirm Deletion"
                footer={(
                    <>
                        <button
                            className={modalStyles.secondaryBtn}
                            onClick={() => setConfirmDelete({ isOpen: false, userId: '', userName: '' })}
                        >
                            Cancel
                        </button>
                        <button
                            className={modalStyles.dangerBtn}
                            onClick={handleDelete}
                        >
                            Delete Stakeholder
                        </button>
                    </>
                )}
            >
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        color: '#ef4444'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6m4-6v6" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--foreground)', marginBottom: '1rem' }}>Remove "{confirmDelete.userName}"?</h3>
                    <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.6' }}>
                        This action will <strong>permanently delete</strong> this stakeholder profile along with all their registered products, collaborations, and media records.
                    </p>
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 600, marginTop: '1rem' }}>
                        This action cannot be undone.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
