'use client';

import { useState } from 'react';
import { RDProduct } from '@/lib/rd-products';
import { uploadFile } from '@/lib/storage';
import styles from './PostForm.module.css';

interface RDProductFormProps {
    initialData?: RDProduct | null;
    userId: string;
    onSubmit: (data: Omit<RDProduct, 'id' | 'createdAt'>) => Promise<void>;
    loading: boolean;
    title: string;
}

export default function RDProductForm({ initialData, userId, onSubmit, loading, title }: RDProductFormProps) {
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        product_name: initialData?.product_name || '',
        description: initialData?.description || '',
        cover_image: initialData?.cover_image || '',
        organization: initialData?.organization || 'Company' as 'Company' | 'University' | 'Personal',
        uvp: initialData?.uvp || '',
        market_target: initialData?.market_target || '',
        impact_industries: initialData?.impact_industries || [],
        other_industry: initialData?.other_industry || '',
        ip_type: (initialData?.ip_type as any) || 'No IP Yet',
        ip_number: initialData?.ip_number || '',
        trl: initialData?.trl || '',
        owner_id: initialData?.owner_id || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            alert('Image size exceeds 10MB limit. Please upload a smaller image.');
            return;
        }

        setUploading(true);
        try {
            // Path: users/{userId}/images/
            const path = `users/${userId}/images`;
            const downloadUrl = await uploadFile(file, path);
            setFormData(prev => ({ ...prev, cover_image: downloadUrl }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, cover_image: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData as any);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={styles.header}>
                <h1>{title}</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className={styles.btnPublish} disabled={loading || uploading}>
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </div>

            <div className={styles.formContainer}>
                <div className={styles.mainCol}>
                    <div className={styles.titleSection} style={{ position: 'relative' }}>
                        <input
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleChange}
                            className={styles.titleInput}
                            placeholder="R&D Product Name"
                            required
                        />
                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444', fontWeight: 'bold' }}>*</div>
                    </div>

                    <div className={styles.widget} style={{ marginBottom: '2rem' }}>
                        <div className={styles.widgetHeader}>Product Description <span style={{ color: '#ef4444' }}>*</span></div>
                        <div className={styles.widgetBody}>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Provide a detailed description of the technology..."
                                style={{ width: '100%', minHeight: '150px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.widget} style={{ marginBottom: '2rem' }}>
                        <div className={styles.widgetHeader}>Value Proposition & Market</div>
                        <div className={styles.widgetBody}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Unique Value Proposition (Short) <span style={{ color: '#ef4444' }}>*</span></label>
                                <textarea
                                    name="uvp"
                                    value={formData.uvp}
                                    onChange={handleChange}
                                    placeholder="What makes this product unique?"
                                    style={{ width: '100%', minHeight: '80px', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Potential Market Target or Applications <span style={{ color: '#ef4444' }}>*</span></label>
                                <textarea
                                    name="market_target"
                                    value={formData.market_target}
                                    onChange={handleChange}
                                    placeholder="Target industries, users, or specific use cases..."
                                    style={{ width: '100%', minHeight: '80px', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.widget} style={{ marginBottom: '2rem' }}>
                        <div className={styles.widgetHeader}>Potential Industries <span style={{ color: '#ef4444' }}>*</span></div>
                        <div className={styles.widgetBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {[
                                    'Healthcare', 'Agriculture', 'Smart City',
                                    'Smart Systems & Manufacturing', 'Energy',
                                    'Business Services', 'Education',
                                    'Environment & Biodiversity', 'Cultural & Tourisms'
                                ].map(industry => (
                                    <label key={industry} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.impact_industries.includes(industry)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    impact_industries: checked
                                                        ? [...prev.impact_industries, industry]
                                                        : prev.impact_industries.filter((i: string) => i !== industry)
                                                }));
                                            }}
                                        />
                                        {industry}
                                    </label>
                                ))}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.impact_industries.includes('Others')}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setFormData(prev => ({
                                                ...prev,
                                                impact_industries: checked
                                                    ? [...prev.impact_industries, 'Others']
                                                    : prev.impact_industries.filter((i: string) => i !== 'Others'),
                                                other_industry: checked ? prev.other_industry : ''
                                            }));
                                        }}
                                    />
                                    Others
                                </label>
                                {formData.impact_industries.includes('Others') && (
                                    <input
                                        type="text"
                                        name="other_industry"
                                        value={formData.other_industry}
                                        onChange={handleChange}
                                        placeholder="Please specify..."
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'white', marginTop: '0.25rem', fontSize: '0.85rem' }}
                                        required
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.widget}>
                        <div className={styles.widgetHeader}>General Info</div>
                        <div className={styles.widgetBody}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Organization Type <span style={{ color: '#ef4444' }}>*</span></label>
                                <select
                                    name="organization"
                                    value={formData.organization}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                                >
                                    <option value="Company">Company</option>
                                    <option value="University">University</option>
                                    <option value="Personal">Personal</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Technology Readiness Level (TRL) <span style={{ color: '#ef4444' }}>*</span></label>
                                <select
                                    name="trl"
                                    value={formData.trl}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                                    required
                                >
                                    <option value="" disabled>Choose your TRL</option>
                                    <option value="TRL 1 - Basic Principles Observed">TRL 1 - Basic Principles Observed</option>
                                    <option value="TRL 2 - Technology Concept Formulated">TRL 2 - Technology Concept Formulated</option>
                                    <option value="TRL 3 - Experimental Proof of Concept">TRL 3 - Experimental Proof of Concept</option>
                                    <option value="TRL 4 - Technology Validated in Lab">TRL 4 - Technology Validated in Lab</option>
                                    <option value="TRL 5 - Technology Validated in Relevant Environment">TRL 5 - Technology Validated in Relevant Environment</option>
                                    <option value="TRL 6 - Technology Demonstrated in Relevant Environment">TRL 6 - Technology Demonstrated in Relevant Environment</option>
                                    <option value="TRL 7 - System Prototype Demonstration in Operational Environment">TRL 7 - System Prototype Demonstration in Operational Environment</option>
                                    <option value="TRL 8 - System Complete and Qualified">TRL 8 - System Complete and Qualified</option>
                                    <option value="TRL 9 - Actual System Proven in Operational Environment">TRL 9 - Actual System Proven in Operational Environment</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>IP Status <span style={{ color: '#ef4444' }}>*</span></label>
                                <select
                                    name="ip_type"
                                    value={formData.ip_type}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                                >
                                    <option value="No IP Yet">No IP Yet</option>
                                    <option value="Patent">Patent</option>
                                    <option value="Copyright">Copyright</option>
                                    <option value="Design">Design</option>
                                    <option value="Trademark">Trademark</option>
                                    <option value="Trade Secret">Trade Secret</option>
                                </select>
                            </div>

                            {formData.ip_type !== 'No IP Yet' && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>IP Number <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        name="ip_number"
                                        value={formData.ip_number}
                                        onChange={handleChange}
                                        placeholder="Enter registration/application number"
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                                        required
                                    />
                                </div>
                            )}

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    Product Cover Image <span style={{ color: '#ef4444' }}>*</span>
                                </label>

                                {!formData.cover_image ? (
                                    <div style={{
                                        width: '100%',
                                        height: '120px',
                                        border: '2px dashed var(--border)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                opacity: 0,
                                                cursor: 'pointer',
                                                zIndex: 2
                                            }}
                                            disabled={uploading}
                                        />
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.5rem', color: 'var(--foreground-muted)' }}>
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>
                                            {uploading ? 'Uploading...' : 'Click to upload image'}
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={formData.cover_image}
                                            alt="Preview"
                                            style={{
                                                width: '100%',
                                                maxHeight: '180px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border)',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            style={{
                                                position: 'absolute',
                                                top: '-8px',
                                                right: '-8px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: '2px solid var(--surface)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                            }}
                                            title="Remove image"
                                        >
                                            ×
                                        </button>
                                        <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                            <label style={{
                                                fontSize: '0.7rem',
                                                color: 'var(--primary)',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                textDecoration: 'underline'
                                            }}>
                                                Replace Image
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    style={{ display: 'none' }}
                                                    disabled={uploading}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )}
                                <p style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                                    High-quality images help your product stand out. Supported: JPG, PNG, WEBP (Max 10MB).
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </form>
    );
}
