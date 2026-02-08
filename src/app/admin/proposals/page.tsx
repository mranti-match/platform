'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '../components/AdminProvider';
import { useToast } from '@/app/admin/components/ToastProvider';
import { getAllProposals, deleteProposal, Proposal } from '@/lib/proposals';
import styles from '../admin.module.css';
import Link from 'next/link';

export default function ProposalsPage() {
    const { user, role, loading: adminLoading } = useAdmin();
    const { showToast } = useToast();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [userNames, setUserNames] = useState<Record<string, string>>({});

    const isAdmin = role === 'Admin' || role === 'Super Admin';

    useEffect(() => {
        if (!adminLoading && user) {
            loadProposals();
            if (isAdmin) {
                loadUserNames();
            }
        }
    }, [user, adminLoading, role]);

    const loadUserNames = async () => {
        try {
            const { getAllUsers } = await import('@/lib/users');
            const users = await getAllUsers();
            const mapping: Record<string, string> = {};
            users.forEach(u => {
                if (u.uid) mapping[u.uid] = u.displayName;
                // Some legacy users might use doc ID as UID
                mapping[u.id] = u.displayName;
            });
            setUserNames(mapping);
        } catch (error) {
            console.error('Failed to load user names:', error);
        }
    };

    const loadProposals = async () => {
        setLoading(true);
        try {
            const data = await getAllProposals(isAdmin, user?.uid);
            setProposals(data);
        } catch (error) {
            console.error('Failed to load proposals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this proposal?')) {
            try {
                await deleteProposal(id);
                setProposals(prev => prev.filter(p => p.id !== id));
                showToast('Proposal withdrawn successfully', 'info');
            } catch (error) {
                showToast('Failed to withdraw proposal', 'error');
            }
        }
    };

    // Filter proposals based on search
    const filteredProposals = proposals.filter(proposal => {
        const title = (proposal.project_title || proposal.product_name || '').toLowerCase();
        const ownerName = (userNames[proposal.owner_id] || '').toLowerCase();
        const ownerEmail = (proposal.owner_email || '').toLowerCase();
        const query = searchQuery.toLowerCase();

        return title.includes(query) || ownerName.includes(query) || ownerEmail.includes(query);
    });

    if (adminLoading) return <div style={{ padding: '2rem' }}>Loading permissions...</div>;

    return (
        <div className={styles.mainCol}>
            <section className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <h1>Collaboration</h1>
                    <p>{isAdmin ? 'Review and manage partnership submissions from stakeholders.' : 'Track the status of your submitted collaboration proposals.'}</p>
                </div>
            </section>

            <section className={styles.contentCard}>
                <div className={styles.cardHeader} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <h2 style={{ margin: 0 }}>Active Collaborations</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input
                            type="text"
                            placeholder="Search projects or owners..."
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
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading proposals...</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>PROPOSAL TITLE</th>
                                    <th style={{ minWidth: '200px' }}>FACILITATION</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProposals.map((proposal) => (
                                    <tr key={proposal.id}>
                                        <td className={styles.postTitleCell}>
                                            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{proposal.project_title || proposal.product_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.25rem' }}>
                                                By: {userNames[proposal.owner_id] || proposal.owner_email || 'Unknown Stakeholder'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {proposal.facilitation.funding && <small style={{ background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>Funding</small>}
                                                {proposal.facilitation.market && <small style={{ background: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>Market</small>}
                                                {proposal.facilitation.capacity && <small style={{ background: '#eab308', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>Capacity</small>}
                                                {proposal.facilitation.sandbox && <small style={{ background: '#a855f7', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>Sandbox</small>}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                background: proposal.status === 'Approved' ? 'rgba(34, 197, 94, 0.1)' : (proposal.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)'),
                                                color: proposal.status === 'Approved' ? '#22c55e' : (proposal.status === 'Rejected' ? '#ef4444' : '#eab308'),
                                            }}>
                                                {proposal.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <Link
                                                    href={`/admin/proposals/${proposal.id}`}
                                                    style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'underline' }}
                                                >
                                                    Detail
                                                </Link>
                                                {!isAdmin && (
                                                    <>
                                                        <span style={{ color: 'var(--border)' }}>|</span>
                                                        <button onClick={() => handleDelete(proposal.id)} style={{ color: '#ef4444', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>Withdraw</button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProposals.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                                            {searchQuery ? `No collaborations matching "${searchQuery}"` : (isAdmin ? 'Waiting for submissions.' : 'Match a product to submit a proposal.')}
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
