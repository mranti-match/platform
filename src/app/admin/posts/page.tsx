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
                <div className={styles.cardHeader}>
                    <h2>All Insights</h2>
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
                                {posts.map((post) => (
                                    <tr key={post.id}>
                                        <td><input type="checkbox" /></td>
                                        <td className={styles.postTitleCell}>{post.title}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>Published</div>
                                            <div style={{ fontSize: '0.75rem' }}>{new Date(post.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Link href={`/admin/posts/edit/${post.id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>Edit</Link>
                                                <span style={{ color: 'var(--border)' }}>|</span>
                                                <button
                                                    onClick={() => handleDelete(post.id, post.title)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {posts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '3rem' }}>
                                            No insights found. <Link href="/admin/posts/new" style={{ color: 'var(--primary)' }}>Create your first insight.</Link>
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
