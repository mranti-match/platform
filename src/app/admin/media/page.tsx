'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MediaFile, getAllMedia, deleteMedia } from '@/lib/media';
import adminStyles from '../admin.module.css';
import styles from './media.module.css';

export default function MediaLibrary() {
    const [media, setMedia] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [copyFeedback, setCopyFeedback] = useState(false);

    useEffect(() => {
        loadMedia();
    }, []);

    async function loadMedia() {
        setLoading(true);
        try {
            const data = await getAllMedia();
            setMedia(data);
        } catch (error) {
            console.error('Failed to load media:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    };

    const handleDelete = async (file: MediaFile) => {
        if (confirm(`Are you sure you want to delete ${file.name}?`)) {
            try {
                await deleteMedia(file.path);
                setMedia(media.filter(m => m.path !== file.path));
            } catch (error) {
                console.error('Failed to delete media:', error);
                alert('Error deleting file.');
            }
        }
    };

    return (
        <div className={adminStyles.container}>
            <div className={adminStyles.sectionHeader}>
                <h2 className={adminStyles.sectionTitle}>Media Library</h2>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Loading media files...</div>
            ) : media.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '12px' }}>
                    No media files found.
                </div>
            ) : (
                <div className={styles.mediaGrid}>
                    {media.map((file) => (
                        <div key={file.path} className={styles.mediaItem}>
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={file.url}
                                    alt={file.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                                <div className={styles.mediaActions}>
                                    <button
                                        onClick={() => handleCopyUrl(file.url)}
                                        className={styles.actionBtn}
                                        title="Copy URL"
                                    >
                                        🔗
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file)}
                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <div className={styles.mediaInfo}>
                                <div className={styles.mediaName}>{file.name}</div>
                                <div className={styles.mediaMeta}>
                                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                                    <span>{new Date(file.updated).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {copyFeedback && <div className={styles.copyFeedback}>Link copied to clipboard!</div>}
        </div>
    );
}
