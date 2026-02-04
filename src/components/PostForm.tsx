'use client';

import { useState, useEffect } from 'react';
import { BlogPost } from '@/lib/posts';
import styles from './PostForm.module.css';
import RichTextEditor from './RichTextEditor';

interface PostFormProps {
    initialData?: BlogPost | null;
    onSubmit: (data: Omit<BlogPost, 'id' | 'createdAt'>) => Promise<void>;
    loading: boolean;
    title: string;
}

export default function PostForm({ initialData, onSubmit, loading, title }: PostFormProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        excerpt: initialData?.excerpt || '',
        content: initialData?.content || '',
        coverImage: initialData?.coverImage || '',
    });
    const [contentSize, setContentSize] = useState(0);
    const [sizeWarning, setSizeWarning] = useState(false);

    useEffect(() => {
        // Estimate payload size (Firestore limit is 1MB)
        const payload = JSON.stringify(formData);
        const size = payload.length;
        setContentSize(size);
        setSizeWarning(size > 800000);
    }, [formData]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'title' && !initialData && !formData.slug) {
            const autoSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, slug: autoSlug }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (contentSize > 1000000) {
            alert(`⚠️ CONTENT TOO LARGE: Your insight is approximately ${(contentSize / (1024 * 1024)).toFixed(2)}MB, which exceeds Firestore's 1MB limit.`);
            return;
        }

        await onSubmit({
            ...formData,
            tags: initialData?.tags || [],
            categories: initialData?.categories || [],
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={styles.header}>
                <h1>{title.replace('Post', 'Insight')}</h1>
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
                            placeholder="Add title"
                            required
                        />
                    </div>

                    <div className={styles.editorWrapper}>
                        {contentSize > 1000000 && (
                            <div className={styles.criticalWarning} style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                fontSize: '0.875rem'
                            }}>
                                <strong>⚠️ Insight Too Large:</strong> You have exceeded the 1MB Firestore limit.
                            </div>
                        )}
                        <RichTextEditor
                            value={formData.content}
                            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                            placeholder="Start writing your awesome story..."
                        />
                    </div>

                    <section className={styles.excerptSection}>
                        <label>Excerpt</label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            className={styles.excerptTextarea}
                            placeholder="Write a short summary..."
                        />
                        <p className={styles.excerptHelp}>
                            Excerpts are optional hand-crafted summaries of your content.
                        </p>
                    </section>
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.widget}>
                        <div className={styles.widgetHeader}>Publish</div>
                        <div className={styles.widgetBody}>
                            <div className={styles.publishActions}>
                                <button type="button" className={styles.btnSaveDraft}>Save Draft</button>
                                <button type="submit" className={styles.btnPublish} disabled={loading || contentSize > 1000000}>
                                    {loading ? 'Saving...' : 'Publish'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.widget}>
                        <div className={styles.widgetHeader}>Featured Image</div>
                        <div className={styles.widgetBody}>
                            <div className={styles.tagInputBox}>
                                <input
                                    type="url"
                                    placeholder="Paste image URL"
                                    value={formData.coverImage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                                    className={styles.tagInput}
                                />
                            </div>
                            {formData.coverImage && (
                                <div className={styles.imagePreview}>
                                    <img src={formData.coverImage} alt="Featured" style={{ width: '100%', borderRadius: '8px' }} />
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </form>
    );
}
