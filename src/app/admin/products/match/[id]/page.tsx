'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProductById, RDProduct } from '@/lib/rd-products';
import { getAllProblemStatements, ProblemStatement } from '@/lib/problem-statements';
import styles from '../../../admin.module.css';
import Link from 'next/link';
import { useAdmin } from '../../../components/AdminProvider';

export default function AIMatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: productId } = use(params);
    const router = useRouter();
    const { user } = useAdmin();
    const [product, setProduct] = useState<RDProduct | null>(null);
    const [matches, setMatches] = useState<(ProblemStatement & { score: number })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const productData = await getProductById(productId);
            if (productData) {
                setProduct(productData);
                const allProblems = await getAllProblemStatements();

                // Simple keyword matching algorithm
                const industryKeywords = productData.impact_industries.join(' ') + (productData.other_industry ? ' ' + productData.other_industry : '');
                const productWords = new Set((productData.product_name + ' ' + productData.description + ' ' + productData.uvp + ' ' + industryKeywords).toLowerCase().split(/\W+/));

                const scoredMatches = allProblems.map(problem => {
                    const problemWords = (problem.title + ' ' + problem.description + ' ' + problem.sector).toLowerCase().split(/\W+/);
                    const intersection = problemWords.filter(word => word.length > 3 && productWords.has(word));
                    const score = Math.min(Math.round((intersection.length / 5) * 100), 98); // Cap at 98 for theoretical
                    return { ...problem, score };
                }).filter(m => m.score > 5).sort((a, b) => b.score - a.score);

                setMatches(scoredMatches);
            }
            setLoading(false);
        }
        loadData();
    }, [productId]);

    if (loading) return <div style={{ padding: '2.5rem', color: 'var(--foreground-muted)' }}>Analyzing matches...</div>;
    if (!product) return <div style={{ padding: '2.5rem' }}>Product not found.</div>;

    return (
        <div className={styles.dashboardGrid}>
            <div className={styles.mainCol}>
                <div className={styles.welcomeSection}>
                    <div className={styles.welcomeText}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <Link href={`/admin/products/profile/${productId}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>← Back to Profile</Link>
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>AI Matching Results</h1>
                        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Best problem statement matches for <strong>{product.product_name}</strong></p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                    {matches.map(problem => {
                        const cleanDescription = (problem.description || '')
                            .replace(/<[^>]*>/g, '')
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&amp;/g, '&')
                            .replace(/\s+/g, ' ')
                            .trim();

                        return (
                            <div key={problem.id} className={styles.contentCard} style={{
                                display: 'grid',
                                gridTemplateColumns: '180px 1fr 180px', // ~30% smaller from 240px
                                minHeight: '200px', // ~30% smaller from 280px
                                overflow: 'hidden'
                            }}>
                                {/* 1. Image Section */}
                                <div style={{
                                    background: 'var(--surface-highlight)',
                                    display: 'flex',
                                    overflow: 'hidden',
                                    borderRight: '1px solid var(--border)'
                                }}>
                                    {problem.image_url ? (
                                        <img src={problem.image_url} alt={problem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '2rem',
                                            opacity: 0.2
                                        }}>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* 2. Text Content Column */}
                                <div style={{
                                    padding: '1.5rem 1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    minWidth: 0
                                }}>
                                    <div style={{ width: '100%' }}>
                                        <div className={styles.tagBadge} style={{
                                            marginBottom: '0.75rem',
                                            display: 'inline-flex',
                                            fontSize: '0.65rem',
                                            padding: '2px 8px',
                                            letterSpacing: '0.02em',
                                            background: 'rgba(217, 70, 239, 0.1)',
                                            color: 'var(--primary)'
                                        }}>
                                            {problem.sector}
                                        </div>

                                        <h3 style={{
                                            fontSize: '1.2rem',
                                            fontWeight: 700,
                                            marginBottom: '0.5rem',
                                            color: 'var(--foreground)',
                                            lineHeight: '1.4',
                                            wordBreak: 'break-word'
                                        }}>
                                            {problem.title}
                                        </h3>

                                        <div style={{
                                            fontSize: '0.85rem',
                                            color: 'var(--foreground-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '1rem',
                                            fontWeight: 500
                                        }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path></svg>
                                            {problem.organization}
                                        </div>

                                        <p style={{
                                            color: 'var(--foreground-muted)',
                                            fontSize: '0.875rem',
                                            lineHeight: '1.6',
                                            display: '-webkit-box',
                                            WebkitLineClamp: '4',
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            opacity: 0.85,
                                            width: '100%'
                                        }}>
                                            {cleanDescription}
                                        </p>
                                    </div>
                                </div>

                                {/* 3. Action Column */}
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.015)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderLeft: '1px solid var(--border)',
                                    padding: '1.5rem'
                                }}>
                                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{
                                            fontSize: '2.5rem', // ~30% smaller from 3.5rem
                                            fontWeight: 900,
                                            color: problem.score > 70 ? '#22c55e' : '#eab308',
                                            lineHeight: 1
                                        }}>
                                            {problem.score}%
                                        </div>
                                        <div style={{
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            opacity: 0.4,
                                            letterSpacing: '0.12em',
                                            marginTop: '0.5rem'
                                        }}>
                                            Match Score
                                        </div>
                                    </div>
                                    <Link
                                        href={`/admin/products/proposal/new?product=${productId}&problem=${problem.id}`}
                                        className={styles.btnNewPost}
                                        style={{
                                            width: '100%',
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.8rem', // ~30% smaller from 0.95rem
                                            padding: '0.75rem'
                                        }}
                                    >
                                        Submit Proposal
                                    </Link>
                                </div>
                            </div>
                        );
                    })}

                    {matches.length === 0 && (
                        <div className={styles.emptyState} style={{ marginTop: '2rem' }}>
                            <p>No suitable matches found for your product at this time.</p>
                            <Link href={`/admin/products/profile/${productId}`} className={styles.viewAllLink} style={{ marginTop: '1rem', display: 'inline-block' }}>Expand your profile for better results</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
