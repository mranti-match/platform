'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProposalById, deleteProposal, updateProposalStatus, Proposal } from '@/lib/proposals';
import { getProductById, RDProduct } from '@/lib/rd-products';
import { getProblemStatementById, ProblemStatement } from '@/lib/problem-statements';
import { useAdmin } from '../../components/AdminProvider';
import { useToast } from '@/app/admin/components/ToastProvider';
import styles from '../../admin.module.css';
import modalStyles from '@/components/Modal.module.css';
import Link from 'next/link';
import Modal from '@/components/Modal';

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, role } = useAdmin();
    const { showToast } = useToast();
    const isAdmin = role === 'Admin' || role === 'Super Admin';
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [product, setProduct] = useState<RDProduct | null>(null);
    const [problem, setProblem] = useState<ProblemStatement | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    // Modal states
    const [showProductModal, setShowProductModal] = useState(false);
    const [showProblemModal, setShowProblemModal] = useState(false);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const data = await getProposalById(id);
            if (data) {
                setProposal(data);

                // Fetch full problem details
                if (data.problem_statement_id) {
                    const problemData = await getProblemStatementById(data.problem_statement_id);
                    setProblem(problemData);
                }

                // Fetch full product details
                if (data.product_id) {
                    const productData = await getProductById(data.product_id);
                    setProduct(productData);
                }
            }
            setLoading(false);
        }
        loadData();
    }, [id]);

    const handleStatusUpdate = async (newStatus: 'Approved' | 'Rejected') => {
        if (!user?.uid) return;
        try {
            await updateProposalStatus(id, newStatus, user.uid);
            setProposal(prev => prev ? { ...prev, status: newStatus } : null);
            showToast(`Collaboration ${newStatus} successfully.`, 'success');
        } catch (error) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) return;

        setDeleting(true);
        try {
            await deleteProposal(id);
            showToast('Collaboration deleted successfully.', 'info');
            router.push('/admin/proposals');
        } catch (error) {
            console.error(error);
            showToast('Failed to delete collaboration.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', color: 'var(--foreground-muted)' }}>Loading collaboration details...</div>;
    if (!proposal) return <div style={{ padding: '2rem' }}>Collaboration not found.</div>;

    const isOwner = user?.uid === proposal.owner_id;

    return (
        <div className={styles.dashboardGrid}>
            <div className={styles.mainCol}>
                <div className={styles.welcomeSection}>
                    <div className={styles.welcomeText}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <Link href="/admin/proposals" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>← Back to Collaboration</Link>
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{proposal.project_title}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span className={`${styles.statusBadge} ${proposal.status === 'Approved' ? styles.statusPublished : proposal.status === 'Pending' ? styles.statusDraft : ''}`}>
                                {proposal.status}
                            </span>
                            <span style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
                                Submitted on {proposal.createdAt?.seconds ? new Date(proposal.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Top Summaries Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* 1. Problem Summary Box */}
                    <div className={styles.contentCard} style={{
                        display: 'flex',
                        minHeight: '130px',
                        borderLeft: '4px solid var(--primary)',
                        overflow: 'hidden',
                        cursor: 'pointer'
                    }} onClick={() => setShowProblemModal(true)}>
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
                                <img src={problem?.image_url || proposal.problem_image_url} alt={proposal.problem_statement_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowProblemModal(true); }}
                                style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--primary)',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    margin: 0,
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    textAlign: 'left'
                                }}
                            >
                                View Detail →
                            </button>
                        </div>
                    </div>

                    {/* 2. Product Summary Box */}
                    <div className={styles.contentCard} style={{
                        display: 'flex',
                        minHeight: '130px',
                        borderLeft: '4px solid #22c55e',
                        overflow: 'hidden',
                        cursor: 'pointer'
                    }} onClick={() => setShowProductModal(true)}>
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
                                <img src={product.cover_image} alt={product.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowProductModal(true); }}
                                style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--primary)',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    margin: 0,
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    textAlign: 'left'
                                }}
                            >
                                View Detail →
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.contentCard} style={{ padding: '2.5rem' }}>
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
                                <section style={{ marginBottom: '3rem' }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--foreground)' }}>Impact & Outcomes</h2>
                                    <div style={{ color: 'var(--foreground-muted)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                                        {proposal.impact_outcomes}
                                    </div>
                                </section>
                            )}

                            {(proposal.documents_url || (proposal.documents && proposal.documents.length > 0)) && (
                                <section>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--foreground)' }}>Supporting Documents</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {/* New Format (Multiple Documents) */}
                                        {proposal.documents && proposal.documents.map((doc, index) => (
                                            <a
                                                key={index}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '1rem 1.5rem',
                                                    background: 'var(--surface-highlight)',
                                                    borderRadius: '8px',
                                                    color: 'var(--primary)',
                                                    textDecoration: 'none',
                                                    fontWeight: 600,
                                                    border: '1px solid var(--border)'
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                                {doc.name}
                                            </a>
                                        ))}

                                        {/* Legacy Format (Single Link) */}
                                        {proposal.documents_url && (
                                            <a
                                                href={proposal.documents_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '1rem 1.5rem',
                                                    background: 'var(--surface-highlight)',
                                                    borderRadius: '8px',
                                                    color: 'var(--primary)',
                                                    textDecoration: 'none',
                                                    fontWeight: 600,
                                                    border: '1px solid var(--border)'
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                                View Cloud Documents (Legacy Link)
                                            </a>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar Info */}
                        <div>
                            <div style={{
                                background: 'rgba(255,255,255,0.02)',
                                padding: '2rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                marginBottom: '2rem'
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Facilitation Requested</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {Object.entries(proposal.facilitation).map(([key, value]) => (
                                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: value ? 1 : 0.4 }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '4px',
                                                background: value ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {value && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                            </div>
                                            <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>
                                                {key.replace(/([A-Z])/g, ' $1')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ margin: '1rem 0' }}></div>

                            {isAdmin && proposal.status === 'Pending' && (
                                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <button
                                        onClick={() => handleStatusUpdate('Approved')}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: '#22c55e',
                                            color: 'white',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Approve Collaboration
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('Rejected')}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            border: '1px solid #ef4444',
                                            background: 'transparent',
                                            color: '#ef4444',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Reject Collaboration
                                    </button>
                                </div>
                            )}

                            {isOwner && (
                                <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <Link
                                        href={`/admin/proposals/edit/${id}`}
                                        className={styles.btnNewPost}
                                        style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                                    >
                                        Edit Collaboration
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        style={{
                                            width: '100%',
                                            padding: '0.9rem',
                                            borderRadius: '8px',
                                            border: '1px solid #ef4444',
                                            background: 'transparent',
                                            color: '#ef4444',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                                        onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        {deleting ? 'Deleting...' : 'Delete Collaboration'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={showProductModal}
                onClose={() => setShowProductModal(false)}
                title="Product Details"
            >
                {product ? (
                    <div>
                        <div className={modalStyles.detailRow}>
                            <div className={modalStyles.detailLabel}>Product Name</div>
                            <div className={modalStyles.detailValue}>{product.product_name}</div>
                        </div>
                        <div className={modalStyles.detailRow}>
                            <div className={modalStyles.detailLabel}>Organization</div>
                            <div className={modalStyles.detailValue}>{product.organization}</div>
                        </div>
                        <div className={modalStyles.detailRow}>
                            <div className={modalStyles.detailLabel}>IP Status</div>
                            <div className={modalStyles.detailValue}>{product.ip_type} {product.ip_number ? `(${product.ip_number})` : ''}</div>
                        </div>

                        <h3>Technology Description</h3>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>

                        <h3>Unique Value Proposition</h3>
                        <p>{product.uvp}</p>

                        <h3>Market Target</h3>
                        <p>{product.market_target}</p>

                        <h3>Impact Industries</h3>
                        <div style={{ marginTop: '0.5rem' }}>
                            {product.impact_industries.map(industry => (
                                <span key={industry} className={modalStyles.badge}>{industry}</span>
                            ))}
                            {product.other_industry && <span className={modalStyles.badge}>{product.other_industry}</span>}
                        </div>
                    </div>
                ) : (
                    <p>Loading product details...</p>
                )}
            </Modal>

            <Modal
                isOpen={showProblemModal}
                onClose={() => setShowProblemModal(false)}
                title="Problem Statement Details"
            >
                {problem ? (
                    <div>
                        <div className={modalStyles.detailRow}>
                            <div className={modalStyles.detailLabel}>Title</div>
                            <div className={modalStyles.detailValue}>{problem.title}</div>
                        </div>
                        <div className={modalStyles.detailRow}>
                            <div className={modalStyles.detailLabel}>Organization</div>
                            <div className={modalStyles.detailValue}>{problem.organization}</div>
                        </div>
                        <div className={modalStyles.detailRow}>
                            <div className={modalStyles.detailLabel}>Sectors</div>
                            <div className={modalStyles.detailValue}>
                                <span className={modalStyles.badge}>{problem.sector}</span>
                            </div>
                        </div>
                        {problem.deadline && (
                            <div className={modalStyles.detailRow}>
                                <div className={modalStyles.detailLabel}>Deadline</div>
                                <div className={modalStyles.detailValue}>{problem.deadline}</div>
                            </div>
                        )}

                        <h3>Description</h3>
                        <div
                            dangerouslySetInnerHTML={{ __html: problem.description }}
                            style={{ color: 'var(--foreground-muted)' }}
                        />
                    </div>
                ) : (
                    <p>Loading problem details...</p>
                )}
            </Modal>
        </div>
    );
}
