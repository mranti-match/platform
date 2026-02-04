'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProductById, RDProduct } from '@/lib/rd-products';
import { getUserByUid, AppUser } from '@/lib/users';
import styles from '../../../admin.module.css';
import Link from 'next/link';
import { useAdmin } from '../../../components/AdminProvider';

export default function RDProductProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAdmin();
    const [product, setProduct] = useState<RDProduct | null>(null);
    const [owner, setOwner] = useState<any>(null);

    useEffect(() => {
        async function loadData() {
            const data = await getProductById(id);
            if (data) {
                setProduct(data);
                // Fetch actual owner data
                if (data.owner_id) {
                    let ownerData: any = await getUserByUid(data.owner_id);

                    // Fallback: If owner_id looks like an email and UID lookup failed
                    if (!ownerData && data.owner_id.includes('@')) {
                        const { getUserByEmail } = await import('@/lib/users');
                        ownerData = await getUserByEmail(data.owner_id);
                    }

                    setOwner(ownerData);
                }
            }
        }
        loadData();
    }, [id, user]);

    const handleMatch = () => {
        router.push(`/admin/products/match/${id}`);
    };

    if (!product) return <div style={{ padding: '2rem' }}>Loading product profile...</div>;

    return (
        <div className={styles.dashboardGrid}>
            <div className={styles.mainCol}>
                <div className={styles.welcomeSection}>
                    <div className={styles.welcomeText}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <Link href="/admin/products" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>← Back to Products</Link>
                        </div>
                        <h1>{product.product_name}</h1>
                        <p>Detailed profile and AI matching for this R&D product.</p>
                    </div>
                    <button onClick={handleMatch} className={styles.btnNewPost} style={{ background: 'var(--secondary)' }}>
                        ⚡ AI MATCH
                    </button>
                </div>

                {/* Main Overview Card */}
                <div className={styles.contentCard} style={{ marginBottom: '2rem' }}>
                    <div style={{ padding: '2.5rem' }}>
                        <div style={{ display: 'flex', gap: '2.5rem' }}>
                            <div style={{ flexShrink: 0, width: '240px', height: '240px', background: 'var(--surface-highlight)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {product.cover_image ? (
                                    <img
                                        src={product.cover_image}
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement!.innerHTML = `
                                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style="opacity: 0.2">
                                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                                    <line x1="8" y1="21" x2="16" y2="21" />
                                                    <line x1="12" y1="17" x2="12" y2="21" />
                                                </svg>
                                            `;
                                        }}
                                    />
                                ) : (
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.2 }}>
                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                        <line x1="8" y1="21" x2="16" y2="21" />
                                        <line x1="12" y1="17" x2="12" y2="21" />
                                    </svg>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{product.organization || 'PRODUCT'}</div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem' }}>Product Overview</h3>
                                <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.7', fontSize: '1rem' }}>{product.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Block - 3 Columns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className={styles.contentCard} style={{ padding: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Impact Industries</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {product.impact_industries.map(industry => (
                                <span key={industry} className={styles.tagBadge} style={{ background: 'var(--surface-highlight)', color: 'var(--foreground)' }}>
                                    {industry === 'Others' ? product.other_industry : industry}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className={styles.contentCard} style={{ padding: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Intellectual Property</h4>
                        {product.ip_type !== 'No IP Yet' ? (
                            <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{product.ip_type} Active</div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace' }}>{product.ip_number}</div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', fontStyle: 'italic' }}>No registration provided.</div>
                        )}
                    </div>

                    <div className={styles.contentCard} style={{ padding: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Owner Information</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className={styles.profileAvatar} style={{ width: '42px', height: '42px', fontSize: '0.9rem', flexShrink: 0, background: 'var(--primary)' }}>
                                {(owner?.displayName || owner?.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--foreground)' }}>
                                    {(owner as any)?.displayName || (owner as any)?.email?.split('@')[0] || (product as any)?.owner_email?.split('@')[0] || 'Anonymous Stakeholder'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.1rem' }}>
                                    {(owner as any)?.organization || (owner ? 'Independent Researcher' : (product as any)?.organization || 'External Partner')}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {(owner as any)?.email || (product as any)?.owner_email || 'No contact email'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Sections - 2 Columns Aligned */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div className={styles.contentCard} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--foreground-muted)', letterSpacing: '0.05em' }}>Unique Value Proposition</h4>
                        </div>
                        <div style={{ padding: '1.5rem', flex: 1, background: 'var(--surface-highlight)', margin: '1rem', borderRadius: '8px', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                            {product.uvp}
                        </div>
                    </div>
                    <div className={styles.contentCard} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--foreground-muted)', letterSpacing: '0.05em' }}>Target Markets</h4>
                        </div>
                        <div style={{ padding: '1.5rem', flex: 1, background: 'var(--surface-highlight)', margin: '1rem', borderRadius: '8px', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                            {product.market_target}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
