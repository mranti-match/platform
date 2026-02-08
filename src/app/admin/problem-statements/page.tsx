'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllProblemStatements, deleteProblemStatement, ProblemStatement } from '@/lib/problem-statements';
import { useAdmin } from '../components/AdminProvider';
import { useToast } from '@/app/admin/components/ToastProvider';
import styles from '../admin.module.css';

export default function ProblemStatementsPage() {
    const { user, role } = useAdmin();
    const { showToast } = useToast();
    const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const isAdmin = role === 'Admin' || role === 'Super Admin';

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user, role]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllProblemStatements(isAdmin, user?.uid);
            setProblemStatements(data);
        } catch (error) {
            console.error('Failed to load problem statements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                await deleteProblemStatement(id);
                setProblemStatements(prev => prev.filter(item => item.id !== id));
                showToast('Problem statement deleted', 'info');
            } catch (error) {
                showToast('Failed to delete problem statement', 'error');
            }
        }
    };

    // Filter problem statements based on search
    const filteredStatements = problemStatements.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sector.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.mainCol}>
            <section className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <h1>Problem Statements</h1>
                    <p>{isAdmin ? 'Manage industry challenges and corporate problem statements.' : 'Register and manage your industry problem statements to find matching solutions.'}</p>
                </div>
                <Link href="/admin/problem-statements/new" className={styles.btnNewPost}>
                    <span>+</span> New Statement
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
                    <h2 style={{ margin: 0 }}>{isAdmin ? 'All Problem Statements' : 'My Problem Statements'}</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input
                            type="text"
                            placeholder="Search by title, org, or sector..."
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
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>TITLE</th>
                                    <th>ORGANIZATION</th>
                                    <th>SECTOR</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStatements.map((item) => (
                                    <tr key={item.id}>
                                        <td className={styles.postTitleCell} style={{ fontWeight: 600 }}>{item.title}</td>
                                        <td>{item.organization}</td>
                                        <td>
                                            <span className={styles.tagBadge}>
                                                {item.sector}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: item.status === 'Open' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: item.status === 'Open' ? '#22c55e' : '#ef4444'
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <Link href={`/admin/problem-statements/match/${item.id}`} style={{
                                                    color: 'var(--primary)',
                                                    fontWeight: 700,
                                                    padding: '4px 8px',
                                                    background: 'rgba(217, 70, 239, 0.1)',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem'
                                                }}>AI Match</Link>
                                                <span style={{ color: 'var(--border)' }}>|</span>
                                                <Link href={`/admin/problem-statements/edit/${item.id}`} style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>Edit</Link>
                                                <span style={{ color: 'var(--border)' }}>|</span>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.title)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStatements.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                                            {searchQuery ? `No problem statements matching "${searchQuery}"` : 'No problem statements found.'}
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
