'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '../components/AdminProvider';
import { BlogPost, deletePost, getAllPosts } from '@/lib/posts';
import styles from '../admin.module.css';

export default function PostsPage() {
    const { role, loading: authLoading } = useAdmin();
    const router = useRouter();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!authLoading && role !== 'Super Admin') {
            router.push('/admin');
            return;
        }
        if (!authLoading) {
            loadPosts();
        }
    }, [authLoading, role]);

    async function loadPosts() {
        setLoading(true);
        try {
            const postsData = await getAllPosts();
            setPosts(postsData);
        } catch (error) {
            console.error('Failed to load posts:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string, title: string) {
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                await deletePost(id);
                setPosts(posts.filter(p => p.id !== id));
            } catch (error) {
                alert('Failed to delete post.');
                console.error(error);
            }
        }
    }

    // Filter posts based on search
    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.mainCol}>
            <section className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <h1>Insights</h1>
                    <p>Manage your professional insights published on the platform.</p>
                </div>
                <Link href="/admin/posts/new" className={styles.btnNewPost}>
                    <span>+</span> New Insight
                </Link>
            </section>

            <section className={styles.contentCard}>
                <div className={styles.cardHeader} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <h2 style={{ margin: 0 }}>All Insights</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input
                            type="text"
                            placeholder="Search insights..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.6rem 1rem 0.6rem 2.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                background: 'var(--surface-highlight)',
                                color: 'white',
                                fontSize: '0.875rem'
                            }}
                        />
                        <svg
                            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                </div>
                <div className={styles.tableContainer}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading insights...</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}><input type="checkbox" /></th>
                                    <th>TITLE</th>
                                    <th>DATE</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPosts.map((post) => (
                                    <tr key={post.id}>
                                        <td><input type="checkbox" /></td>
                                        <td className={styles.postTitleCell}>{post.title}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>Published</div>
                                            <div style={{ fontSize: '0.75rem' }}>{new Date(post.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Link href={`/admin/posts/edit/${post.id}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>Edit</Link>
                                                <span style={{ color: 'var(--border)' }}>|</span>
                                                <button
                                                    onClick={() => handleDelete(post.id, post.title)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPosts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '3rem' }}>
                                            {searchQuery ? `No insights matching "${searchQuery}"` : 'No insights found.'}
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
