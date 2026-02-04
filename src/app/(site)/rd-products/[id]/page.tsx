'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Product, getProductById } from '@/lib/products';
import styles from './ProductDetails.module.css';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            async function loadProduct() {
                const data = await getProductById(params.id as string);
                setProduct(data);
                setLoading(false);
            }
            loadProduct();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className={styles.loadingWrapper}>
                <div className={styles.spinner}></div>
                <p>Loading Product Details...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.errorWrapper}>
                <h2>Product Not Found</h2>
                <p>The product you are looking for might have been moved or removed.</p>
                <Link href="/rd-products" className={styles.backBtn}>Back to Catalog</Link>
            </div>
        );
    }

    const categories = Array.isArray(product.category) ? product.category : product.category ? [product.category] : [];

    return (
        <div className={styles.pageWrapper}>
            <div className="container">
                <button onClick={() => router.back()} className={styles.backLink}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Products
                </button>

                <div className={styles.header}>
                    <h1 className={styles.title}>{product.product_name}</h1>
                    <span className={styles.subLabel}>R&D Product Details</span>
                </div>

                <div className={styles.mainImageWrapper}>
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.product_name}
                            fill
                            className={styles.mainImage}
                            priority
                        />
                    ) : (
                        <div className={styles.imagePlaceholder}>
                            <span>No Preview Available</span>
                        </div>
                    )}
                </div>

                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 21h18M3 7v1a3 3 0 006 0V7m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2m0 0h6v1a3 3 0 01-6 0V7" />
                                </svg>
                            </div>
                            <div className={styles.infoText}>
                                <label>Company Name</label>
                                <span>{product.company_name}</span>
                            </div>
                        </div>

                        {product.company_email && (
                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <path d="M22 6l-10 7L2 6" />
                                    </svg>
                                </div>
                                <div className={styles.infoText}>
                                    <label>Business Email</label>
                                    <a href={`mailto:${product.company_email}`}>{product.company_email}</a>
                                </div>
                            </div>
                        )}

                        {product.company_address && (
                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <div className={styles.infoText}>
                                    <label>Business Address</label>
                                    <span>{product.company_address}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
                                </svg>
                            </div>
                            <div className={styles.infoText}>
                                <label>Category</label>
                                <div className={styles.categoryList}>
                                    {categories.map((cat, i) => (
                                        <span key={i}>{cat}{i < categories.length - 1 ? ', ' : ''}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {product.program && (
                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                </div>
                                <div className={styles.infoText}>
                                    <label>Programme</label>
                                    <span>{product.program}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.descriptionSection}>
                    <h2>Product Description</h2>
                    <p>{product.product_description}</p>
                </div>
            </div>
        </div>
    );
}
