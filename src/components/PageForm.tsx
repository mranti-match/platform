'use client';

import { useState } from 'react';
import { StaticPage } from '@/lib/pages';
import styles from '@/components/PostForm.module.css';
import RichTextEditor from '@/components/RichTextEditor';

interface PageFormProps {
    initialData?: StaticPage | null;
    onSubmit: (data: Omit<StaticPage, 'id' | 'createdAt'>) => Promise<void>;
    loading: boolean;
    title: string;
}

export default function PageForm({ initialData, onSubmit, loading, title }: PageFormProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        excerpt: initialData?.excerpt || '',
        content: initialData?.content || '',
        status: initialData?.status || 'draft' as const,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'title' && !initialData && !formData.slug) {
            const autoSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, slug: autoSlug }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={styles.header}>
                <h1>{title}</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" className={styles.btnPreview}>Preview</button>
                </div>
            </div>

            <div className={styles.formContainer}>
                <div className={styles.mainCol}>
                    <div className={styles.titleSection}>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={styles.titleInput}
                            placeholder="Add page title"
                            required
                        />
                    </div>

                    <div className={styles.editorWrapper}>
                        <RichTextEditor
                            value={formData.content}
                            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                            placeholder="Enter page content..."
                        />
                    </div>

                    <section className={styles.excerptSection}>
                        <label>Excerpt / Summary</label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            className={styles.excerptTextarea}
                            placeholder="Optional short summary..."
                        />
                    </section>
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.widget}>
                        <div className={styles.widgetHeader}>Publish</div>
                        <div className={styles.widgetBody}>
                            <div className={styles.publishMeta}>
                                <div className={styles.metaRow}>
                                    <span className={styles.metaLabel}>📊 Status:</span>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.publishActions}>
                                <button type="submit" className={styles.btnPublish} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Page'}
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </form>
    );
}
