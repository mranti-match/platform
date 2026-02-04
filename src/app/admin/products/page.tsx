'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdmin } from '../components/AdminProvider';
import { getAllProducts, deleteProduct, RDProduct } from '@/lib/rd-products';
import styles from '../admin.module.css';

export default function RDProductsPage() {
    const { user, role, loading: adminLoading } = useAdmin();
    const [products, setProducts] = useState<RDProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = role === 'Admin' || role === 'Super Admin';

    useEffect(() => {
        if (!adminLoading && user) {
            loadProducts();
        }
    }, [user, adminLoading, role]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await getAllProducts(isAdmin, user?.uid);
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await deleteProduct(id);
                setProducts(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                alert('Failed to delete product');
            }
        }
    };

    if (adminLoading) return <div style={{ padding: '2rem' }}>Loading permissions...</div>;

    return (
        <div className={styles.mainCol}>
            <section className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <h1>R&D Products</h1>
                    <p>{isAdmin ? 'Manage all registered commercial products.' : 'Manage your registered R&D products and IPs.'}</p>
                </div>
                <Link href="/admin/products/new" className={styles.btnNewPost}>
                    <span>+</span> New Product
                </Link>
            </section>

            <section className={styles.contentCard}>
                <div className={styles.cardHeader}>
                    <h2>{isAdmin ? 'All Commercial Products' : 'My Products'}</h2>
                </div>
                <div className={styles.tableContainer}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>PRODUCT NAME</th>
                                    <th>ORGANIZATION</th>
                                    <th>SECTOR / IP</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td className={styles.postTitleCell}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'var(--surface-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                                    {product.cover_image ? (
                                                        <img
                                                            src={product.cover_image}
                                                            alt=""
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            referrerPolicy="no-referrer"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.parentElement!.innerHTML = `
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style="opacity: 0.2">
                                                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                                                                    </svg>
                                                                `;
                                                            }}
                                                        />
                                                    ) : (
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.2 }}>
                                                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div style={{ fontWeight: 600 }}>{product.product_name || 'Unnamed Product'}</div>
                                            </div>
                                        </td>
                                        <td>{product.organization}</td>
                                        <td>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                                {product.ip_type}
                                                {product.ip_number ? ` - ${product.ip_number}` : ''}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: 'rgba(34, 197, 94, 0.1)',
                                                color: '#22c55e'
                                            }}>
                                                Active
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Link href={`/admin/products/profile/${product.id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>View Profile</Link>
                                                <span style={{ color: 'var(--border)' }}>|</span>
                                                <Link href={`/admin/products/edit/${product.id}`} style={{ color: 'var(--foreground-muted)', fontWeight: 600 }}>Edit</Link>
                                                <span style={{ color: 'var(--border)' }}>|</span>
                                                <button
                                                    onClick={() => handleDelete(product.id, product.product_name)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                                            No products found. <Link href="/admin/products/new" style={{ color: 'var(--primary)' }}>Register your first R&D product.</Link>
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
