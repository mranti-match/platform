'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product, getAllProducts } from '@/lib/products';
import styles from './page.module.css';

export default function RDProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [categories, setCategories] = useState<string[]>(['All Categories']);

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 6;

    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            const data = await getAllProducts();
            setProducts(data);
            setFilteredProducts(data);

            // Extract unique categories
            const cats = new Set<string>();
            data.forEach(p => {
                const processCategory = (c: any) => {
                    if (typeof c === 'string') {
                        let truncated = c.split(',')[0].trim();
                        if (truncated === "Information Technology (IT) and Business Process Outsourcing (BPO)") {
                            truncated = "Information Technology (IT)";
                        }
                        if (truncated) cats.add(truncated);
                    }
                };

                if (Array.isArray(p.category)) {
                    p.category.forEach(processCategory);
                } else if (p.category) {
                    processCategory(p.category);
                }
            });
            setCategories(['All Categories', ...Array.from(cats).sort()]);
            setLoading(false);
        }
        loadProducts();
    }, []);

    useEffect(() => {
        let filtered = products.filter(p => {
            const name = p.product_name || '';
            const desc = p.product_description || '';
            const company = p.company_name || '';
            const programme = p.program || '';

            const matchesSearch =
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                programme.toLowerCase().includes(searchTerm.toLowerCase());

            const productCategories = Array.isArray(p.category) ? p.category : p.category ? [p.category] : [];
            const processedCategories = productCategories.map(c => {
                if (typeof c !== 'string') return c;
                let truncated = c.split(',')[0].trim();
                if (truncated === "Information Technology (IT) and Business Process Outsourcing (BPO)") {
                    return "Information Technology (IT)";
                }
                return truncated;
            });

            const matchesCategory = selectedCategory === 'All Categories' ||
                processedCategories.includes(selectedCategory);

            return matchesSearch && matchesCategory;
        });
        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset to first page on search/filter
    }, [searchTerm, selectedCategory, products]);

    // Pagination logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <div className="container">
                    <h1 className={styles.title}>R&D Products Showcase</h1>
                    <p className={styles.subtitle}>
                        Discover innovative research and development products from Malaysia&apos;s leading institutions and companies
                    </p>
                </div>
            </header>

            <section className={styles.filtersSection}>
                <div className="container">
                    <div className={styles.searchBar}>
                        <div className={styles.searchInputWrapper}>
                            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search products by title, description, or company..."
                                className={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className={styles.categorySelect}
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.resultsCount}>
                        {loading ? 'Searching products...' : `Showing ${indexOfFirstProduct + 1}-${Math.min(indexOfLastProduct, filteredProducts.length)} of ${filteredProducts.length} products`}
                    </div>

                    {loading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner}></div>
                            <p>Fetching R&D Catalog...</p>
                        </div>
                    ) : currentProducts.length > 0 ? (
                        <>
                            <div className={styles.grid}>
                                {currentProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={styles.pageBtn}
                                    >
                                        &larr; Previous
                                    </button>

                                    <div className={styles.pageNumbers}>
                                        {/* First 3 pages */}
                                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => paginate(i + 1)}
                                                className={`${styles.numberBtn} ${currentPage === i + 1 ? styles.activePage : ''}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}

                                        {/* Middle current page if not in first 3 or last */}
                                        {currentPage > 3 && currentPage < totalPages && (
                                            <>
                                                {currentPage > 4 && <span className={styles.ellipsis}>...</span>}
                                                <button
                                                    onClick={() => paginate(currentPage)}
                                                    className={`${styles.numberBtn} ${styles.activePage}`}
                                                >
                                                    {currentPage}
                                                </button>
                                            </>
                                        )}

                                        {/* Ellipsis before last page */}
                                        {totalPages > 4 && currentPage < totalPages - 1 && (
                                            <span className={styles.ellipsis}>...</span>
                                        )}

                                        {/* Last page */}
                                        {totalPages > 3 && (
                                            <button
                                                onClick={() => paginate(totalPages)}
                                                className={`${styles.numberBtn} ${currentPage === totalPages ? styles.activePage : ''}`}
                                            >
                                                {totalPages}
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={styles.pageBtn}
                                    >
                                        Next &rarr;
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles.noResults}>
                            <h3>No products found</h3>
                            <p>Try refining your search terms or category selection.</p>
                            <button
                                className={styles.resetBtn}
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('All Categories');
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
