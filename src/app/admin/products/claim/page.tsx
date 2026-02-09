'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '../../components/AdminProvider';
import { useToast } from '../../components/ToastProvider';
import { getAllProducts, Product } from '@/lib/products';
import { createClaimRequest } from '@/lib/product-claims';
import Modal from '@/components/Modal';
import styles from '../../admin.module.css';

export default function ClaimProductPage() {
    const { user, profile } = useAdmin();
    const { showToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const data = await getAllProducts();
                setProducts(data);
            } catch (error) {
                console.error('Failed to load products:', error);
                showToast('Failed to load products', 'error');
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        (p.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.product_description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.company_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClaimClick = () => {
        setShowConfirmModal(true);
    };

    const handleConfirmClaim = async () => {
        if (!user || !selectedProduct) return;

        setIsSubmitting(true);
        try {
            await createClaimRequest({
                product_id: selectedProduct.id,
                product_name: selectedProduct.product_name,
                requester_id: user.uid,
                requester_name: profile?.fullName || profile?.displayName || user.displayName || 'Unnamed User',
                requester_email: user.email || '',
            });
            showToast('Claim request submitted successfully!', 'success');
            setShowConfirmModal(false);
            setSelectedProduct(null);
        } catch (error) {
            console.error('Failed to submit claim:', error);
            showToast('Failed to submit claim request', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.mainCol}>
            <section className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <h1>Claim Your Product</h1>
                    <p>Search for your existing R&D product in our catalog to claim ownership.</p>
                </div>
            </section>

            <section className={styles.contentCard}>
                <div className={styles.cardHeader} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input
                            type="text"
                            placeholder="Search by product name or description keyword..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem 1rem 0.8rem 3rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                background: 'var(--surface-highlight)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                        <svg
                            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
                            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading catalog...</div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    className={styles.productItem}
                                    onClick={() => setSelectedProduct(product)}
                                    style={{
                                        background: 'var(--surface-highlight)',
                                        borderRadius: '12px',
                                        padding: '1.25rem',
                                        border: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem'
                                    }}
                                >
                                    <div style={{
                                        width: '100%',
                                        height: '160px',
                                        borderRadius: '8px',
                                        background: '#18181b',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {product.image_url ? (
                                            <img src={product.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.2 }}>
                                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'white' }}>{product.product_name}</h3>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '0.85rem',
                                            color: 'var(--foreground-muted)',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {product.product_description}
                                        </p>
                                    </div>
                                    <div style={{
                                        marginTop: 'auto',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: 'var(--primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span>{product.company_name}</span>
                                        <span style={{ opacity: 0.7 }}>View Details &rarr;</span>
                                    </div>
                                </div>
                            ))}
                            {filteredProducts.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                                    No products found matching your search.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Product Detail Modal */}
            <Modal
                isOpen={!!selectedProduct && !showConfirmModal}
                onClose={() => setSelectedProduct(null)}
                title="Product Details"
                footer={(
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', width: '100%' }}>
                        <button
                            className={styles.btnSecondary}
                            onClick={() => setSelectedProduct(null)}
                            style={{ padding: '0.6rem 1.2rem' }}
                        >
                            Close
                        </button>
                        <button
                            className={styles.btnPrimary}
                            onClick={handleClaimClick}
                            style={{
                                padding: '0.6rem 1.2rem',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Is this your product?
                        </button>
                    </div>
                )}
            >
                {selectedProduct && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ width: '100%', height: '240px', borderRadius: '8px', overflow: 'hidden', background: '#18181b' }}>
                            {selectedProduct.image_url ? (
                                <img src={selectedProduct.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{selectedProduct.product_name}</h3>
                            <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '1rem' }}>{selectedProduct.company_name}</div>
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', lineHeight: '1.6' }}>
                                {selectedProduct.product_description}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</div>
                                <div style={{ fontWeight: 500 }}>{Array.isArray(selectedProduct.category) ? selectedProduct.category.join(', ') : selectedProduct.category || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Program</div>
                                <div style={{ fontWeight: 500 }}>{selectedProduct.program || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Claim Ownership"
                footer={(
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', width: '100%' }}>
                        <button
                            className={styles.btnSecondary}
                            onClick={() => setShowConfirmModal(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            className={styles.btnPrimary}
                            onClick={handleConfirmClaim}
                            disabled={isSubmitting}
                            style={{ background: '#22c55e', borderColor: '#22c55e' }}
                        >
                            {isSubmitting ? 'Submitting...' : 'Confirm Claim'}
                        </button>
                    </div>
                )}
            >
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                    </div>
                    <h3 style={{ marginBottom: '1rem' }}>Submit Claim Request?</h3>
                    <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.6' }}>
                        You are applying to claim ownership of <strong>{selectedProduct?.product_name}</strong>.
                        Our administrators will review your request and verify your information.
                    </p>
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(255,165,0,0.1)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#fbbf24',
                        textAlign: 'left'
                    }}>
                        <strong>Note:</strong> Once approved, this product will be added to your account's R&D Product list, allowing you to manage and update its details.
                    </div>
                </div>
            </Modal>
        </div>
    );
}
