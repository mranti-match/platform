'use client';

import { useState, useEffect } from 'react';
import { Taxonomy, getCategories, createCategory, updateCategory, deleteCategory, generateSlug } from '@/lib/taxonomy';
import styles from '../taxonomy.module.css';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Taxonomy[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: ''
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
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
                await updateCategory(editingId, formData);
            } else {
                await createCategory(formData);
            }
            setFormData({ name: '', slug: '', description: '' });
            setEditingId(null);
            await loadCategories();
        } catch (error) {
            console.error('Failed to save category:', error);
            alert('Error saving category');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (category: Taxonomy) => {
        setEditingId(category.id);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await deleteCategory(id);
                await loadCategories();
            } catch (error) {
                console.error('Failed to delete category:', error);
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
                <h1>Categories</h1>
            </header>

            <div className={styles.layout}>
                {/* Left Column: Form */}
                <section className={styles.formSection}>
                    <h2>{editingId ? 'Edit Category' : 'Add New Category'}</h2>
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
                                {saving ? 'Saving...' : editingId ? 'Update Category' : 'Add New Category'}
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
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center' }}>No categories found.</td>
                                    </tr>
                                ) : (
                                    categories.map((category) => (
                                        <tr key={category.id}>
                                            <td>
                                                <div className={styles.taxonomyName}>{category.name}</div>
                                                <div className={styles.rowActions}>
                                                    <button onClick={() => handleEdit(category)} className={styles.actionBtn}>Edit</button>
                                                    <span>|</span>
                                                    <button onClick={() => handleDelete(category.id, category.name)} className={`${styles.actionBtn} ${styles.deleteBtn}`}>Delete</button>
                                                </div>
                                            </td>
                                            <td>{category.description || '—'}</td>
                                            <td className={styles.slugCell}>{category.slug}</td>
                                            <td className={styles.countCell}>{category.count || 0}</td>
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
