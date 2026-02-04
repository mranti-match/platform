'use client';

import { useState } from 'react';
import styles from '../app/(site)/blog/[slug]/page.module.css';

export default function ShareButton() {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <button
            className={styles.shareBtn}
            onClick={handleShare}
            title="Copy post URL to clipboard"
        >
            <span>{copied ? '✅' : '🔗'}</span>
            {copied ? 'Copied!' : 'Share'}
        </button>
    );
}
