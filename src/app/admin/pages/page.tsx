'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StaticPage, getAllPages, deletePage } from '@/lib/pages';
import adminStyles from '../admin.module.css';

export default function PagesManager() {
    const [pages, setPages] = useState<StaticPage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPages();
    }, []);

    async function loadPages() {
        setLoading(true);
        try {
            const data = await getAllPages();
            setPages(data);
        } catch (error) {
            console.error('Failed to load pages:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this page?')) {
            try {
                await deletePage(id);
                setPages(pages.filter(p => p.id !== id));
            } catch (error) {
                console.error('Failed to delete page:', error);
                alert('Error deleting page.');
            }
        }
    };

    return (
        <div className={adminStyles.container}>
            <div className={adminStyles.sectionHeader}>
                <h2 className={adminStyles.sectionTitle}>Static Pages</h2>
                <Link href="/admin/pages/new" className={adminStyles.btnNewPost}>
                    + New Page
                </Link>
            </div>

            <div className={adminStyles.tableContainer}>
                <table className={adminStyles.table}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Slug</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading pages...</td></tr>
                        ) : pages.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No pages found.</td></tr>
                        ) : (
                            pages.map((page) => (
                                <tr key={page.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{page.title}</div>
                                    </td>
                                    <td>
                                        <code style={{ fontSize: '0.8rem', opacity: 0.7 }}>/{page.slug}</code>
                                    </td>
                                    <td>
                                        <span className={`${adminStyles.status} ${page.status === 'published' ? adminStyles.statusPublished : adminStyles.statusDraft}`}>
                                            {page.status}
                                        </span>
                                    </td>
                                    <td>{new Date(page.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className={adminStyles.actions}>
                                            <Link href={`/admin/pages/edit/${page.id}`} className={adminStyles.btnEdit}>
                                                Edit
                                            </Link>
                                            <button onClick={() => handleDelete(page.id)} className={adminStyles.btnDelete}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
