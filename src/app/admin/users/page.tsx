'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllUsers, deleteAppUser, AppUser } from '@/lib/users';
import styles from '../admin.module.css';

export default function UsersPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to remove user "${name}"? This action only removes their system profile metadata.`)) {
            try {
                await deleteAppUser(id);
                setUsers(prev => prev.filter(u => u.id !== id));
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

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
                <div className={styles.cardHeader}>
                    <h2>Registered Stakeholders</h2>
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
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className={styles.postTitleCell}>
                                            <div style={{ fontWeight: 600 }}>{user.displayName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{user.email}</div>
                                        </td>
                                        <td>{user.organization || '—'}</td>
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
                                                <Link href={`/admin/users/edit/${user.id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>Edit</Link>
                                                <span style={{ color: 'var(--border)' }}>|</span>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.displayName)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                                            No stakeholders found. <Link href="/admin/users/new" style={{ color: 'var(--primary)' }}>Add a user manually.</Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </div>
    );
}
