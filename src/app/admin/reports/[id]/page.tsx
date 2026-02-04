'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProposalById, Proposal } from '@/lib/proposals';
import { createProjectReport } from '@/lib/reports';
import { getProblemStatementById, ProblemStatement } from '@/lib/problem-statements';
import { getProductById, RDProduct } from '@/lib/rd-products';
import { useAdmin } from '../../components/AdminProvider';
import styles from '../../admin.module.css';
import Link from 'next/link';
import { getDirectCloudImageUrl } from '@/lib/imageUtils';

export default function ProjectReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAdmin();

    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [problem, setProblem] = useState<ProblemStatement | null>(null);
    const [product, setProduct] = useState<RDProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        finalReport: '',
        outcomes: '',
        nationalImpacts: '',
        isCommercialised: 'false',
        projectValue: '',
        cloudDocumentsUrl: ''
    });

    useEffect(() => {
        async function loadData() {
            const proposalData = await getProposalById(id);
            if (proposalData) {
                setProposal(proposalData);
                const [probData, prodData] = await Promise.all([
                    getProblemStatementById(proposalData.problem_statement_id),
                    getProductById(proposalData.product_id)
                ]);
                setProblem(probData);
                setProduct(prodData);
            }
            setLoading(false);
        }
        loadData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proposal || !user) return;

        setSubmitting(true);
        try {
            await createProjectReport({
                proposal_id: proposal.id,
                project_title: proposal.project_title || 'Untitled Project',
                admin_id: user.uid,
                admin_email: user.email || '',
                final_report: formData.finalReport,
                outcomes: formData.outcomes,
                national_impacts: formData.nationalImpacts,
                is_commercialised: formData.isCommercialised === 'true',
                project_value: formData.projectValue,
                cloud_documents_url: formData.cloudDocumentsUrl
            });
            alert('Project report submitted successfully!');
            router.push('/admin');
        } catch (error) {
            console.error(error);
            alert('Failed to submit report.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: '2.5rem', color: 'var(--foreground-muted)' }}>Loading proposal details...</div>;
    if (!proposal) return <div style={{ padding: '2.5rem' }}>Proposal not found.</div>;

    return (
        <div className={styles.mainCol}>
            <div className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <Link href="/admin" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>← Back to Dashboard</Link>
                    </div>
                    <h1>Project Final Report</h1>
                    <p>Provide a comprehensive report on the progress and impact of this project.</p>
                </div>
            </div>

            {/* Top Summaries Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* 1. Problem Summary Box */}
                <div className={styles.contentCard} style={{
                    display: 'flex',
                    minHeight: '130px',
                    borderLeft: '4px solid var(--primary)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: '120px',
                        background: 'var(--surface-highlight)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: '1px solid var(--border)',
                        overflow: 'hidden'
                    }}>
                        {(problem?.image_url || proposal.problem_image_url) ? (
                            <img src={getDirectCloudImageUrl(problem?.image_url || proposal.problem_image_url || '')} alt={proposal.problem_statement_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.2 }}>
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        )}
                    </div>
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Selected Problem</div>
                        <h3 style={{
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            marginBottom: '0.25rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{proposal.problem_statement_title}</h3>
                        <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>{proposal.problem_organization}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>View Detail →</div>
                    </div>
                </div>

                {/* 2. Product Summary Box */}
                <div className={styles.contentCard} style={{
                    display: 'flex',
                    minHeight: '130px',
                    borderLeft: '4px solid #22c55e',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: '120px',
                        background: 'var(--surface-highlight)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: '1px solid var(--border)',
                        overflow: 'hidden'
                    }}>
                        {product?.cover_image ? (
                            <img src={getDirectCloudImageUrl(product.cover_image)} alt={product.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ opacity: 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#22c55e', letterSpacing: '0.05em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Proposed Product</div>
                        <h3 style={{
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            marginBottom: '0.25rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{proposal.product_name}</h3>
                        <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>{product?.organization || 'Stakeholder'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>View Detail →</div>
                    </div>
                </div>
            </div>

            <div className={styles.contentCard} style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
                    {/* Main Content */}
                    <div>
                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--foreground)' }}>Project Description</h2>
                            <div style={{ color: 'var(--foreground-muted)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                                {proposal.description}
                            </div>
                        </section>

                        {proposal.impact_outcomes && (
                            <section>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--foreground)' }}>Impact & Outcomes</h2>
                                <div style={{ color: 'var(--foreground-muted)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                                    {proposal.impact_outcomes}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside>
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.5rem' }}>Facilitation Requested</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { key: 'capacity', label: 'Capacity' },
                                    { key: 'sandbox', label: 'Sandbox' },
                                    { key: 'market', label: 'Market' },
                                    { key: 'funding', label: 'Funding' }
                                ].map(item => (
                                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '4px',
                                            border: '2px solid',
                                            borderColor: (proposal.facilitation as any)[item.key] ? 'var(--primary)' : 'var(--border)',
                                            background: (proposal.facilitation as any)[item.key] ? 'var(--primary)' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {(proposal.facilitation as any)[item.key] && (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: (proposal.facilitation as any)[item.key] ? 'var(--foreground)' : 'var(--foreground-muted)' }}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.contentCard} style={{ padding: '2.5rem' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem' }}>Project Final Report <span style={{ color: '#ef4444' }}>*</span></label>
                        <textarea
                            required
                            value={formData.finalReport}
                            onChange={(e) => setFormData(prev => ({ ...prev, finalReport: e.target.value }))}
                            placeholder="Describe the final progress and completion of the project..."
                            className={styles.input}
                            style={{ minHeight: '150px', lineHeight: '1.6' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem' }}>Project Outcomes <span style={{ color: '#ef4444' }}>*</span></label>
                        <textarea
                            required
                            value={formData.outcomes}
                            onChange={(e) => setFormData(prev => ({ ...prev, outcomes: e.target.value }))}
                            placeholder="What were the key achievements and results of this project?"
                            className={styles.input}
                            style={{ minHeight: '120px', lineHeight: '1.6' }}
                        />
                    </div>

                    <div style={{ marginBottom: '3rem' }}>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem' }}>National Impacts <span style={{ color: '#ef4444' }}>*</span></label>
                        <textarea
                            required
                            value={formData.nationalImpacts}
                            onChange={(e) => setFormData(prev => ({ ...prev, nationalImpacts: e.target.value }))}
                            placeholder="How does this project contribute to national development or industry growth?"
                            className={styles.input}
                            style={{ minHeight: '120px', lineHeight: '1.6' }}
                        />
                    </div>

                    {/* Return of Value Section */}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Return of Value</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '1.25rem' }}>
                                    Commercialisation Status <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[
                                        { value: 'false', label: 'Not Yet Commercialised' },
                                        { value: 'true', label: 'Successfully Commercialised' }
                                    ].map((option) => (
                                        <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                border: '2px solid',
                                                borderColor: formData.isCommercialised === option.value ? 'var(--primary)' : 'var(--border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}>
                                                {formData.isCommercialised === option.value && (
                                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />
                                                )}
                                                <input
                                                    type="radio"
                                                    name="commercialised"
                                                    value={option.value}
                                                    checked={formData.isCommercialised === option.value}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, isCommercialised: e.target.value }))}
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                            <span style={{ fontSize: '0.9375rem', color: formData.isCommercialised === option.value ? 'var(--foreground)' : 'var(--foreground-muted)' }}>
                                                {option.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {formData.isCommercialised === 'true' && (
                                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem' }}>
                                        Project Value (RM) <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 500,000"
                                        className={styles.input}
                                        value={formData.projectValue}
                                        onChange={(e) => setFormData(prev => ({ ...prev, projectValue: e.target.value }))}
                                    />
                                    <style jsx>{`
                                        @keyframes fadeIn {
                                            from { opacity: 0; transform: translateY(-10px); }
                                            to { opacity: 1; transform: translateY(0); }
                                        }
                                    `}</style>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '2.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem' }}>Cloud Document Link</label>
                            <input
                                type="url"
                                placeholder="https://drive.google.com/..."
                                className={styles.input}
                                value={formData.cloudDocumentsUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, cloudDocumentsUrl: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Link
                            href="/admin"
                            style={{
                                padding: '0.85rem 2rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: 'var(--foreground-muted)',
                                border: '1px solid var(--border)',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className={styles.btnNewPost}
                            style={{ padding: '0.85rem 3rem', borderRadius: '8px' }}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
