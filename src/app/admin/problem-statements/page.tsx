'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllProblemStatements, deleteProblemStatement, ProblemStatement } from '@/lib/problem-statements';
import styles from '../admin.module.css';

export default function ProblemStatementsPage() {
    const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllProblemStatements();
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
            } catch (error) {
                alert('Failed to delete problem statement');
            }
        }
    };

    return (
        <div className={styles.mainCol}>
            <section className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <h1>Problem Statements</h1>
                    <p>Manage industry challenges and corporate problem statements.</p>
                </div>
                <Link href="/admin/problem-statements/new" className={styles.btnNewPost}>
                    <span>+</span> New Statement
                </Link>
            </section>

            <section className={styles.contentCard}>
                <div className={styles.cardHeader}>
                    <h2>All Problem Statements</h2>
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
                                {problemStatements.map((item) => (
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
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Link href={`/admin/problem-statements/edit/${item.id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>Edit</Link>
                                                <span style={{ color: 'var(--border)' }}>|</span>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.title)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {problemStatements.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                                            No problem statements found. <Link href="/admin/problem-statements/new" style={{ color: 'var(--primary)' }}>Create the first one.</Link>
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
