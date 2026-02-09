'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import styles from './admin.module.css';

import AdminProvider, { useAdmin } from './components/AdminProvider';
import ToastProvider from './components/ToastProvider';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, role, loading } = useAdmin();
    const router = useRouter();
    const pathname = usePathname();

    const isSuperAdmin = role === 'Super Admin';
    const isAdmin = isSuperAdmin || role === 'Admin';

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }

        // Force body background to match admin theme to avoid white flashes/margins
        document.body.style.backgroundColor = '#09090b';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, [user, loading, router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (loading) {
        return <div className={styles.layout}><div style={{ margin: 'auto' }}>Loading admin...</div></div>;
    }

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>PM</div>
                    <span className={styles.logoText}>Match</span>
                </div>

                <div className={styles.navSection}>
                    <Link href="/admin" className={pathname === '/admin' ? styles.navItemActive : styles.navItem}>
                        <span className={styles.navIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </span>
                        Dashboard
                    </Link>
                </div>

                <div className={styles.navGroup}>
                    <h3 className={styles.groupTitle}>CONTENT</h3>
                    {isSuperAdmin && (
                        <Link href="/admin/posts" className={pathname.startsWith('/admin/posts') ? styles.navItemActive : styles.navItem}>
                            <span className={styles.navIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </span>
                            Insights
                        </Link>
                    )}
                    <Link href="/admin/problem-statements" className={pathname.startsWith('/admin/problem-statements') ? styles.navItemActive : styles.navItem}>
                        <span className={styles.navIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </span>
                        Problem Statements
                    </Link>
                    <Link href="/admin/products" className={pathname.startsWith('/admin/products') && pathname !== '/admin/products/claim' ? styles.navItemActive : styles.navItem}>
                        <span className={styles.navIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        </span>
                        R&D Products
                    </Link>
                    {!isAdmin && pathname.startsWith('/admin/products') && (
                        <Link href="/admin/products/claim" className={pathname === '/admin/products/claim' ? styles.navItemActive : styles.navItem} style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}>
                            <span className={styles.navIcon}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                            </span>
                            Claim your Product
                        </Link>
                    )}
                    <Link href="/admin/proposals" className={pathname.startsWith('/admin/proposals') ? styles.navItemActive : styles.navItem}>
                        <span className={styles.navIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </span>
                        Collaboration
                    </Link>
                </div>

                {isAdmin && (
                    <div className={styles.navGroup}>
                        <h3 className={styles.groupTitle}>MANAGEMENT</h3>
                        {isSuperAdmin && (
                            <Link href="/admin/users" className={pathname.startsWith('/admin/users') ? styles.navItemActive : styles.navItem}>
                                <span className={styles.navIcon}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </span>
                                Users
                            </Link>
                        )}
                        <Link href="/admin/products/claims" className={pathname.startsWith('/admin/products/claims') ? styles.navItemActive : styles.navItem}>
                            <span className={styles.navIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="m9 12 2 2 4-4" /></svg>
                            </span>
                            Product Claims
                        </Link>
                    </div>
                )}

                <div className={styles.navGroup} style={{ marginTop: 'auto', marginBottom: '0.5rem' }}>
                    <h3 className={styles.groupTitle}>ACCOUNT</h3>
                    <Link href="/admin/profile" className={pathname === '/admin/profile' ? styles.navItemActive : styles.navItem}>
                        <span className={styles.navIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </span>
                        My Profile
                    </Link>
                    <button onClick={handleLogout} className={styles.navItem} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                        <span className={styles.navIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </span>
                        Log Out
                    </button>
                </div>
            </aside>

            <div className={styles.contentArea}>
                <header className={styles.topHeader}>
                    <div className={styles.breadcrumbs}>
                        <span className={styles.breadcrumbItem}>Admin</span>
                        <span className={styles.separator}>/</span>
                        <span className={styles.breadcrumbActive}>
                            {pathname === '/admin' ? 'Dashboard' :
                                pathname.startsWith('/admin/posts') ? 'Insights' :
                                    pathname.startsWith('/admin/problem-statements') ? 'Problem Statements' :
                                        pathname.startsWith('/admin/products') ? 'R&D Products' :
                                            pathname.startsWith('/admin/proposals') ? 'Collaboration' :
                                                pathname.startsWith('/admin/users') ? 'Users' : 'Overview'}
                        </span>
                    </div>

                    <div className={styles.headerActions}>
                        <a href="/" target="_blank" className={styles.viewSiteBtn}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            View Site
                        </a>
                    </div>
                </header>

                <main className={styles.main}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminProvider>
            <ToastProvider>
                <AdminLayoutContent>{children}</AdminLayoutContent>
            </ToastProvider>
        </AdminProvider>
    );
}
