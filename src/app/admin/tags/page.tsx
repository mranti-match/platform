'use client';

import { useState, useEffect } from 'react';
import { Taxonomy, getTags, createTag, updateTag, deleteTag, generateSlug } from '@/lib/taxonomy';
import styles from '../taxonomy.module.css';

export default function TagsPage() {
    const [tags, setTags] = useState<Taxonomy[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: ''
    });

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        setLoading(true);
        try {
            const data = await getTags();
            setTags(data);
        } catch (error) {
            console.error('Failed to load tags:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: editingId ? prev.slug : generateSlug(name)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await updateTag(editingId, formData);
            } else {
                await createTag(formData);
            }
            setFormData({ name: '', slug: '', description: '' });
            setEditingId(null);
            await loadTags();
        } catch (error) {
            console.error('Failed to save tag:', error);
            alert('Error saving tag');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (tag: Taxonomy) => {
        setEditingId(tag.id);
        setFormData({
            name: tag.name,
            slug: tag.slug,
            description: tag.description || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await deleteTag(id);
                await loadTags();
            } catch (error) {
                console.error('Failed to delete tag:', error);
            }
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', slug: '', description: '' });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Tags</h1>
            </header>

            <div className={styles.layout}>
                {/* Left Column: Form */}
                <section className={styles.formSection}>
                    <h2>{editingId ? 'Edit Tag' : 'Add New Tag'}</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Name</label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={handleNameChange}
                                className={styles.input}
                                required
                            />
                            <p className={styles.helpText}>The name is how it appears on your site.</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="slug">Slug</label>
                            <input
                                id="slug"
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                className={styles.input}
                                required
                            />
                            <p className={styles.helpText}>The “slug” is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="description">Description (Optional)</label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className={styles.textarea}
                            />
                            <p className={styles.helpText}>The description is not prominent by default; however, some themes may show it.</p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className={styles.btnSubmit} disabled={saving}>
                                {saving ? 'Saving...' : editingId ? 'Update Tag' : 'Add New Tag'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} className={styles.actionBtn}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                {/* Right Column: List */}
                <section className={styles.listSection}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>NAME</th>
                                    <th>DESCRIPTION</th>
                                    <th>SLUG</th>
                                    <th>COUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tags.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center' }}>No tags found.</td>
                                    </tr>
                                ) : (
                                    tags.map((tag) => (
                                        <tr key={tag.id}>
                                            <td>
                                                <div className={styles.taxonomyName}>{tag.name}</div>
                                                <div className={styles.rowActions}>
                                                    <button onClick={() => handleEdit(tag)} className={styles.actionBtn}>Edit</button>
                                                    <span>|</span>
                                                    <button onClick={() => handleDelete(tag.id, tag.name)} className={`${styles.actionBtn} ${styles.deleteBtn}`}>Delete</button>
                                                </div>
                                            </td>
                                            <td>{tag.description || '—'}</td>
                                            <td className={styles.slugCell}>{tag.slug}</td>
                                            <td className={styles.countCell}>{tag.count || 0}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </section>
            </div>
        </div>
    );
}
