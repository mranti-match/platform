'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProposalById, updateProposal, Proposal } from '@/lib/proposals';
import { useAdmin } from '../../../components/AdminProvider';
import styles from '../../../admin.module.css';
import Link from 'next/link';

export default function EditProposalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAdmin();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        projectTitle: '',
        description: '',
        impactOutcomes: '',
        documentsUrl: '',
        funding: false,
        market: false,
        capacity: false,
        sandbox: false
    });

    useEffect(() => {
        async function loadData() {
            const data = await getProposalById(id);
            if (data) {
                setFormData({
                    projectTitle: data.project_title || '',
                    description: data.description || '',
                    impactOutcomes: data.impact_outcomes || '',
                    documentsUrl: data.documents_url || '',
                    funding: data.facilitation.funding,
                    market: data.facilitation.market,
                    capacity: data.facilitation.capacity,
                    sandbox: data.facilitation.sandbox
                });
            }
            setLoading(false);
        }
        loadData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if at least one facilitation is selected
        const hasFacilitation = formData.funding || formData.market || formData.capacity || formData.sandbox;
        if (!hasFacilitation) {
            alert('Please select at least one facilitation option.');
            return;
        }

        setSubmitting(true);
        try {
            await updateProposal(id, {
                project_title: formData.projectTitle,
                description: formData.description,
                impact_outcomes: formData.impactOutcomes,
                documents_url: formData.documentsUrl,
                facilitation: {
                    funding: formData.funding,
                    market: formData.market,
                    capacity: formData.capacity,
                    sandbox: formData.sandbox
                }
            });
            alert('Proposal updated successfully!');
            router.push(`/admin/proposals/${id}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to update proposal.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: '2.5rem', color: 'var(--foreground-muted)' }}>Loading proposal form...</div>;

    return (
        <div className={styles.mainCol}>
            <div className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <Link href={`/admin/proposals/${id}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>← Back to Detail</Link>
                    </div>
                    <h1>Edit Project Proposal</h1>
                    <p>Refine your R&D solution details below.</p>
                </div>
            </div>

            <div className={styles.contentCard} style={{ padding: '0' }}>
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <div style={{ padding: '2rem 3rem 0 3rem', fontSize: '0.8rem', color: 'var(--foreground-muted)', opacity: 0.7 }}>
                        Fields marked with <span style={{ color: '#ef4444' }}>*</span> are compulsory.
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', gap: '0' }}>
                        {/* Left Side: Main Content */}
                        <div style={{ padding: '2rem 3rem 3rem 3rem', borderRight: '1px solid var(--border)' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
                                    Project Title <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.projectTitle}
                                    onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
                                    placeholder="A concise name for your proposed project"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--surface-highlight)',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
                                    Project Description <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Detailed explanation of the solution, technical approach, and expected results..."
                                    style={{
                                        width: '100%',
                                        minHeight: '220px',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--surface-highlight)',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
                                    Project Impact & Outcomes <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <textarea
                                    required
                                    value={formData.impactOutcomes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, impactOutcomes: e.target.value }))}
                                    placeholder="Quantifiable targets, community benefits, environmental impact..."
                                    style={{
                                        width: '100%',
                                        minHeight: '180px',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--surface-highlight)',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '0' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
                                    Cloud Drive Link <span style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.5 }}>(Optional)</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔗</span>
                                    <input
                                        type="url"
                                        value={formData.documentsUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, documentsUrl: e.target.value }))}
                                        placeholder="https://drive.google.com/..."
                                        style={{
                                            width: '100%',
                                            padding: '1rem 1rem 1rem 2.5rem',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--surface-highlight)',
                                            color: 'white',
                                            fontSize: '0.95rem',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Sidebar Actions */}
                        <div style={{ padding: '3rem', background: 'rgba(255, 255, 255, 0.01)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: 'auto' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--foreground)' }}>
                                    Facilitation Needed <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[
                                        { id: 'funding', label: 'Access to Funding' },
                                        { id: 'market', label: 'Access to Market' },
                                        { id: 'capacity', label: 'Capacity Building' },
                                        { id: 'sandbox', label: 'Sandbox Facilitation' }
                                    ].map(item => (
                                        <label key={item.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            cursor: 'pointer',
                                            background: (formData as any)[item.id] ? 'rgba(59,130,246,0.1)' : 'var(--surface-highlight)',
                                            padding: '1.25rem',
                                            borderRadius: '12px',
                                            border: '1px solid',
                                            borderColor: (formData as any)[item.id] ? 'var(--primary)' : 'var(--border)',
                                            transition: 'all 0.2s'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={(formData as any)[item.id]}
                                                onChange={(e) => setFormData(prev => ({ ...prev, [item.id]: e.target.checked }))}
                                                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                                            />
                                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <button
                                    type="submit"
                                    className={styles.btnNewPost}
                                    style={{
                                        width: '100%',
                                        padding: '0.9rem',
                                        fontSize: '0.95rem',
                                        background: 'var(--primary)',
                                        justifyContent: 'center',
                                        borderRadius: '8px',
                                        fontFamily: 'inherit'
                                    }}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Updating...' : 'Update Proposal'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
