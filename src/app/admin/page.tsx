'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdmin } from './components/AdminProvider';
import { RDProduct, getAllProducts } from '@/lib/rd-products';
import { Proposal, getAllProposals } from '@/lib/proposals';
import { getAllProblemStatements, ProblemStatement } from '@/lib/problem-statements';
import { auth } from '@/lib/firebase';
import {
    getDailyStats,
    getCountryStats,
    getTopPosts,
    DailyStats,
    CountryStat,
    PostView
} from '@/lib/analytics';
import { VisitorChart, CountryStats, TopPostsList } from './components/AnalyticsCharts';
import styles from './admin.module.css';
import Modal from '@/components/Modal';
import modalStyles from '@/components/Modal.module.css';
import { getDirectCloudImageUrl } from '@/lib/imageUtils';

export default function AdminPage() {
    const { user, role, profile, loading: authLoading } = useAdmin();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        posts: 0,
        categories: 0,
        views: '0'
    });
    const [analytics, setAnalytics] = useState<{
        daily: DailyStats[];
        countries: CountryStat[];
        topPosts: PostView[];
    }>({
        daily: [],
        countries: [],
        topPosts: []
    });

    const [userProducts, setUserProducts] = useState<RDProduct[]>([]);
    const [userProposals, setUserProposals] = useState<Proposal[]>([]);
    const [allProblems, setAllProblems] = useState<ProblemStatement[]>([]);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

    const isAdmin = role === 'Super Admin' || role === 'Admin';

    useEffect(() => {
        if (!authLoading && user) {
            loadDashboardData();
        }
    }, [user, authLoading, role]);

    async function loadDashboardData() {
        setLoading(true);
        console.log("Dashboard: Starting data fetch for", user?.email, "as", role);
        try {
            // Fetch products and proposals
            const [products, proposals, problems] = await Promise.all([
                getAllProducts(isAdmin, isAdmin ? undefined : user?.uid),
                getAllProposals(isAdmin, isAdmin ? undefined : user?.uid),
                getAllProblemStatements()
            ]).catch(err => {
                console.error("Dashboard: One or more primary queries failed critically:", err);
                throw err;
            });

            console.log(`Dashboard: Loaded ${products.length} products and ${proposals.length} proposals.`);
            setUserProducts(products);
            setUserProposals(proposals);
            setAllProblems(problems);

            if (isAdmin) {
                try {
                    console.log("Dashboard: Fetching admin analytics...");
                    const [postsData, daily, countries, top] = await Promise.all([
                        import('@/lib/posts').then(m => m.getAllPosts()),
                        getDailyStats(),
                        getCountryStats(),
                        getTopPosts(5)
                    ]);

                    const totalViews = daily.reduce((acc, curr) => acc + curr.visits, 0);
                    setStats({
                        posts: postsData.length,
                        categories: 0,
                        views: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews.toString()
                    });

                    setAnalytics({ daily, countries, topPosts: top });
                    console.log("Dashboard: Analytics loaded.");
                } catch (analyticsErr) {
                    console.error("Dashboard: Analytics fetch failed (check security rules for analytics/post_views):", analyticsErr);
                }
            }
        } catch (error: any) {
            console.error('Dashboard: Data load error:', error.message || error);
            if (error.code === 'permission-denied') {
                console.error('CRITICAL: Firestore rejected a query. Check firestore.rules for admin permissions.');
            }
        } finally {
            setLoading(false);
        }
    }

    if (authLoading || loading) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;

    if (role === 'Admin') {
        const approvedCount = userProposals.filter(p => p.status === 'Approved').length;
        const rejectedCount = userProposals.filter(p => p.status === 'Rejected').length;

        return (
            <div className={styles.innovatorDashboard}>
                <header className={styles.dashboardHeader}>
                    <div className={styles.headerTitle}>
                        <h1>Welcome back, {profile?.displayName || 'Admin'}</h1>
                        <p>Manage your R&D products and innovations</p>
                    </div>
                </header>

                <div className={styles.simpleStatsGrid}>
                    <div className={styles.simpleStatBox}>
                        <span className={styles.statLabel}>Applications Evaluated</span>
                        <span className={styles.statValue}>
                            {userProposals.filter(p => {
                                const approver = p.approved_by?.toString();
                                if (!approver) return false;

                                const myUid = user?.uid;
                                const myEmail = user?.email;

                                return approver === myUid ||
                                    approver === myEmail ||
                                    approver.toLowerCase() === myEmail?.toLowerCase();
                            }).length}
                        </span>
                        <span className={styles.statSubValue}>Total decisions made</span>
                    </div>

                    <div className={styles.simpleStatBox}>
                        <span className={styles.statLabel}>Approved & Rejected</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                            <span className={`${styles.statValue} ${styles.statGreen}`}>
                                {userProposals.filter(p => {
                                    if (p.status !== 'Approved') return false;
                                    const approver = p.approved_by?.toString();
                                    if (!approver) return false;

                                    const myUid = user?.uid;
                                    const myEmail = user?.email;

                                    return approver === myUid ||
                                        approver === myEmail ||
                                        approver.toLowerCase() === myEmail?.toLowerCase();
                                }).length}
                            </span>
                            <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>/</span>
                            <span className={`${styles.statValue} ${styles.statRed}`}>
                                {userProposals.filter(p => {
                                    if (p.status !== 'Rejected') return false;
                                    const approver = p.approved_by?.toString();
                                    if (!approver) return false;

                                    const myUid = user?.uid;
                                    const myEmail = user?.email;

                                    return approver === myUid ||
                                        approver === myEmail ||
                                        approver.toLowerCase() === myEmail?.toLowerCase();
                                }).length}
                            </span>
                        </div>
                        <span className={styles.statSubValue}>Your evaluation history</span>
                    </div>

                    <div className={styles.simpleStatBox}>
                        <span className={styles.statLabel}>Pending Evaluation</span>
                        <span className={styles.statValue}>{userProposals.filter(p => p.status === 'Pending').length}</span>
                        <span className={styles.statSubValue}>Awaiting your review</span>
                    </div>
                </div>

                <div className={styles.contentCard} style={{ marginTop: '2.5rem' }}>
                    <div className={styles.cardHeader}>
                        <h2>My Approved Proposals</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>Proposals you have approved for commercialisation.</p>
                    </div>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>PROJECT TITLE</th>
                                    <th>STAKEHOLDER</th>
                                    <th>DATE APPROVED</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userProposals.filter(p => {
                                    if (p.status !== 'Approved') return false;
                                    const approver = p.approved_by?.toString();
                                    if (!approver) return false;

                                    const myUid = user?.uid;
                                    const myEmail = user?.email;

                                    return approver === myUid ||
                                        approver === myEmail ||
                                        approver.toLowerCase() === myEmail?.toLowerCase();
                                }).map(proposal => (
                                    <tr key={proposal.id}>
                                        <td className={styles.postTitleCell}>
                                            <div style={{ fontWeight: 600 }}>{proposal.project_title}</div>
                                        </td>
                                        <td>{proposal.owner_email}</td>
                                        <td>{proposal.createdAt?.seconds ? new Date(proposal.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                        <td>
                                            <button
                                                onClick={() => setSelectedProposal(proposal)}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                            >
                                                View Detail
                                            </button>
                                            <span style={{ margin: '0 0.5rem', color: 'var(--border)' }}>|</span>
                                            <Link
                                                href={`/admin/reports/${proposal.id}`}
                                                style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                                            >
                                                Report
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {userProposals.filter(p => {
                                    if (p.status !== 'Approved') return false;
                                    const approver = p.approved_by?.toString();
                                    if (!approver) return false;

                                    const myUid = user?.uid;
                                    const myEmail = user?.email;

                                    return approver === myUid ||
                                        approver === myEmail ||
                                        approver.toLowerCase() === myEmail?.toLowerCase();
                                }).length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--foreground-muted)' }}>
                                                You haven't approved any proposals yet.
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {selectedProposal && (
                    <Modal
                        isOpen={!!selectedProposal}
                        onClose={() => setSelectedProposal(null)}
                        title="Proposal Detail"
                    >
                        <div className={modalStyles.content}>
                            <div className={modalStyles.detailRow}>
                                <div className={modalStyles.detailLabel}>Project Title</div>
                                <div className={modalStyles.detailValue}>{selectedProposal.project_title}</div>
                            </div>
                            <div className={modalStyles.detailRow}>
                                <div className={modalStyles.detailLabel}>Product</div>
                                <div className={modalStyles.detailValue}>{selectedProposal.product_name}</div>
                            </div>
                            <div className={modalStyles.detailRow}>
                                <div className={modalStyles.detailLabel}>Problem Statement</div>
                                <div className={modalStyles.detailValue}>{selectedProposal.problem_statement_title}</div>
                            </div>
                            <div className={modalStyles.detailRow}>
                                <div className={modalStyles.detailLabel}>Status</div>
                                <div className={modalStyles.detailValue}>
                                    <span className={modalStyles.statusBadge} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                        {selectedProposal.status}
                                    </span>
                                </div>
                            </div>
                            <div className={modalStyles.detailRow} style={{ marginTop: '1.5rem' }}>
                                <div className={modalStyles.detailLabel}>Description</div>
                                <div className={modalStyles.detailValue}>{selectedProposal.description}</div>
                            </div>
                            <div className={modalStyles.detailRow}>
                                <div className={modalStyles.detailLabel}>Impact Outcomes</div>
                                <div className={modalStyles.detailValue}>{selectedProposal.impact_outcomes || 'N/A'}</div>
                            </div>
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <Link
                                    href={`/admin/proposals/${selectedProposal.id}`}
                                    className={styles.viewAllLink}
                                    style={{ color: 'var(--primary)', fontWeight: 600 }}
                                >
                                    Go to Full Proposal Page →
                                </Link>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        );
    }

    if (role === 'User') {
        const joinDate = profile?.createdAt?.seconds
            ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })
            : 'N/A';

        return (
            <div className={styles.innovatorDashboard}>
                <header className={styles.dashboardHeader}>
                    <div className={styles.headerTitle}>
                        <h1>Welcome back, {profile?.displayName || 'Innovator'}</h1>
                        <p>Manage your R&D products and innovations</p>
                    </div>
                </header>

                <div className={styles.modernSectionHeader}>
                    <h2>My Products</h2>
                    <Link href="/admin/products" className={styles.viewAllLink}>View All</Link>
                </div>

                {userProducts.length > 0 ? (
                    <div className={styles.cardGrid}>
                        {userProducts.map(product => (
                            <Link key={product.id} href={`/admin/products/profile/${product.id}`} className={styles.userCard}>
                                <div className={styles.cardImage} style={{ position: 'relative' }}>
                                    {product.cover_image ? (
                                        <>
                                            <img
                                                src={getDirectCloudImageUrl(product.cover_image)}
                                                alt={product.product_name}
                                                referrerPolicy="no-referrer"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    const img = e.currentTarget;
                                                    // Fallback path: If converted URL fails, try original URL
                                                    if (img.src !== product.cover_image) {
                                                        img.src = product.cover_image;
                                                    } else {
                                                        img.style.display = 'none';
                                                        const placeholder = img.nextElementSibling as HTMLElement;
                                                        if (placeholder) placeholder.style.display = 'flex';
                                                    }
                                                }}
                                            />
                                            <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-highlight)' }}>
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.2 }}>
                                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                                                </svg>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-highlight)' }}>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.2 }}>
                                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.cardTitle}>{product.product_name}</h3>
                                    <div className={styles.industryList}>
                                        {product.impact_industries?.slice(0, 2).map(ind => (
                                            <span key={ind} className={styles.tagBadge}>{ind}</span>
                                        ))}
                                    </div>
                                    <p className={styles.cardDescription}>
                                        {product.description || 'No description provided.'}
                                    </p>
                                </div>
                                <div className={styles.viewDetailsLink}>
                                    View Details
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className={styles.modernEmptyState}>
                        <div className={styles.emptyIconCircle}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21h6"></path><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2v1"></path><path d="M12 7v5"></path><path d="M12 15h.01"></path><path d="M12 3a9 9 0 0 0-9 9c0 2.48 1.01 4.72 2.64 6.34L7 21h10l1.36-2.66c1.63-1.62 2.64-3.86 2.64-6.34a9 9 0 0 0-9-9Z"></path></svg>
                        </div>
                        <div className={styles.emptyContent}>
                            <h3 className={styles.emptyTitle}>No products yet</h3>
                            <p className={styles.emptyDesc}>Start showcasing your innovations by adding your first product</p>
                            <Link href="/admin/products/new" className={styles.btnPrimaryModern}>
                                + Add Your First Product
                            </Link>
                        </div>
                    </div>
                )}

                {/* Proposals Section */}
                <div className={styles.modernSectionHeader} style={{ marginTop: '4rem' }}>
                    <h2>My Submitted Proposals</h2>
                    <Link href="/admin/proposals" className={styles.viewAllLink}>View All</Link>
                </div>

                {userProposals.length > 0 ? (
                    <div className={styles.cardGrid}>
                        {userProposals.slice(0, 4).map(proposal => {
                            const problem = allProblems.find(p => p.id === proposal.problem_statement_id);
                            const imageUrl = problem?.image_url || proposal.problem_image_url;

                            return (
                                <Link key={proposal.id} href={`/admin/proposals/${proposal.id}`} className={styles.userCard}>
                                    <div className={styles.cardImage} style={{ position: 'relative' }}>
                                        {imageUrl ? (
                                            <>
                                                <img
                                                    src={getDirectCloudImageUrl(imageUrl)}
                                                    alt={proposal.project_title}
                                                    referrerPolicy="no-referrer"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        const img = e.currentTarget;
                                                        // Fallback path: If converted URL fails, try original URL
                                                        if (img.src !== imageUrl) {
                                                            img.src = imageUrl;
                                                        } else {
                                                            img.style.display = 'none';
                                                            const placeholder = img.nextElementSibling as HTMLElement;
                                                            if (placeholder) {
                                                                placeholder.style.display = 'flex';
                                                            }
                                                        }
                                                    }}
                                                />
                                                <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-highlight)' }}>
                                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                    </svg>
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-highlight)' }}>
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.cardTitle}>{proposal.project_title}</h3>
                                        <p className={styles.cardDescription}>
                                            {proposal.description || 'No description provided.'}
                                        </p>
                                        <div className={styles.cardMeta}>
                                            <span className={`${styles.statusBadge} ${proposal.status === 'Approved' ? styles.statusPublished : styles.statusDraft}`} style={{ fontSize: '0.65rem' }}>
                                                {proposal.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.viewDetailsLink}>
                                        View Details
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        No proposals submitted yet.
                    </div>
                )}
            </div>
        );
    }

    // Super Admin Analytical View (Default)
    return (
        <div className={styles.dashboardGrid}>
            <div className={styles.mainCol}>
                <section className={styles.welcomeSection}>
                    <div className={styles.welcomeText}>
                        <h1>Welcome back, {profile?.displayName || 'Super Admin'}.</h1>
                        <p>Managing the R&D Commercialisation Portal as <strong>{user?.email}</strong>.</p>
                    </div>
                    <Link href="/admin/posts/new" className={styles.btnNewPost}>
                        <span>+</span> New Insight
                    </Link>
                </section>

                <section className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </div>
                            <span className={styles.statTrend}>Live</span>
                        </div>
                        <div className={styles.statValue}>{stats.views}</div>
                        <div className={styles.statLabel}>Total Views</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <span className={styles.statTrendMuted}>Insights</span>
                        </div>
                        <div className={styles.statValue}>{stats.posts}</div>
                        <div className={styles.statLabel}>Published Insights</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            <span className={styles.statTrendMuted}>Users</span>
                        </div>
                        <div className={styles.statValue}>-</div>
                        <div className={styles.statLabel}>Active Stakeholders</div>
                    </div>
                </section>

                <div style={{ marginTop: '2.5rem' }}>
                    <VisitorChart data={analytics.daily} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2.5rem', marginTop: '2.5rem' }}>
                    <CountryStats data={analytics.countries} />
                    <TopPostsList data={analytics.topPosts} />
                </div>
            </div>
        </div>
    );
}
