'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '../../components/AdminProvider';
import { useToast } from '../../components/ToastProvider';
import { getClaims, approveClaim, rejectClaim, ProductClaim } from '@/lib/product-claims';
import { getProductById, Product } from '@/lib/products';
import Modal from '@/components/Modal';
import ConfirmationModal from '@/components/ConfirmationModal';
import styles from '../../admin.module.css';

export default function AdminClaimsPage() {
    const { user, role } = useAdmin();
    const { showToast } = useToast();
    const [claims, setClaims] = useState<ProductClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedClaim, setSelectedClaim] = useState<ProductClaim | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Confirmation Modal State
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'info' | 'danger' | 'warning' | 'success';
        confirmLabel: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'info',
        confirmLabel: 'Confirm'
    });

    const isAdmin = role === 'Admin' || role === 'Super Admin';

    useEffect(() => {
        if (isAdmin) {
            loadClaims();
        }
    }, [isAdmin]);

    const loadClaims = async () => {
        setLoading(true);
        try {
            const data = await getClaims(true);
            setClaims(data);
        } catch (error) {
            console.error('Failed to load claims:', error);
            showToast('Failed to load claim requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (claim: ProductClaim) => {
        setSelectedClaim(claim);
        setViewLoading(true);
        try {
            const product = await getProductById(claim.product_id);
            setSelectedProduct(product);
        } catch (error) {
            console.error('Failed to fetch product:', error);
            showToast('Could not load product details', 'error');
        } finally {
            setViewLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!user) return;

        setConfirmConfig({
            isOpen: true,
            title: 'Approve Claim',
            message: 'Are you sure you want to approve this claim? The user will become the owner of the product and will be able to manage its details.',
            confirmLabel: 'Approve',
            type: 'success',
            onConfirm: async () => {
                setProcessingId(id);
                try {
                    await approveClaim(id, user.uid);
                    showToast('Claim approved successfully', 'success');
                    setSelectedClaim(null);
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                    loadClaims();
                } catch (error) {
                    console.error('Approve error:', error);
                    showToast('Failed to approve claim', 'error');
                } finally {
                    setProcessingId(null);
                }
            }
        });
    };

    const handleReject = async (id: string) => {
        if (!user) return;

        setConfirmConfig({
            isOpen: true,
            title: 'Reject Claim',
            message: 'Are you sure you want to reject this claim? This action will notify the user that their request was not successful.',
            confirmLabel: 'Reject',
            type: 'danger',
            onConfirm: async () => {
                setProcessingId(id);
                try {
                    await rejectClaim(id, user.uid);
                    showToast('Claim rejected', 'info');
                    setSelectedClaim(null);
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                    loadClaims();
                } catch (error) {
                    console.error('Reject error:', error);
                    showToast('Failed to reject claim', 'error');
                } finally {
                    setProcessingId(null);
                }
            }
        });
    };

    if (!isAdmin) return <div style={{ padding: '2rem' }}>Access Denied</div>;

    return (
        <div className={styles.mainCol}>
            <section className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <h1>Product Ownership Claims</h1>
                    <p>Review and process requests from users claiming existing R&D products.</p>
                </div>
            </section>

            <section className={styles.contentCard}>
                <div className={styles.tableContainer}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading claims...</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>PRODUCT</th>
                                    <th>REQUESTER</th>
                                    <th>DATE</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {claims.map((claim) => (
                                    <tr key={claim.id}>
                                        <td style={{ fontWeight: 600 }}>{claim.product_name}</td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{claim.requester_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{claim.requester_email}</div>
                                        </td>
                                        <td>{claim.createdAt?.toDate ? claim.createdAt.toDate().toLocaleDateString() : 'Pending'}</td>
                                        <td>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: claim.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' :
                                                    claim.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' :
                                                        'rgba(251, 191, 36, 0.1)',
                                                color: claim.status === 'approved' ? '#22c55e' :
                                                    claim.status === 'rejected' ? '#ef4444' :
                                                        '#fbbf24'
                                            }}>
                                                {claim.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => handleView(claim)}
                                                    style={{
                                                        background: 'var(--surface-highlight)',
                                                        color: 'white',
                                                        border: '1px solid var(--border)',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    View
                                                </button>
                                                {claim.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => handleApprove(claim.id)}
                                                            disabled={!!processingId}
                                                            style={{
                                                                background: '#22c55e',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.75rem',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(claim.id)}
                                                            disabled={!!processingId}
                                                            style={{
                                                                background: '#ef4444',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.75rem',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {claims.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>No claim requests found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* Claim Detail Modal */}
            <Modal
                isOpen={!!selectedClaim}
                onClose={() => {
                    setSelectedClaim(null);
                    setSelectedProduct(null);
                }}
                title="Claim Details"
                footer={(
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', width: '100%' }}>
                        <button
                            className={styles.btnSecondary}
                            onClick={() => {
                                setSelectedClaim(null);
                                setSelectedProduct(null);
                            }}
                        >
                            Close
                        </button>
                        {selectedClaim?.status === 'pending' && (
                            <>
                                <button
                                    className={styles.btnPrimary}
                                    onClick={() => handleReject(selectedClaim.id)}
                                    disabled={!!processingId}
                                    style={{ background: '#ef4444', borderColor: '#ef4444' }}
                                >
                                    Reject
                                </button>
                                <button
                                    className={styles.btnPrimary}
                                    onClick={() => handleApprove(selectedClaim.id)}
                                    disabled={!!processingId}
                                    style={{ background: '#22c55e', borderColor: '#22c55e' }}
                                >
                                    Approve
                                </button>
                            </>
                        )}
                    </div>
                )}
            >
                {selectedClaim && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Requester Information</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Full Name</div>
                                    <div style={{ fontWeight: 600 }}>{selectedClaim.requester_name}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Email</div>
                                    <div style={{ fontWeight: 600 }}>{selectedClaim.requester_email}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>User ID</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{selectedClaim.requester_id}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Request Date</div>
                                    <div style={{ fontWeight: 600 }}>{selectedClaim.createdAt?.toDate ? selectedClaim.createdAt.toDate().toLocaleString() : 'N/A'}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Product Information</h4>
                            {viewLoading ? (
                                <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Loading product data...</div>
                            ) : selectedProduct ? (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ width: '100px', height: '100px', borderRadius: '8px', background: 'var(--surface-highlight)', overflow: 'hidden', flexShrink: 0 }}>
                                        {selectedProduct.image_url ? (
                                            <img src={selectedProduct.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{selectedProduct.product_name}</div>
                                        <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>{selectedProduct.company_name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {selectedProduct.product_description}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem' }}>
                                    Original product data could not be found or may have been removed.
                                </div>
                            )}
                        </div>

                        {selectedClaim.status !== 'pending' && (
                            <div style={{ padding: '1rem', background: selectedClaim.status === 'approved' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid currentColor', opacity: 0.8 }}>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Processing Info</div>
                                <div style={{ fontSize: '0.85rem' }}>
                                    Status: <strong style={{ color: selectedClaim.status === 'approved' ? '#22c55e' : '#ef4444' }}>{selectedClaim.status.toUpperCase()}</strong>
                                </div>
                                <div style={{ fontSize: '0.85rem' }}>
                                    Processed At: {selectedClaim.processedAt?.toDate ? selectedClaim.processedAt.toDate().toLocaleString() : 'N/A'}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmLabel={confirmConfig.confirmLabel}
                type={confirmConfig.type}
                loading={!!processingId}
            />
        </div>
    );
}
