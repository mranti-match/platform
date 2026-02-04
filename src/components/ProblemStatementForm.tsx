'use client';

import { useState, useEffect } from 'react';
import { ProblemStatement } from '@/lib/problem-statements';
import styles from './PostForm.module.css'; // Reuse existing form styles
import RichTextEditor from './RichTextEditor';

interface ProblemStatementFormProps {
    initialData?: ProblemStatement | null;
    onSubmit: (data: Omit<ProblemStatement, 'id' | 'createdAt'>) => Promise<void>;
    loading: boolean;
    title: string;
}

export default function ProblemStatementForm({ initialData, onSubmit, loading, title }: ProblemStatementFormProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        organization: initialData?.organization || '',
        description: initialData?.description || '',
        sector: initialData?.sector || '',
        status: initialData?.status || 'Open' as 'Open' | 'Closed' | 'Draft',
        deadline: initialData?.deadline || '',
        image_url: initialData?.image_url || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                    <button type="submit" className={styles.btnPublish} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Problem Statement'}
                    </button>
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
                            placeholder="Problem Statement Title"
                            required
                        />
                    </div>

                    <div className={styles.editorWrapper}>
                        <RichTextEditor
                            value={formData.description}
                            onChange={(description) => setFormData(prev => ({ ...prev, description }))}
                            placeholder="Describe the challenge or problem statement in detail..."
                        />
                    </div>
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.widget}>
                        <div className={styles.widgetHeader}>Publish</div>
                        <div className={styles.widgetBody}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                >
                                    <option value="Open">Open</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                            <div className={styles.publishActions}>
                                <button type="button" className={styles.btnSaveDraft} onClick={() => setFormData(prev => ({ ...prev, status: 'Draft' }))}>Save Draft</button>
                                <button type="submit" className={styles.btnPublish} disabled={loading}>
                                    {loading ? 'Saving...' : 'Publish'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.widget}>
                        <div className={styles.widgetHeader}>Details</div>
                        <div className={styles.widgetBody}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Organization</label>
                                <input
                                    type="text"
                                    name="organization"
                                    value={formData.organization}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    placeholder="e.g. MRANTI"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Sector</label>
                                <input
                                    type="text"
                                    name="sector"
                                    value={formData.sector}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    placeholder="e.g. Healthcare"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Deadline (Optional)</label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.widget}>
                        <div className={styles.widgetHeader}>Image</div>
                        <div className={styles.widgetBody}>
                            <div className={styles.tagInputBox} style={{ marginBottom: '1rem' }}>
                                <input
                                    type="url"
                                    name="image_url"
                                    placeholder="Paste image URL"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    className={styles.tagInput}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                                />
                            </div>
                            {formData.image_url && (
                                <div className={styles.imagePreview} style={{ marginTop: '0.5rem', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface-highlight)' }}>
                                    <img src={formData.image_url} alt="Problem Statement" style={{ width: '100%', display: 'block' }} />
                                </div>
                            )}
                            <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', marginTop: '0.75rem', lineHeight: '1.4' }}>
                                Provide a direct link to an image that represents this problem statement.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </form>
    );
}
