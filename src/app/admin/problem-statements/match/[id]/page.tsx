'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProblemStatementById, ProblemStatement } from '@/lib/problem-statements';
import { getAllProducts as getFirestoreProducts, RDProduct } from '@/lib/rd-products';
import { getAllProducts as getRTDBProducts, Product as RTDBProduct } from '@/lib/products';
import styles from '../../../admin.module.css';
import Link from 'next/link';
import { useAdmin } from '../../../components/AdminProvider';

export default function ProblemMatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: problemId } = use(params);
    const router = useRouter();
    const { user } = useAdmin();
    const [problem, setProblem] = useState<ProblemStatement | null>(null);
    const [matches, setMatches] = useState<(any & { score: number; source: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const problemData = await getProblemStatementById(problemId);
                if (problemData) {
                    setProblem(problemData);

                    // 1. Fetch products from both sources
                    const [firestoreProducts, rtdbProducts] = await Promise.all([
                        getFirestoreProducts(true),
                        getRTDBProducts()
                    ]);

                    // 2. Unify product structures
                    const unifiedProducts = [
                        ...firestoreProducts.map(p => ({
                            id: p.id,
                            product_name: p.product_name,
                            description: p.description,
                            organization: p.organization === 'Personal' ? 'Private Researcher' : p.organization,
                            company_name: p.organization,
                            impact_industries: p.impact_industries,
                            other_industry: p.other_industry,
                            trl: p.trl,
                            ip_type: p.ip_type,
                            cover_image: p.cover_image,
                            source: 'firestore'
                        })),
                        ...rtdbProducts.map(p => ({
                            id: p.id,
                            product_name: p.product_name,
                            description: p.product_description,
                            organization: p.company_name,
                            company_name: p.company_name,
                            impact_industries: Array.isArray(p.category) ? p.category : (p.category ? [p.category] : []),
                            other_industry: '',
                            trl: '6', // Default for RTDB if not available
                            ip_type: 'Patent', // Default
                            cover_image: p.image_url,
                            source: 'rtdb'
                        }))
                    ];

                    // 3. Advanced Weighted Matching Algorithm
                    const problemSector = (problemData.sector || '').toLowerCase();
                    const problemTitle = (problemData.title || '').toLowerCase();
                    const problemDesc = (problemData.description || '').toLowerCase();

                    const problemKeywords = new Set([
                        ...problemTitle.split(/\W+/),
                        ...problemDesc.replace(/<[^>]*>/g, ' ').split(/\W+/)
                    ].filter(w => w.length > 3));

                    const scoredMatches = unifiedProducts.map(product => {
                        let score = 0;
                        const productIndustries = (product.impact_industries || []).map(i => i.toLowerCase());
                        const productText = (product.product_name + ' ' + product.description).toLowerCase();
                        const productWords = productText.split(/\W+/).filter(w => w.length > 3);

                        // A. Sector/Industry Alignment (Weighted: 50% max)
                        // This prevents the Healthcare-Agriculture mismatch
                        const isPrimarySectorMatch = productIndustries.some(ind =>
                            problemSector.includes(ind) || ind.includes(problemSector)
                        );

                        if (isPrimarySectorMatch) {
                            score += 50;
                        } else {
                            // Penalty for cross-industry mismatch if both have distinct sectors
                            if (problemSector.includes('health') && productIndustries.some(ind => ind.includes('agri'))) {
                                score -= 40; // Hard penalty
                            }
                            if (problemSector.includes('agri') && productIndustries.some(ind => ind.includes('health'))) {
                                score -= 40; // Hard penalty
                            }
                        }

                        // B. Keyword Relevance (Weighted: 40% max)
                        const matchedKeywords = productWords.filter(word => problemKeywords.has(word));
                        const keywordRatio = Math.min(matchedKeywords.length / 5, 1); // 5 key matches = max
                        score += (keywordRatio * 40);

                        // C. Semantic Name Match (Weighted: 10% max)
                        if (product.product_name.toLowerCase().split(/\W+/).some(w => w.length > 3 && problemKeywords.has(w))) {
                            score += 10;
                        }

                        // Normalized final score (0-98%)
                        const finalScore = Math.max(0, Math.min(Math.round(score), 98));

                        return { ...product, score: finalScore };
                    })
                        .filter(m => m.score > 30) // Only show quality matches
                        .sort((a, b) => b.score - a.score);

                    setMatches(scoredMatches);
                }
            } catch (error) {
                console.error("Match error:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [problemId]);

    if (loading) return <div style={{ padding: '2.5rem', color: 'var(--foreground-muted)' }}>Analyzing product matches...</div>;
    if (!problem) return <div style={{ padding: '2.5rem' }}>Problem statement not found.</div>;

    return (
        <div className={styles.dashboardGrid}>
            <div className={styles.mainCol}>
                <div className={styles.welcomeSection}>
                    <div className={styles.welcomeText}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <Link href="/admin/problem-statements" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>← Back to Statements</Link>
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>AI Product Discovery</h1>
                        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Best technology matches for <strong>{problem.title}</strong></p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                    {matches.map(product => {
                        const cleanDescription = (product.description || '')
                            .replace(/<[^>]*>/g, '')
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&amp;/g, '&')
                            .replace(/\s+/g, ' ')
                            .trim();

                        return (
                            <div key={product.id} className={styles.contentCard} style={{
                                display: 'grid',
                                gridTemplateColumns: '180px 1fr 180px',
                                minHeight: '180px',
                                overflow: 'hidden'
                            }}>
                                {/* 1. Image Section */}
                                <div style={{
                                    background: 'var(--surface-highlight)',
                                    display: 'flex',
                                    overflow: 'hidden',
                                    borderRight: '1px solid var(--border)'
                                }}>
                                    {product.cover_image ? (
                                        <img src={product.cover_image} alt={product.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '2rem',
                                            opacity: 0.2
                                        }}>
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                                <line x1="8" y1="21" x2="16" y2="21" />
                                                <line x1="12" y1="17" x2="12" y2="21" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* 2. Text Content Column */}
                                <div style={{
                                    padding: '1.25rem 1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    minWidth: 0
                                }}>
                                    <div style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <span className={styles.tagBadge} style={{ fontSize: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                                TRL {product.trl}
                                            </span>
                                            <span className={styles.tagBadge} style={{ fontSize: '0.6rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                                {product.ip_type}
                                            </span>
                                        </div>

                                        <h3 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: 700,
                                            marginBottom: '0.4rem',
                                            color: 'var(--foreground)',
                                            lineHeight: '1.3'
                                        }}>
                                            {product.product_name}
                                        </h3>

                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--foreground-muted)',
                                            marginBottom: '0.75rem',
                                            fontWeight: 500
                                        }}>
                                            {product.organization || 'Registered Stakeholder'}
                                        </div>

                                        <p style={{
                                            color: 'var(--foreground-muted)',
                                            fontSize: '0.85rem',
                                            lineHeight: '1.5',
                                            display: '-webkit-box',
                                            WebkitLineClamp: '3',
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            opacity: 0.8
                                        }}>
                                            {cleanDescription}
                                        </p>
                                    </div>
                                </div>

                                {/* 3. Action Column */}
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.01)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderLeft: '1px solid var(--border)',
                                    padding: '1.25rem'
                                }}>
                                    <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                                        <div style={{
                                            fontSize: '2.25rem',
                                            fontWeight: 900,
                                            color: product.score > 70 ? '#22c55e' : '#eab308',
                                            lineHeight: 1
                                        }}>
                                            {product.score}%
                                        </div>
                                        <div style={{
                                            fontSize: '0.6rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            opacity: 0.4,
                                            letterSpacing: '0.1em',
                                            marginTop: '0.4rem'
                                        }}>
                                            Fit Score
                                        </div>
                                    </div>
                                    <Link
                                        href={`/admin/products/proposal/new?product=${product.id}&problem=${problem.id}&source=${product.source}`}
                                        className={styles.btnNewPost}
                                        style={{
                                            width: '100%',
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            padding: '0.6rem'
                                        }}
                                    >
                                        Collaborate
                                    </Link>
                                </div>
                            </div>
                        );
                    })}

                    {matches.length === 0 && (
                        <div className={styles.emptyState} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div style={{ opacity: 0.2, marginBottom: '1rem' }}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="8" y1="12" x2="16" y2="12" />
                                </svg>
                            </div>
                            <h3>No matches found</h3>
                            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0.5rem auto' }}>
                                Our AI couldn't find a direct technology match for this problem statement yet. Try broadening the sector or description.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
