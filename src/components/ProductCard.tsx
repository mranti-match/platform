'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/products';
import styles from './ProductCard.module.css';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const rawCategories = Array.isArray(product.category) ? product.category : product.category ? [product.category] : [];
    // Truncate categories by comma and take the first part
    const categories = rawCategories.map(cat => {
        if (typeof cat !== 'string') return cat;
        let processed = cat.split(',')[0].trim();
        // Special case for IT/BPO
        if (processed === "Information Technology (IT) and Business Process Outsourcing (BPO)") {
            return "Information Technology (IT)";
        }
        return processed;
    });

    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.product_name}
                        fill
                        className={styles.image}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <span>R&D Product</span>
                    </div>
                )}
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{product.product_name}</h3>
                <div className={styles.tags}>
                    {categories.slice(0, 2).map((cat, i) => (
                        <span key={i} className={styles.categoryTag}>{cat}</span>
                    ))}
                    {product.program && (
                        <span className={styles.programTag}>{product.program}</span>
                    )}
                </div>
                <p className={styles.description}>
                    {product.product_description?.length > 120
                        ? `${product.product_description.substring(0, 120)}...`
                        : product.product_description}
                </p>

                <div className={styles.footer}>
                    <div className={styles.companyInfo}>
                        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 21h18M3 7v1a3 3 0 006 0V7m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2m0 0h6v1a3 3 0 01-6 0V7" />
                        </svg>
                        <span className={styles.companyName}>{product.company_name}</span>
                    </div>
                    <Link href={`/rd-products/${product.id}`} className={styles.viewLink}>
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}
