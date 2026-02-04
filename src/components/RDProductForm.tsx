'use client';

import { useState } from 'react';
import { RDProduct } from '@/lib/rd-products';
import { getDirectCloudImageUrl } from '@/lib/imageUtils';
import styles from './PostForm.module.css';

interface RDProductFormProps {
    initialData?: RDProduct | null;
    onSubmit: (data: Omit<RDProduct, 'id' | 'createdAt'>) => Promise<void>;
    loading: boolean;
    title: string;
}

export default function RDProductForm({ initialData, onSubmit, loading, title }: RDProductFormProps) {
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
        owner_id: initialData?.owner_id || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'cover_image') {
            const convertedUrl = getDirectCloudImageUrl(value);
            setFormData(prev => ({ ...prev, [name]: convertedUrl }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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
                    <button type="submit" className={styles.btnPublish} disabled={loading}>
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
                                style={{ width: '100%', minHeight: '150px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: '1rem' }}
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
                                    style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
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
                                    style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.widget} style={{ marginBottom: '2rem' }}>
                        <div className={styles.widgetHeader}>Impact Industries <span style={{ color: '#ef4444' }}>*</span></div>
                        <div className={styles.widgetBody}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>Select Potential Impact</label>
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
                                                        : prev.impact_industries.filter(i => i !== industry)
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
                                                    : prev.impact_industries.filter(i => i !== 'Others'),
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
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                >
                                    <option value="Company">Company</option>
                                    <option value="University">University</option>
                                    <option value="Personal">Personal</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>IP Status <span style={{ color: '#ef4444' }}>*</span></label>
                                <select
                                    name="ip_type"
                                    value={formData.ip_type}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
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
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                        required
                                    />
                                </div>
                            )}

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    Cover Image URL <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <p style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                                    Please provide a direct image link (URL). <strong>Google Drive</strong> and <strong>Dropbox</strong> share links are also supported and will be automatically converted.
                                </p>
                                <input
                                    type="text"
                                    name="cover_image"
                                    value={formData.cover_image}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    required
                                />
                                {formData.cover_image && (
                                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>Real-time Preview:</p>
                                        <img
                                            src={formData.cover_image}
                                            alt="Preview"
                                            referrerPolicy="no-referrer"
                                            style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', border: '1px solid var(--border)', objectFit: 'cover' }}
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                            onLoad={(e) => (e.currentTarget.style.display = 'block')}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </form>
    );
}
