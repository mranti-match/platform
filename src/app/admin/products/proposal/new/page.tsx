'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProductById as getFirestoreProductById, RDProduct } from '@/lib/rd-products';
import { getProductById as getRTDBProductById, Product as RTDBProduct } from '@/lib/products';
import { getProblemStatementById, ProblemStatement } from '@/lib/problem-statements';
import styles from '../../../admin.module.css';
import Link from 'next/link';
import { createProposal } from '@/lib/proposals';
import { useAdmin } from '@/app/admin/components/AdminProvider';
import { useToast } from '@/app/admin/components/ToastProvider';
import { uploadFile } from '@/lib/storage';

export default function NewProposalPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAdmin();
    const { showToast } = useToast();

    const productId = searchParams.get('product');
    const problemId = searchParams.get('problem');
    const source = searchParams.get('source') || 'firestore';

    const [product, setProduct] = useState<any | null>(null);
    const [problem, setProblem] = useState<ProblemStatement | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        projectTitle: '',
        description: '',
        impactOutcomes: '',
        documents: [] as { name: string, url: string }[],
        funding: false,
        market: false,
        capacity: false,
        sandbox: false
    });

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        async function loadData() {
            if (!productId || !problemId) {
                setLoading(false);
                return;
            }

            // Fetch product based on source
            let productData: any = null;
            if (source === 'rtdb') {
                const rtdbProd = await getRTDBProductById(productId);
                if (rtdbProd) {
                    productData = {
                        id: rtdbProd.id,
                        product_name: rtdbProd.product_name,
                        organization: rtdbProd.company_name,
                        cover_image: rtdbProd.image_url,
                        source: 'rtdb'
                    };
                }
            } else {
                const fsProd = await getFirestoreProductById(productId);
                if (fsProd) {
                    productData = {
                        ...fsProd,
                        source: 'firestore'
                    };
                }
            }

            const problemData = await getProblemStatementById(problemId);

            setProduct(productData);
            setProblem(problemData);

            // Clear project title by default as per request
            if (productData && problemData) {
                setFormData(prev => ({
                    ...prev,
                    projectTitle: ''
                }));
            }

            setLoading(false);
        }
        loadData();
    }, [productId, problemId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadedDocs = [...formData.documents];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.type !== 'application/pdf') {
                    showToast(`${file.name} is not a PDF file.`, 'error');
                    continue;
                }
                const url = await uploadFile(file, 'proposals/docs');
                uploadedDocs.push({ name: file.name, url });
            }
            setFormData(prev => ({ ...prev, documents: uploadedDocs }));
            showToast('Documents uploaded successfully.', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to upload documents.', 'error');
        } finally {
            setUploading(false);
            // Reset input
            if (e.target) e.target.value = '';
        }
    };

    const handleRemoveDocument = (index: number) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || !problem || !user) return;

        // Check if at least one facilitation is selected
        const hasFacilitation = formData.funding || formData.market || formData.capacity || formData.sandbox;
        if (!hasFacilitation) {
            showToast('Please select at least one facilitation option.', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await createProposal({
                product_id: product.id,
                product_name: product.product_name,
                problem_statement_id: problem.id,
                problem_statement_title: problem.title,
                problem_image_url: problem.image_url,
                problem_organization: problem.organization,
                owner_id: user.uid,
                owner_email: user.email || '',
                // Project specific info
                project_title: formData.projectTitle,
                description: formData.description,
                impact_outcomes: formData.impactOutcomes,
                documents: formData.documents,
                facilitation: {
                    funding: formData.funding,
                    market: formData.market,
                    capacity: formData.capacity,
                    sandbox: formData.sandbox
                },
                status: 'Pending'
            });
            showToast('Proposal submitted successfully!', 'success');
            router.push('/admin/proposals');
        } catch (error) {
            console.error(error);
            showToast('Failed to submit proposal.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: '2.5rem', color: 'var(--foreground-muted)' }}>Loading proposal form...</div>;
    if (!product || !problem) return (
        <div style={{ padding: '2.5rem' }}>
            <h2>Information Incomplete</h2>
            <p>We couldn't retrieve the necessary {!product ? 'product' : 'problem statement'} details. Please try initiated the proposal from the Match discovery page.</p>
            <Link href="/admin/problem-statements" style={{ color: 'var(--primary)', fontWeight: 600, marginTop: '1rem', display: 'inline-block' }}>Return to Dashboard</Link>
        </div>
    );

    return (
        <div className={styles.mainCol}>
            <div className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <Link href={`/admin/products/match/${productId}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>← Back to Matches</Link>
                    </div>
                    <h1>Initiate Collaboration</h1>
                    <p>Submit your R&D solution to address the selected problem statement.</p>
                </div>
            </div>

            {/* Top Summaries Row - 25% Smaller & With Images */}
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
                        {problem.image_url ? (
                            <img src={problem.image_url} alt={problem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                        }}>{problem.title}</h3>
                        <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{problem.organization}</div>
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
                        {product.cover_image ? (
                            <img src={product.cover_image} alt={product.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.2 }}>
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                        )}
                    </div>
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#22c55e', letterSpacing: '0.05em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Your Product</div>
                        <h3 style={{
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            marginBottom: '0.25rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{product.product_name}</h3>
                        <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{product.organization}</div>
                    </div>
                </div>
            </div>

            {/* Proposal Form - Professional Two-Column Layout */}
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
                                <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1rem' }}>Explain how your product specifically addresses this problem statement.</p>
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
                                <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1rem' }}>Describe the expected results, benefits, and long-term impact of this project.</p>
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
                                    Supporting Documents <span style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.5 }}>(PDF Only)</span>
                                </label>
                                <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1rem' }}>Upload your proposal deck, technical specifications, or other supporting files.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{
                                        position: 'relative',
                                        border: '2px dashed var(--border)',
                                        borderRadius: '12px',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                        background: 'rgba(255,255,255,0.01)'
                                    }}
                                        onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                                        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf"
                                            onChange={handleFileUpload}
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                opacity: 0,
                                                cursor: uploading ? 'not-allowed' : 'pointer',
                                                width: '100%'
                                            }}
                                            disabled={uploading}
                                        />
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📄</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)' }}>
                                            {uploading ? 'Uploading...' : 'Click or drag to upload PDFs'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.4rem' }}>
                                            Maximum file size: 10MB
                                        </div>
                                    </div>

                                    {formData.documents.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {formData.documents.map((doc, index) => (
                                                <div key={index} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.75rem 1rem',
                                                    background: 'var(--surface-highlight)',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border)'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                                        <span style={{ fontSize: '1rem' }}>📄</span>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {doc.name}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveDocument(index)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            borderRadius: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                                                        onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                        width: '70%',
                                        padding: '0.9rem',
                                        fontSize: '0.95rem',
                                        background: 'var(--primary)',
                                        justifyContent: 'center',
                                        borderRadius: '8px',
                                        fontFamily: 'inherit'
                                    }}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Proposal'}
                                </button>
                                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '1.5rem', lineHeight: '1.4' }}>
                                    Your proposal will be reviewed by the product owner and organization administrators.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
